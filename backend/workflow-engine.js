const db = require('./database/config/database');

/**
 * Standalone Workflow Engine
 * Persists state transitions directly into MySQL Database.
 */
class WorkflowEngine {
    constructor() {
        this.workflows = {}; // Store workflow definitions (templates) in memory
    }

    /**
     * Define a new workflow template
     * @param {string} name - The name of the workflow
     * @param {Object} definition - The state definitions and transitions
     */
    defineWorkflow(name, definition) {
        if (!definition.initialState || !definition.states) {
            throw new Error("Workflow definition must contain 'initialState' and 'states'.");
        }
        this.workflows[name] = definition;
    }

    /**
     * Start a new workflow instance
     * @param {string} workflowName - The name of the workflow template
     * @param {string} instanceId - A unique ID for this instance (e.g., a document ID)
     * @param {Object} initialStateData - Initial payload data for the workflow
     * @returns {Object} The created workflow instance
     */
    async startWorkflow(workflowName, instanceId, initialStateData = {}) {
        const template = this.workflows[workflowName];
        if (!template) {
            throw new Error(`Workflow template '${workflowName}' not found.`);
        }

        const instance = {
            id: instanceId,
            workflowName: workflowName,
            currentState: template.initialState,
            status: 'ACTIVE',
            data: initialStateData
        };

        // Check if exists
        const [existing] = await db.execute('SELECT id FROM workflow_instances WHERE id = ?', [instanceId]);
        const rows = Array.isArray(existing) && Array.isArray(existing[0]) ? existing[0] : existing;
        if (rows && rows.length > 0) {
            throw new Error(`Workflow instance '${instanceId}' already exists.`);
        }

        // Insert into workflow_instances
        await db.execute(
            `INSERT INTO workflow_instances (id, workflow_name, current_state, status, payload_data)
             VALUES (?, ?, ?, ?, ?)`,
            [instance.id, instance.workflowName, instance.currentState, instance.status, JSON.stringify(instance.data)]
        );

        // Insert into history
        await db.execute(
            `INSERT INTO workflow_history (instance_id, previous_state, new_state, action, actor)
             VALUES (?, NULL, ?, 'START', 'system')`,
            [instance.id, instance.currentState]
        );

        return instance;
    }

    /**
     * Process an action on a workflow instance (e.g., APPROVE, REJECT)
     * @param {string} instanceId - The workflow instance ID
     * @param {string} action - The action being taken
     * @param {Object} actionData - Data associated with the action (e.g., comments)
     * @param {Object} userContext - Context of the user taking the action (e.g., { userId: 1, role: 'manager' })
     * @returns {Object} The updated workflow instance
     */
    async processAction(instanceId, action, actionData = {}, userContext = {}) {
        // Fetch instance
        let [rows] = await db.execute('SELECT * FROM workflow_instances WHERE id = ?', [instanceId]);
        if (!rows) throw new Error(`Workflow instance '${instanceId}' not found.`);
        
        // Handle different return types of db.execute
        let instanceRow = rows;
        if (Array.isArray(rows) && Array.isArray(rows[0])) {
             instanceRow = rows[0][0]; // nested array from connection.query
        } else if (Array.isArray(rows) && rows.length > 0) {
             instanceRow = rows[0];
        } else {
             throw new Error(`Workflow instance '${instanceId}' not found.`);
        }

        if (!instanceRow || !instanceRow.id) throw new Error(`Workflow instance '${instanceId}' not found.`);

        if (instanceRow.status !== 'ACTIVE') {
            throw new Error(`Workflow instance '${instanceId}' is not active (Status: ${instanceRow.status}).`);
        }

        const template = this.workflows[instanceRow.workflow_name];
        if (!template) throw new Error(`Workflow template '${instanceRow.workflow_name}' not found.`);
        
        const stateDef = template.states[instanceRow.current_state];
        if (!stateDef) throw new Error(`State '${instanceRow.current_state}' not defined in workflow '${instanceRow.workflow_name}'.`);

        const transition = stateDef.transitions ? stateDef.transitions[action] : null;
        
        if (!transition) {
            throw new Error(`Action '${action}' is not valid for the current state '${instanceRow.current_state}'.`);
        }

        // 1. Check Permissions (if defined in the transition)
        if (transition.allowedRoles && userContext.role) {
            if (!transition.allowedRoles.includes(userContext.role)) {
                throw new Error(`User role '${userContext.role}' is not authorized to perform '${action}' from '${instanceRow.current_state}'.`);
            }
        }
        
        // Parse payload (MySQL returns JSON as object in some drivers, string in others)
        let payload = instanceRow.payload_data || {};
        if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch (e) {}
        }

        // 2. Execute condition checking (if defined)
        if (transition.condition && typeof transition.condition === 'function') {
             const canProceed = await transition.condition(payload, actionData, userContext);
             if(!canProceed) {
                 throw new Error(`Conditions not met for action '${action}'.`);
             }
        }

        // 3. Execute pre-transition hooks/actions (if defined)
        if (transition.onTransition && typeof transition.onTransition === 'function') {
            await transition.onTransition(payload, actionData, userContext);
        }

        // 4. Update State
        const previousState = instanceRow.current_state;
        const newState = transition.to;
        const newPayload = { ...payload, ...actionData };
        
        let newStatus = 'ACTIVE';
        if (template.states[newState] && template.states[newState].isEndState) {
            newStatus = 'COMPLETED';
        }

        // 5. Save changes to DB
        await db.execute(
            `UPDATE workflow_instances SET current_state = ?, status = ?, payload_data = ? WHERE id = ?`,
            [newState, newStatus, JSON.stringify(newPayload), instanceId]
        );
        
        // 6. Record History
        await db.execute(
            `INSERT INTO workflow_history (instance_id, previous_state, new_state, action, actor, comments)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [instanceId, previousState, newState, action, userContext.userId || 'system', actionData.comments || null]
        );

        return {
            id: instanceId,
            workflowName: instanceRow.workflow_name,
            currentState: newState,
            status: newStatus,
            data: newPayload
        };
    }
    
    /**
     * Get the current state and history of an instance
     * @param {string} instanceId 
     * @returns {Object} Workflow instance details
     */
    async getInstanceStatus(instanceId) {
        let [instanceRows] = await db.execute('SELECT * FROM workflow_instances WHERE id = ?', [instanceId]);
        
        let instance = instanceRows;
        if (Array.isArray(instanceRows) && Array.isArray(instanceRows[0])) {
             instance = instanceRows[0][0]; 
        } else if (Array.isArray(instanceRows) && instanceRows.length > 0) {
             instance = instanceRows[0];
        }

        if (!instance || !instance.id) return null;

        let [historyRows] = await db.execute('SELECT * FROM workflow_history WHERE instance_id = ? ORDER BY timestamp ASC', [instanceId]);
        if (Array.isArray(historyRows) && Array.isArray(historyRows[0])) {
            historyRows = historyRows[0];
        }

        let payload = instance.payload_data;
        if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch(e) {}
        }

        return {
            id: instance.id,
            workflowName: instance.workflow_name,
            currentState: instance.current_state,
            status: instance.status,
            data: payload,
            createdAt: instance.created_at,
            updatedAt: instance.updated_at,
            history: historyRows || []
        };
    }
}

module.exports = WorkflowEngine;
