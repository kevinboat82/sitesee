// routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

// @route   GET /api/dashboard
// @desc    Get all data for the user dashboard (Profile, Sub Status, Reports)
router.get('/', auth, async (req, res) => {
  try {
    // 1. Get User Details (Name)
    const userResult = await db.query(
      'SELECT first_name, last_name, email FROM users WHERE id = $1',
      [req.user.id]
    );

    // 2. Get Subscription Status
    const subResult = await db.query(
      `SELECT status, plan_type FROM subscriptions 
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    // 3. Get Scout Reports (Images)
    // NOTE: This joins the visit requests with a (future) report_images table
    // For now, we will return an empty list or mock data until we build the Scout App
    const reportsResult = await db.query(
        `SELECT * FROM visit_requests WHERE property_id IN 
        (SELECT id FROM properties WHERE user_id = $1)`,
        [req.user.id]
    );

    res.json({
      user: userResult.rows[0],
      subscription: subResult.rows[0] || { status: 'INACTIVE' },
      reports: reportsResult.rows // This will be the list of visits
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;