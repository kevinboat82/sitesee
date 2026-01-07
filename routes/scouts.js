// routes/scouts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');
const upload = require('../config/cloudinary');

// Middleware to ensure user is actually a SCOUT
const verifyScout = (req, res, next) => {
  if (req.user.role !== 'SCOUT') {
    return res.status(403).json({ msg: 'Access denied. Scouts only.' });
  }
  next();
};

// @route   GET /api/scouts/jobs
// @desc    See all available jobs (PENDING)
router.get('/jobs', auth, verifyScout, async (req, res) => {
  try {
    // Join with properties table so the scout knows WHERE to go
    const jobs = await db.query(`
      SELECT vr.id, vr.scheduled_date, vr.admin_notes, 
             p.name, p.gps_location, p.caretaker_phone
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
    // Assign the job to THIS scout (req.user.id) and change status to ASSIGNED
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

    res.json({ msg: 'Job claimed! Get to work.', job: job.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/scouts/jobs/:id/complete
// @desc    Upload photo and mark job as COMPLETE
// 'image' is the name of the form field where the file lives
router.post('/jobs/:id/complete', auth, verifyScout, upload.single('image'), async (req, res) => {
    try {
      const visitId = req.params.id;
  
      // 1. Check if file exists
      if (!req.file) {
        return res.status(400).json({ msg: 'Please upload a photo' });
      }
  
      // 2. Save Media URL to Database
      // req.file.path is the magic URL from Cloudinary
      await db.query(
        `INSERT INTO media (visit_id, url, media_type) VALUES ($1, $2, 'IMAGE')`,
        [visitId, req.file.path]
      );
  
      // 3. Mark Job as COMPLETED
      const result = await db.query(
        `UPDATE visit_requests 
         SET status = 'COMPLETED', completed_at = NOW() 
         WHERE id = $1 RETURNING *`,
        [visitId]
      );
  
      res.json({ msg: 'Great job! Visit completed.', proof: req.file.path });
  
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;