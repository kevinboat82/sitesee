// routes/disputes.js - Dispute Resolution API
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

// Dispute reason categories
const DISPUTE_REASONS = {
    CLIENT: [
        { value: 'incomplete_work', label: 'Incomplete Work' },
        { value: 'poor_quality', label: 'Poor Quality Photos/Videos' },
        { value: 'wrong_location', label: 'Wrong Location Visited' },
        { value: 'scout_behavior', label: 'Unprofessional Behavior' },
        { value: 'late_delivery', label: 'Late Submission' },
        { value: 'other', label: 'Other Issue' }
    ],
    SCOUT: [
        { value: 'wrong_address', label: 'Client Provided Wrong Address' },
        { value: 'unclear_instructions', label: 'Unclear Instructions' },
        { value: 'unsafe_location', label: 'Unsafe Location' },
        { value: 'no_access', label: 'Could Not Access Property' },
        { value: 'client_unresponsive', label: 'Client Unresponsive' },
        { value: 'other', label: 'Other Issue' }
    ]
};

// @route   GET /api/disputes/reasons
// @desc    Get dispute reason options
router.get('/reasons', auth, (req, res) => {
    res.json(DISPUTE_REASONS);
});

// @route   POST /api/disputes
// @desc    Create a new dispute
router.post('/', auth, async (req, res) => {
    const { visit_id, reason, description } = req.body;

    if (!visit_id || !reason || !description) {
        return res.status(400).json({ msg: 'Visit ID, reason, and description are required' });
    }

    try {
        // Verify the visit exists and user has permission
        const visit = await db.query(
            `SELECT vr.*, p.user_id as property_owner_id 
       FROM visit_requests vr
       JOIN properties p ON vr.property_id = p.id
       WHERE vr.id = $1`,
            [visit_id]
        );

        if (visit.rows.length === 0) {
            return res.status(404).json({ msg: 'Visit not found' });
        }

        const visitData = visit.rows[0];
        const isClient = visitData.property_owner_id === req.user.id;
        const isScout = visitData.assigned_scout_id === req.user.id;

        if (!isClient && !isScout) {
            return res.status(403).json({ msg: 'You are not authorized to dispute this visit' });
        }

        // Check if a dispute already exists for this visit from this user
        const existing = await db.query(
            `SELECT * FROM disputes WHERE visit_id = $1 AND reporter_id = $2`,
            [visit_id, req.user.id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ msg: 'You have already filed a dispute for this visit' });
        }

        // Create the dispute
        const dispute = await db.query(
            `INSERT INTO disputes (visit_id, reporter_id, reporter_role, reason, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [visit_id, req.user.id, isClient ? 'CLIENT' : 'SCOUT', reason, description]
        );

        res.json({ msg: 'Dispute submitted successfully', dispute: dispute.rows[0] });
    } catch (err) {
        console.error('Dispute Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/disputes
// @desc    Get user's disputes
router.get('/', auth, async (req, res) => {
    try {
        const disputes = await db.query(
            `SELECT d.*, 
              p.name as property_name,
              vr.scheduled_date,
              u.full_name as resolved_by_name
       FROM disputes d
       JOIN visit_requests vr ON d.visit_id = vr.id
       JOIN properties p ON vr.property_id = p.id
       LEFT JOIN users u ON d.resolved_by = u.id
       WHERE d.reporter_id = $1
       ORDER BY d.created_at DESC`,
            [req.user.id]
        );

        res.json(disputes.rows);
    } catch (err) {
        console.error('Fetch Disputes Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/disputes/:id
// @desc    Get single dispute details
router.get('/:id', auth, async (req, res) => {
    try {
        const dispute = await db.query(
            `SELECT d.*,
              p.name as property_name, p.address,
              vr.scheduled_date, vr.status as visit_status, vr.instructions,
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
       WHERE d.id = $1`,
            [req.params.id]
        );

        if (dispute.rows.length === 0) {
            return res.status(404).json({ msg: 'Dispute not found' });
        }

        // Only allow reporter or admin to view
        if (dispute.rows[0].reporter_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        res.json(dispute.rows[0]);
    } catch (err) {
        console.error('Fetch Dispute Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
