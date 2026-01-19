// routes/activity.js - Activity Feed API
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

// @route   GET /api/activity
// @desc    Get activity feed for user's properties
router.get('/', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const activities = await db.query(`
      SELECT af.*, p.name as property_name
      FROM activity_feed af
      JOIN properties p ON af.property_id = p.id
      WHERE af.user_id = $1
      ORDER BY af.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);

        res.json(activities.rows);
    } catch (err) {
        console.error('Activity Feed Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/activity
// @desc    Create activity entry (internal use)
router.post('/', auth, async (req, res) => {
    const { property_id, action_type, title, description, metadata } = req.body;

    try {
        const activity = await db.query(`
      INSERT INTO activity_feed (user_id, property_id, action_type, title, description, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.user.id, property_id, action_type, title, description, metadata]);

        res.json(activity.rows[0]);
    } catch (err) {
        console.error('Create Activity Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// Helper function to create activity (can be imported by other routes)
const createActivity = async (userId, propertyId, actionType, title, description, metadata = {}) => {
    try {
        await db.query(`
      INSERT INTO activity_feed (user_id, property_id, action_type, title, description, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, propertyId, actionType, title, description, metadata]);
    } catch (err) {
        console.error('Activity creation failed:', err.message);
    }
};

module.exports = router;
module.exports.createActivity = createActivity;
