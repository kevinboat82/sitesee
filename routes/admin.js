const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const verifyAdmin = require('../middleware/adminMiddleware');
const db = require('../config/db');

// @route   GET /api/admin/stats
// @desc    Get dashboard overview stats
router.get('/stats', auth, verifyAdmin, async (req, res) => {
    try {
        // 1. Total Scouts
        const scouts = await db.query("SELECT COUNT(*) FROM users WHERE role = 'SCOUT'");

        // 2. Total Clients
        const clients = await db.query("SELECT COUNT(*) FROM users WHERE role = 'CLIENT'");

        // 3. Total Visits (Completed vs Pending)
        const visits = await db.query(`
        SELECT 
            COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
            COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
            COUNT(*) as total
        FROM visit_requests
    `);

        // 4. Revenue (Simple estimation based on completed visits * 50 for now, or fetch from payments if stored)
        // For now, let's just count completed visits * 50 GHS + Active Subscriptions * 50 GHS
        const revenue = await db.query(`
        SELECT 
           (SELECT COUNT(*) FROM visit_requests WHERE status = 'COMPLETED') * 50 
           + 
           (SELECT COUNT(*) FROM subscriptions WHERE status = 'ACTIVE') * 50 
        as total_revenue
    `);

        res.json({
            totalScouts: parseInt(scouts.rows[0].count),
            totalClients: parseInt(clients.rows[0].count),
            visits: visits.rows[0],
            revenue: parseInt(revenue.rows[0].total_revenue) || 0
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/users
// @desc    Get all users list
router.get('/users', auth, verifyAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, full_name, email, phone_number, role, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/visits
// @desc    Get all visits with details
router.get('/visits', auth, verifyAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT vr.id, vr.status, vr.scheduled_date, vr.created_at,
                   p.name as property_name, p.address,
                   u.full_name as client_name,
                   s.full_name as scout_name,
                   vr.instructions
            FROM visit_requests vr
            JOIN properties p ON vr.property_id = p.id
            JOIN users u ON vr.user_id = u.id
            LEFT JOIN users s ON vr.assigned_scout_id = s.id
            ORDER BY vr.scheduled_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/disputes
// @desc    Get all disputes for admin review
router.get('/disputes', auth, verifyAdmin, async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT d.*,
                   p.name as property_name, p.address,
                   vr.scheduled_date,
                   reporter.full_name as reporter_name, reporter.email as reporter_email,
                   scout.full_name as scout_name,
                   client.full_name as client_name,
                   resolver.full_name as resolved_by_name
            FROM disputes d
            JOIN visit_requests vr ON d.visit_id = vr.id
            JOIN properties p ON vr.property_id = p.id
            JOIN users reporter ON d.reporter_id = reporter.id
            LEFT JOIN users scout ON vr.assigned_scout_id = scout.id
            JOIN users client ON p.user_id = client.id
            LEFT JOIN users resolver ON d.resolved_by = resolver.id
        `;

        const params = [];
        if (status) {
            query += ` WHERE d.status = $1`;
            params.push(status);
        }

        query += ` ORDER BY d.created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Admin Disputes Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/disputes/:id
// @desc    Update dispute status (resolve, close, etc.)
router.put('/disputes/:id', auth, verifyAdmin, async (req, res) => {
    const { status, resolution } = req.body;

    if (!status) {
        return res.status(400).json({ msg: 'Status is required' });
    }

    try {
        const validStatuses = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const update = await db.query(
            `UPDATE disputes 
             SET status = $1, 
                 resolution = COALESCE($2, resolution),
                 resolved_by = $3,
                 resolved_at = CASE WHEN $1 IN ('RESOLVED', 'CLOSED') THEN NOW() ELSE resolved_at END
             WHERE id = $4
             RETURNING *`,
            [status, resolution, req.user.id, req.params.id]
        );

        if (update.rows.length === 0) {
            return res.status(404).json({ msg: 'Dispute not found' });
        }

        res.json({ msg: 'Dispute updated', dispute: update.rows[0] });
    } catch (err) {
        console.error('Update Dispute Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/disputes/stats
// @desc    Get dispute statistics
router.get('/disputes/stats', auth, verifyAdmin, async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) FILTER (WHERE status = 'OPEN') as open_count,
                COUNT(*) FILTER (WHERE status = 'IN_REVIEW') as in_review_count,
                COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved_count,
                COUNT(*) FILTER (WHERE status = 'CLOSED') as closed_count,
                COUNT(*) as total
            FROM disputes
        `);

        res.json(stats.rows[0]);
    } catch (err) {
        console.error('Dispute Stats Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
