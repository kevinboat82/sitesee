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
      'SELECT full_name, email, role FROM users WHERE id = $1',
      [req.user.id]
    );

    // 2. Get Properties WITH their specific subscription status
    // We use a LEFT JOIN to see if there is an ACTIVE subscription for each property
    const propsResult = await db.query(
      `SELECT p.*, 
                COALESCE(s.status, 'INACTIVE') as sub_status,
                s.end_date as sub_end_date
         FROM properties p
         LEFT JOIN subscriptions s 
         ON p.id = s.property_id AND s.status = 'ACTIVE'
         WHERE p.user_id = $1 
         ORDER BY p.created_at DESC`,
      [req.user.id]
    );

    // 3. Get Reports
    const reportsResult = await db.query(
      `SELECT * FROM visit_requests WHERE property_id IN 
        (SELECT id FROM properties WHERE user_id = $1)`,
      [req.user.id]
    );

    res.json({
      user: userResult.rows[0],
      properties: propsResult.rows, // Now includes 'sub_status' for each property
      reports: reportsResult.rows
    });

  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;