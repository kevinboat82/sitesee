// routes/properties.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import the bouncer
const db = require('../config/db');

// @route   POST /api/properties
// @desc    Add a new property (Protected)
router.post('/', auth, async (req, res) => {
  const { name, gps_location, description, caretaker_phone } = req.body;

  try {
    // Insert the new property linked to the logged-in user (req.user.id)
    const newProperty = await db.query(
      `INSERT INTO properties (owner_id, name, gps_location, description, caretaker_phone) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, name, gps_location, description, caretaker_phone]
    );

    res.json(newProperty.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/properties
// @desc    Get all my properties
router.get('/', auth, async (req, res) => {
  try {
    const properties = await db.query(
      'SELECT * FROM properties WHERE owner_id = $1',
      [req.user.id]
    );
    res.json(properties.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/properties/:id/visits
// @desc    Get all visits and photos for a specific property
router.get('/:id/visits', auth, async (req, res) => {
    try {
      // 1. Check if user owns this property (Security)
      const propertyCheck = await db.query(
        'SELECT * FROM properties WHERE id = $1 AND owner_id = $2',
        [req.params.id, req.user.id]
      );
  
      if (propertyCheck.rows.length === 0) {
        return res.status(403).json({ msg: 'Not authorized' });
      }
  
      // 2. Fetch visits and the photos (Joined together)
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