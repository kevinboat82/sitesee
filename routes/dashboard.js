// routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

console.log("--- Dashboard Route File Loaded ---");

router.get('/', auth, async (req, res) => {
  console.log("Dashboard: Request Received");

  try {
    // Safety Check 1: User ID
    if (!req.user || !req.user.id) {
      console.log("Dashboard Error: No User ID in token");
      return res.status(500).json({ error: "User missing from token" });
    }
    console.log("Dashboard: Fetching data for User ID:", req.user.id);

    // Step 1: Get User
    // Note: We are using 'full_name' because we know that's what your DB has
    const userResult = await db.query(
      'SELECT full_name, email FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
        console.log("Dashboard Error: User ID not found in DB");
        return res.status(404).json({ error: "User not found" });
    }
    console.log("Dashboard: User Found ->", userResult.rows[0]);

    // Step 2: Get Subscription (Handle if table is missing or empty)
    let subData = { status: 'INACTIVE' };
    try {
        const subResult = await db.query(
            `SELECT status, plan_type FROM subscriptions 
             WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
            [req.user.id]
        );
        if (subResult.rows.length > 0) subData = subResult.rows[0];
        console.log("Dashboard: Subscription fetched");
    } catch (subErr) {
        console.log("Dashboard Warning: Could not fetch subscription (Table might be missing):", subErr.message);
        // We do not crash here, just keep going with default INACTIVE
    }

    // Step 3: Get Reports (Handle if table is missing)
    let reportData = [];
    try {
        const reportsResult = await db.query(
            `SELECT * FROM visit_requests WHERE property_id IN 
            (SELECT id FROM properties WHERE user_id = $1)`,
            [req.user.id]
        );
        reportData = reportsResult.rows;
        console.log("Dashboard: Reports fetched");
    } catch (repErr) {
        console.log("Dashboard Warning: Could not fetch reports:", repErr.message);
    }

    // Send Response
    res.json({
      user: userResult.rows[0],
      subscription: subData,
      reports: reportData
    });

  } catch (err) {
    console.error("CRITICAL DASHBOARD ERROR:", err.message);
    res.status(500).send('Server Error: ' + err.message);
  }
});

module.exports = router;