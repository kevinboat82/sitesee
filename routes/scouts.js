// routes/scouts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

// Note: If you haven't set up Cloudinary yet, this line might error. 
// If it does, comment it out for now.
// const upload = require('../config/cloudinary'); 

// Middleware to ensure user is actually a SCOUT
const verifyScout = (req, res, next) => {
  if (req.user.role !== 'SCOUT') {
    return res.status(403).json({ msg: 'Access denied. Scouts only.' });
  }
  next();
};

// --- CLIENT ROUTES (For You) ---

// @route   POST /api/scouts/request
// @desc    Client requests a new visit
router.post('/request', auth, async (req, res) => {
  const { property_id, scheduled_date, instructions } = req.body;

  try {
    if (!property_id || !scheduled_date) {
      return res.status(400).json({ error: "Property and Date are required" });
    }

    const newVisit = await db.query(
      `INSERT INTO visit_requests (property_id, user_id, scheduled_date, instructions, status) 
       VALUES ($1, $2, $3, $4, 'PENDING') RETURNING *`,
      [property_id, req.user.id, scheduled_date, instructions]
    );

    res.json(newVisit.rows[0]);

  } catch (err) {
    console.error("Visit Request Error:", err.message);
    res.status(500).send('Server Error');
  }
});


// --- SCOUT ROUTES (For the Employee) ---

// @route   GET /api/scouts/jobs
// @desc    See all available jobs (PENDING)
router.get('/jobs', auth, verifyScout, async (req, res) => {
  try {
    // FIX: Changed gps_location -> address
    const jobs = await db.query(`
      SELECT vr.id, vr.scheduled_date, vr.instructions, 
             p.name, p.address, p.google_maps_link
      FROM visit_requests vr
      JOIN properties p ON vr.property_id = p.id
      WHERE vr.status = 'PENDING'
    `);
    
    res.json(jobs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/scouts/jobs/:id/claim
// @desc    Scout accepts a job
router.put('/jobs/:id/claim', auth, verifyScout, async (req, res) => {
  try {
    const job = await db.query(
      `UPDATE visit_requests 
       SET status = 'ASSIGNED', assigned_scout_id = $1 
       WHERE id = $2 AND status = 'PENDING' 
       RETURNING *`,
      [req.user.id, req.params.id]
    );

    if (job.rows.length === 0) {
      return res.status(400).json({ msg: 'Job not found or already taken' });
    }

    res.json({ msg: 'Job claimed!', job: job.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;