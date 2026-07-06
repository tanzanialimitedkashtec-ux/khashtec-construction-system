const notify = require('../utils/notify');
const express = require('express');

const router = express.Router();

const db = require('../src/config/database');



router.get('/', async (req, res) => {

    res.json({

        success: true,

        message: 'Team management API is running',

        endpoints: {

            teams: {

                list: 'GET /api/team-management/teams',

                create: 'POST /api/team-management/teams',

                get: 'GET /api/team-management/teams/:id',

                update: 'PUT /api/team-management/teams/:id',

                delete: 'DELETE /api/team-management/teams/:id'

            },

            members: {

                list: 'GET /api/team-management/teams/:id/members',

                add: 'POST /api/team-management/teams/:id/members',

                update: 'PUT /api/team-management/teams/:id/members/:memberId',

                remove: 'DELETE /api/team-management/teams/:id/members/:memberId'

            }

        }

    });

});



router.get('/teams', async (req, res) => {

    try {

        const [teams] = await db.execute(`

            SELECT 

                t.*,

                ed.full_name AS leader_name,

                e.department AS leader_department,

                (

                    SELECT COUNT(*)

                    FROM team_members tm

                    WHERE tm.team_id = t.id AND tm.status = 'Active'

                ) AS member_count

            FROM teams t

            LEFT JOIN employees e ON t.leader_employee_id = e.id

            LEFT JOIN employee_details ed ON e.id = ed.employee_id

            ORDER BY t.created_at DESC

        `);



        res.json({ success: true, data: teams });

    } catch (error) {

        console.error('Error fetching teams:', error);

        res.status(500).json({ success: false, error: 'Failed to fetch teams' });

    }

});



router.get('/teams/:id', async (req, res) => {

    try {

        const { id } = req.params;



        const [teams] = await db.execute(`

            SELECT 

                t.*,

                ed.full_name AS leader_name,

                e.department AS leader_department

            FROM teams t

            LEFT JOIN employees e ON t.leader_employee_id = e.id

            LEFT JOIN employee_details ed ON e.id = ed.employee_id

            WHERE t.id = ?

            LIMIT 1

        `, [id]);



        if (!teams || teams.length === 0) {

            return res.status(404).json({ success: false, error: 'Team not found' });

        }



        res.json({ success: true, data: teams[0] });

    } catch (error) {

        console.error('Error fetching team:', error);

        res.status(500).json({ success: false, error: 'Failed to fetch team' });

    }

});



router.post('/teams', async (req, res) => {

    try {

        const {

            name,

            department,

            description,

            leaderEmployeeId,

            status,

            createdBy

        } = req.body;



        if (!name) {

            return res.status(400).json({ success: false, error: 'Required field: name' });

        }



        const teamStatus = status || 'Active';

        const leaderId = leaderEmployeeId || null;

        const createdByUserId = createdBy || null;



        const [result] = await db.execute(`

            INSERT INTO teams (name, department, description, leader_employee_id, status, created_by)

            VALUES (?, ?, ?, ?, ?, ?)

        `, [name, department || null, description || null, leaderId, teamStatus, createdByUserId]);



        const [createdRows] = await db.execute('SELECT * FROM teams WHERE id = ?', [result.insertId]);



        notify('Team Management', 'New team "' + name + '" created in ' + (department || 'unspecified') + ' department', 'info', 'MD', 'HR Department');
        res.json({ success: true, data: createdRows[0] });

    } catch (error) {

        console.error('Error creating team:', error);

        res.status(500).json({ success: false, error: 'Failed to create team' });

    }

});



router.put('/teams/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const {

            name,

            department,

            description,

            leaderEmployeeId,

            status

        } = req.body;



        const [existing] = await db.execute('SELECT id FROM teams WHERE id = ?', [id]);

        if (!existing || existing.length === 0) {

            return res.status(404).json({ success: false, error: 'Team not found' });

        }



        await db.execute(`

            UPDATE teams

            SET name = ?, department = ?, description = ?, leader_employee_id = ?, status = ?

            WHERE id = ?

        `, [

            name || null,

            department || null,

            description || null,

            leaderEmployeeId || null,

            status || 'Active',

            id

        ]);



        const [updatedRows] = await db.execute('SELECT * FROM teams WHERE id = ?', [id]);

        notify('Team Management', 'Team "' + (name || 'ID:' + id) + '" updated' + (department ? ' in ' + department + ' department' : ''), 'info', 'MD', 'HR Department');
        res.json({ success: true, data: updatedRows[0] });

    } catch (error) {

        console.error('Error updating team:', error);

        res.status(500).json({ success: false, error: 'Failed to update team' });

    }

});



router.delete('/teams/:id', async (req, res) => {

    try {

        const { id } = req.params;



        const [result] = await db.execute('DELETE FROM teams WHERE id = ?', [id]);



        if (!result || result.affectedRows === 0) {

            return res.status(404).json({ success: false, error: 'Team not found' });

        }



        notify('Team Management', 'Team ID:' + id + ' has been deleted', 'warning', 'MD', 'HR Department');
        res.json({ success: true, message: 'Team deleted successfully' });

    } catch (error) {

        console.error('Error deleting team:', error);

        res.status(500).json({ success: false, error: 'Failed to delete team' });

    }

});



router.get('/teams/:id/members', async (req, res) => {

    try {

        const { id } = req.params;



        const [members] = await db.execute(`

            SELECT 

                tm.id,

                tm.team_id,

                tm.employee_id,

                tm.member_role,

                tm.status,

                tm.joined_at,

                e.employee_id AS employee_code,

                e.department,

                e.position,

                ed.full_name,

                ed.gmail,

                ed.phone

            FROM team_members tm

            INNER JOIN employees e ON tm.employee_id = e.id

            LEFT JOIN employee_details ed ON e.id = ed.employee_id

            WHERE tm.team_id = ?

            ORDER BY tm.joined_at DESC

        `, [id]);



        res.json({ success: true, data: members });

    } catch (error) {

        console.error('Error fetching team members:', error);

        res.status(500).json({ success: false, error: 'Failed to fetch team members' });

    }

});



router.post('/teams/:id/members', async (req, res) => {

    try {

        const { id } = req.params;

        const { employeeId, memberRole, status } = req.body;



        if (!employeeId) {

            return res.status(400).json({ success: false, error: 'Required field: employeeId' });

        }



        const [teamRows] = await db.execute('SELECT id FROM teams WHERE id = ?', [id]);

        if (!teamRows || teamRows.length === 0) {

            return res.status(404).json({ success: false, error: 'Team not found' });

        }



        const [result] = await db.execute(`

            INSERT INTO team_members (team_id, employee_id, member_role, status)

            VALUES (?, ?, ?, ?)

        `, [id, employeeId, memberRole || null, status || 'Active']);



        const [createdRows] = await db.execute('SELECT * FROM team_members WHERE id = ?', [result.insertId]);

        notify('Team Management', 'New member (Employee #' + employeeId + ') added to team #' + id + (memberRole ? ' as ' + memberRole : ''), 'info', 'MD', 'HR Department');
        res.json({ success: true, data: createdRows[0] });

    } catch (error) {

        if (error && (error.code === 'ER_DUP_ENTRY' || (typeof error.message === 'string' && error.message.includes('unique_team_member')))) {

            return res.status(409).json({ success: false, error: 'Employee is already a member of this team' });

        }



        console.error('Error adding team member:', error);

        res.status(500).json({ success: false, error: 'Failed to add team member' });

    }

});



router.put('/teams/:id/members/:memberId', async (req, res) => {

    try {

        const { id, memberId } = req.params;

        const { memberRole, status } = req.body;



        const [existing] = await db.execute('SELECT id FROM team_members WHERE id = ? AND team_id = ?', [memberId, id]);

        if (!existing || existing.length === 0) {

            return res.status(404).json({ success: false, error: 'Team member not found' });

        }



        await db.execute(`

            UPDATE team_members

            SET member_role = ?, status = ?

            WHERE id = ? AND team_id = ?

        `, [memberRole || null, status || 'Active', memberId, id]);



        const [updatedRows] = await db.execute('SELECT * FROM team_members WHERE id = ?', [memberId]);

        notify('Team Management', 'Team member #' + memberId + ' role updated' + (memberRole ? ' to ' + memberRole : '') + ' in team #' + id, 'info', 'MD', 'HR Department');
        res.json({ success: true, data: updatedRows[0] });

    } catch (error) {

        console.error('Error updating team member:', error);

        res.status(500).json({ success: false, error: 'Failed to update team member' });

    }

});



router.delete('/teams/:id/members/:memberId', async (req, res) => {

    try {

        const { id, memberId } = req.params;



        const [result] = await db.execute('DELETE FROM team_members WHERE id = ? AND team_id = ?', [memberId, id]);



        if (!result || result.affectedRows === 0) {

            return res.status(404).json({ success: false, error: 'Team member not found' });

        }



        notify('Team Management', 'Member #' + memberId + ' removed from team #' + id, 'warning', 'MD', 'HR Department');
        res.json({ success: true, message: 'Team member removed successfully' });

    } catch (error) {

        console.error('Error removing team member:', error);

        res.status(500).json({ success: false, error: 'Failed to remove team member' });

    }

});



module.exports = router;
