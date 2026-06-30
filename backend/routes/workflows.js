const express = require('express');
const router = express.Router();
const WorkflowEngine = require('../../workflow-engine'); // using the standalone file

// Instantiate a global workflow engine
// Note: Since this is in-memory, state will reset on server restart.
// To fully persist, you would integrate this with the MySQL database.
const engine = new WorkflowEngine();

// --- Example Pre-defined Workflow ---
// We can define a default workflow for demonstration purposes
engine.defineWorkflow('DocumentApproval', {
    initialState: 'DRAFT',
    states: {
        'DRAFT': {
            transitions: {
                'SUBMIT': { to: 'PENDING_APPROVAL' }
            }
        },
        'PENDING_APPROVAL': {
            transitions: {
                'APPROVE': { 
                    to: 'APPROVED',
                    onTransition: (data, actionData, userContext) => {
                        console.log(`[Workflow] Document approved by ${userContext.userId}`);
                    }
                },
                'REJECT': { to: 'REJECTED' },
                'REQUEST_CHANGES': { to: 'DRAFT' }
            }
        },
        'APPROVED': { isEndState: true },
        'REJECTED': { isEndState: true }
    }
});
// -------------------------------------

/**
 * @route POST /api/workflows/start
 * @desc Start a new workflow instance
 */
router.post('/start', async (req, res) => {
    try {
        const { workflowName, instanceId, initialData } = req.body;
        
        if (!workflowName || !instanceId) {
            return res.status(400).json({ error: 'workflowName and instanceId are required.' });
        }

        const instance = await engine.startWorkflow(workflowName, instanceId, initialData || {});
        res.status(201).json({ message: 'Workflow started successfully.', instance });
    } catch (error) {
        console.error('Error starting workflow:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/workflows/:id/action
 * @desc Process an action on a workflow instance
 */
router.post('/:id/action', async (req, res) => {
    try {
        const instanceId = req.params.id;
        const { action, actionData, userContext } = req.body;

        if (!action) {
            return res.status(400).json({ error: 'Action is required.' });
        }

        // Default user context if not provided (for demonstration)
        const context = userContext || { userId: 'system', role: 'admin' };

        const updatedInstance = await engine.processAction(instanceId, action, actionData, context);
        res.status(200).json({ message: `Action '${action}' processed successfully.`, instance: updatedInstance });
    } catch (error) {
        console.error(`Error processing action on workflow ${req.params.id}:`, error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route GET /api/workflows/:id
 * @desc Get the current status and history of a workflow instance
 */
router.get('/:id', async (req, res) => {
    try {
        const instanceId = req.params.id;
        const status = await engine.getInstanceStatus(instanceId);
        
        if (!status) {
            return res.status(404).json({ error: `Workflow instance '${instanceId}' not found.` });
        }

        res.status(200).json(status);
    } catch (error) {
        console.error(`Error fetching workflow ${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
