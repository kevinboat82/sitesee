// routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

router.get('/', auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(500).json({ error: "User missing from token" });
    }

    // 1. Get User
    const userResult = await db.query(
      'SELECT full_name, email FROM users WHERE id = $1',
      [req.user.id]
    );
    
    // 2. Get Subscription
    let subData = { status: 'INACTIVE' };
    const subResult = await db.query(
        `SELECT status, plan_type FROM subscriptions 
            WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [req.user.id]
    );
    if (subResult.rows.length > 0) subData = subResult.rows[0];

    // 3. Get Properties (NEW STEP!)
    const propsResult = await db.query(
        'SELECT * FROM properties WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
    );

    // 4. Get Reports
    const reportsResult = await db.query(
        `SELECT * FROM visit_requests WHERE property_id IN 
        (SELECT id FROM properties WHERE user_id = $1)`,
        [req.user.id]
    );

    // Send everything to frontend
    res.json({
      user: userResult.rows[0],
      subscription: subData,
      properties: propsResult.rows, // <--- Sent to frontend
      reports: reportsResult.rows
    });

  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;