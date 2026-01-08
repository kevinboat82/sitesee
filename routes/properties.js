// routes/properties.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 
const db = require('../config/db');

// @route   POST /api/properties
// @desc    Add a new property
router.post('/', auth, async (req, res) => {
  // 1. Accept the exact fields from the Frontend form
  const { name, address, description, google_maps_link } = req.body;

  try {
    // 2. Validation: Ensure required fields are there
    if (!name || !address) {
      return res.status(400).json({ error: "Name and Address are required" });
    }

    // 3. Insert into DB (Using 'user_id' to match Dashboard)
    // FIX: Changed owner_id -> user_id
    // FIX: Changed gps_location -> address
    const newProperty = await db.query(
      `INSERT INTO properties (user_id, name, address, description, google_maps_link) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name, address, description, google_maps_link]
    );

    console.log("Property Added:", newProperty.rows[0]); 
    res.json(newProperty.rows[0]);
    
  } catch (err) {
    console.error("Add Property Error:", err.message);
    res.status(500).send('Server Error: ' + err.message);
  }
});

// @route   GET /api/properties
// @desc    Get all my properties
router.get('/', auth, async (req, res) => {
  try {
    // FIX: Using 'user_id' to match the column name
    const properties = await db.query(
      'SELECT * FROM properties WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(properties.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/properties/:id/visits
router.get('/:id/visits', auth, async (req, res) => {
    try {
      // FIX: Changed owner_id -> user_id
      const propertyCheck = await db.query(
        'SELECT * FROM properties WHERE id = $1 AND user_id = $2',
        [req.params.id, req.user.id]
      );
  
      if (propertyCheck.rows.length === 0) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
  
      const visits = await db.query(`
        SELECT vr.scheduled_date, vr.status, vr.completed_at, m.url as photo_url
        FROM visit_requests vr
        LEFT JOIN media m ON vr.id = m.visit_id
        WHERE vr.property_id = $1
        ORDER BY vr.scheduled_date DESC
      `, [req.params.id]);
  
      res.json(visits.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;