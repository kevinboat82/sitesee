// routes/profile.js - User Profile API
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

// @route   GET /api/profile
// @desc    Get current user's profile
router.get('/', auth, async (req, res) => {
    try {
        const user = await db.query(`
      SELECT id, email, full_name, phone_number, role, created_at,
             bio, location, profile_image
      FROM users WHERE id = $1
    `, [req.user.id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get additional stats based on role
        let stats = {};

        if (req.user.role === 'SCOUT') {
            const scoutStats = await db.query(`
        SELECT 
          COUNT(*) as jobs_completed,
          COALESCE(AVG(client_rating), 0) as avg_rating,
          (SELECT COUNT(*) FROM scout_achievements WHERE scout_id = $1) as badges_earned
        FROM visit_requests
        WHERE assigned_scout_id = $1 AND status = 'COMPLETED'
      `, [req.user.id]);
            stats = scoutStats.rows[0];
        } else if (req.user.role === 'CLIENT') {
            const clientStats = await db.query(`
        SELECT 
          COUNT(*) as total_properties,
          (SELECT COUNT(*) FROM subscriptions s 
           JOIN properties p ON s.property_id = p.id 
           WHERE p.user_id = $1 AND s.status = 'ACTIVE') as active_subscriptions
        FROM properties WHERE user_id = $1
      `, [req.user.id]);
            stats = clientStats.rows[0];
        }

        res.json({ ...user.rows[0], stats });
    } catch (err) {
        console.error('Profile Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/profile
// @desc    Update current user's profile
router.put('/', auth, async (req, res) => {
    const { full_name, phone_number, bio, location, profile_image } = req.body;

    try {
        const updated = await db.query(`
      UPDATE users 
      SET full_name = COALESCE($1, full_name),
          phone_number = COALESCE($2, phone_number),
          bio = COALESCE($3, bio),
          location = COALESCE($4, location),
          profile_image = COALESCE($5, profile_image)
      WHERE id = $6
      RETURNING id, email, full_name, phone_number, role, bio, location, profile_image
    `, [full_name, phone_number, bio, location, profile_image, req.user.id]);

        res.json(updated.rows[0]);
    } catch (err) {
        console.error('Profile Update Error:', err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/profile/:id
// @desc    Get public profile of any user (limited info)
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await db.query(`
      SELECT id, full_name, role, bio, location, profile_image, created_at
      FROM users WHERE id = $1
    `, [req.params.id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const profile = user.rows[0];

        // Get public stats based on role
        if (profile.role === 'SCOUT') {
            const stats = await db.query(`
        SELECT 
          COUNT(*) as jobs_completed,
          COALESCE(AVG(client_rating), 0) as avg_rating,
          (SELECT COUNT(*) FROM scout_achievements WHERE scout_id = $1) as badges_earned
        FROM visit_requests
        WHERE assigned_scout_id = $1 AND status = 'COMPLETED'
      `, [req.params.id]);

            // Get achievements
            const achievements = await db.query(`
        SELECT a.name, a.icon, a.description
        FROM scout_achievements sa
        JOIN achievements a ON sa.achievement_id = a.id
        WHERE sa.scout_id = $1
        ORDER BY sa.earned_at DESC
        LIMIT 5
      `, [req.params.id]);

            profile.stats = stats.rows[0];
            profile.achievements = achievements.rows;
        }

        res.json(profile);
    } catch (err) {
        console.error('Public Profile Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
