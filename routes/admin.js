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

module.exports = router;
