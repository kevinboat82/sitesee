// routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

router.get('/', auth, async (req, res) => {
  try {
    // --- SAFETY CHECK ---
    if (!req.user) {
      return res.status(500).json({ error: "Server Error: User data missing from token" });
    }

    // 1. Get User Details (Fix: Use 'full_name' instead of first/last)
    const userResult = await db.query(
      'SELECT full_name, email FROM users WHERE id = $1',
      [req.user.id]
    );

    // 2. Get Subscription Status
    const subResult = await db.query(
      `SELECT status, plan_type FROM subscriptions 
       WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    // 3. Get Scout Reports
    const reportsResult = await db.query(
        `SELECT * FROM visit_requests WHERE property_id IN 
        (SELECT id FROM properties WHERE user_id = $1)`,
        [req.user.id]
    );

    res.json({
      user: userResult.rows[0],
      subscription: subResult.rows[0] || { status: 'INACTIVE' },
      reports: reportsResult.rows 
    });

  } catch (err) {
    console.error("Dashboard Route Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;