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

// --- SCOUT EARNINGS ROUTES ---

// @route   GET /api/scouts/earnings
// @desc    Get scout earnings summary
router.get('/earnings', auth, verifyScout, async (req, res) => {
  try {
    // Get earnings breakdown
    const earnings = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN amount ELSE 0 END), 0) as week_total,
        COALESCE(SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN amount ELSE 0 END), 0) as month_total,
        COALESCE(SUM(amount), 0) as all_time_total,
        COALESCE(SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END), 0) as pending_payout,
        COUNT(*) as total_jobs
      FROM scout_earnings
      WHERE scout_id = $1
    `, [req.user.id]);

    // Get recent earnings history
    const history = await db.query(`
      SELECT se.*, p.name as property_name
      FROM scout_earnings se
      LEFT JOIN visit_requests vr ON se.visit_id = vr.id
      LEFT JOIN properties p ON vr.property_id = p.id
      WHERE se.scout_id = $1
      ORDER BY se.created_at DESC
      LIMIT 10
    `, [req.user.id]);

    res.json({
      summary: earnings.rows[0],
      history: history.rows
    });
  } catch (err) {
    console.error('Earnings Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/scouts/achievements
// @desc    Get scout's achievements and available badges
router.get('/achievements', auth, verifyScout, async (req, res) => {
  try {
    // Get earned achievements
    const earned = await db.query(`
      SELECT a.*, sa.earned_at
      FROM scout_achievements sa
      JOIN achievements a ON sa.achievement_id = a.id
      WHERE sa.scout_id = $1
      ORDER BY sa.earned_at DESC
    `, [req.user.id]);

    // Get all achievements for progress display
    const all = await db.query(`SELECT * FROM achievements ORDER BY requirement_value`);

    // Get scout stats for progress
    const stats = await db.query(`
      SELECT 
        COUNT(*) as jobs_completed,
        COALESCE(AVG(client_rating), 0) as avg_rating
      FROM visit_requests
      WHERE assigned_scout_id = $1 AND status = 'COMPLETED'
    `, [req.user.id]);

    res.json({
      earned: earned.rows,
      all: all.rows,
      stats: stats.rows[0]
    });
  } catch (err) {
    console.error('Achievements Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/scouts/history
// @desc    Get completed job history
router.get('/history', auth, verifyScout, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const history = await db.query(`
      SELECT vr.*, p.name, p.address, p.google_maps_link,
             (SELECT COUNT(*) FROM media WHERE visit_id = vr.id) as media_count,
             (SELECT url FROM media WHERE visit_id = vr.id LIMIT 1) as thumbnail
      FROM visit_requests vr
      JOIN properties p ON vr.property_id = p.id
      WHERE vr.assigned_scout_id = $1 AND vr.status = 'COMPLETED'
      ORDER BY vr.completed_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);

    res.json(history.rows);
  } catch (err) {
    console.error('History Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// --- CLIENT ROUTES ---

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

    // Create activity
    const { createActivity } = require('./activity');
    const prop = await db.query('SELECT name, user_id FROM properties WHERE id = $1', [property_id]);
    if (prop.rows[0]) {
      await createActivity(
        prop.rows[0].user_id,
        property_id,
        'VISIT_SCHEDULED',
        'Visit Scheduled',
        `A new visit has been scheduled for ${new Date(scheduled_date).toLocaleDateString()}`
      );
    }

    res.json(newVisit.rows[0]);

  } catch (err) {
    console.error("Visit Request Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// --- SCOUT JOB ROUTES ---

// Job claim timeout in hours (jobs auto-release if not completed)
const JOB_CLAIM_HOURS = 4;

// @route   GET /api/scouts/jobs
// @desc    See all available jobs (PENDING or expired claims)
router.get('/jobs', auth, verifyScout, async (req, res) => {
  try {
    // First, auto-release any expired claimed jobs back to PENDING
    await db.query(`
      UPDATE visit_requests 
      SET status = 'PENDING', 
          assigned_scout_id = NULL, 
          claimed_at = NULL,
          claim_expires_at = NULL
      WHERE status = 'ASSIGNED' 
        AND claim_expires_at IS NOT NULL 
        AND claim_expires_at < NOW()
    `);

    // Now fetch available jobs (PENDING only)
    const jobs = await db.query(`
      SELECT vr.id, vr.scheduled_date, vr.instructions, 
             p.name, p.address, p.google_maps_link,
             CASE 
               WHEN vr.scheduled_date < CURRENT_DATE THEN 'OVERDUE'
               WHEN vr.scheduled_date = CURRENT_DATE THEN 'TODAY'
               ELSE 'UPCOMING'
             END as priority
      FROM visit_requests vr
      JOIN properties p ON vr.property_id = p.id
      WHERE vr.status = 'PENDING'
      ORDER BY vr.scheduled_date ASC
    `);

    res.json(jobs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/scouts/jobs/:id/claim
// @desc    Scout claims a job (exclusive - prevents double claiming)
router.put('/jobs/:id/claim', auth, verifyScout, async (req, res) => {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Lock the row to prevent race conditions (FOR UPDATE)
    const checkJob = await client.query(
      `SELECT * FROM visit_requests 
       WHERE id = $1 AND status = 'PENDING'
       FOR UPDATE`,
      [req.params.id]
    );

    if (checkJob.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ msg: 'Job not found or already taken by another scout' });
    }

    // Calculate claim expiration (4 hours from now)
    const claimExpiresAt = new Date(Date.now() + JOB_CLAIM_HOURS * 60 * 60 * 1000);

    // Claim the job with timer
    const job = await client.query(
      `UPDATE visit_requests 
       SET status = 'ASSIGNED', 
           assigned_scout_id = $1,
           claimed_at = NOW(),
           claim_expires_at = $2
       WHERE id = $3
       RETURNING *`,
      [req.user.id, claimExpiresAt, req.params.id]
    );

    await client.query('COMMIT');

    res.json({
      msg: 'Job claimed successfully!',
      job: job.rows[0],
      expiresAt: claimExpiresAt,
      hoursToComplete: JOB_CLAIM_HOURS
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Claim Error:', err.message);
    res.status(500).send('Server Error');
  } finally {
    client.release();
  }
});

// @route   POST /api/scouts/jobs/:id/complete
// @desc    Upload multiple photos/videos, add notes, and mark job as COMPLETE
router.post('/jobs/:id/complete', auth, upload.array('media', 10), async (req, res) => {
  try {
    const visitId = req.params.id;
    const scoutNotes = req.body.notes || req.body.scout_notes || '';

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'Please upload at least one photo or video' });
    }

    console.log(`Processing ${req.files.length} files for Visit ID: ${visitId}`);

    // 1. Save All Media URLs to Media Table
    for (const file of req.files) {
      const mediaType = file.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE';
      await db.query(
        `INSERT INTO media (visit_id, url, media_type) VALUES ($1, $2, $3)`,
        [visitId, file.path, mediaType]
      );
    }

    // 2. Mark Job as PENDING_APPROVAL (client must approve before scout is paid)
    const completedJob = await db.query(
      `UPDATE visit_requests 
         SET status = 'PENDING_APPROVAL', 
             completed_at = NOW(),
             scout_notes = $2,
             assigned_scout_id = COALESCE(assigned_scout_id, $3)
         WHERE id = $1
         RETURNING *`,
      [visitId, scoutNotes, req.user.id]
    );

    const job = completedJob.rows[0];

    // 3. Create earning record for scout
    await db.query(
      `INSERT INTO scout_earnings (scout_id, visit_id, amount, status)
       VALUES ($1, $2, 25.00, 'PENDING')`,
      [req.user.id, visitId]
    );

    // 4. Update property visit stats
    if (job && job.property_id) {
      await db.query(
        `UPDATE properties 
         SET last_visit_date = NOW(), 
             visit_count = COALESCE(visit_count, 0) + 1
         WHERE id = $1`,
        [job.property_id]
      );

      // 5. Create activity for property owner
      const prop = await db.query('SELECT name, user_id FROM properties WHERE id = $1', [job.property_id]);
      if (prop.rows[0]) {
        const { createActivity } = require('./activity');
        await createActivity(
          prop.rows[0].user_id,
          job.property_id,
          'VISIT_PENDING_APPROVAL',
          'Visit Ready for Review',
          `Your property "${prop.rows[0].name}" has been inspected. ${req.files.length} photos/videos uploaded. Please review and approve.`
        );
      }
    }

    // 6. Check and award achievements
    await checkAndAwardAchievements(req.user.id);

    res.json({ msg: 'Job Completed and Media Uploaded!', count: req.files.length });

  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// Helper: Check and award achievements
async function checkAndAwardAchievements(scoutId) {
  try {
    // Get scout's current stats
    const stats = await db.query(`
      SELECT COUNT(*) as jobs_completed
      FROM visit_requests
      WHERE assigned_scout_id = $1 AND status = 'COMPLETED'
    `, [scoutId]);

    const jobsCompleted = parseInt(stats.rows[0].jobs_completed);

    // Get achievements not yet earned
    const unearnedAchievements = await db.query(`
      SELECT a.* FROM achievements a
      WHERE a.requirement_type = 'JOBS_COMPLETED'
        AND a.requirement_value <= $1
        AND a.id NOT IN (
          SELECT achievement_id FROM scout_achievements WHERE scout_id = $2
        )
    `, [jobsCompleted, scoutId]);

    // Award new achievements
    for (const achievement of unearnedAchievements.rows) {
      await db.query(
        `INSERT INTO scout_achievements (scout_id, achievement_id) VALUES ($1, $2)`,
        [scoutId, achievement.id]
      );
      console.log(`🏆 Achievement unlocked for scout ${scoutId}: ${achievement.name}`);
    }
  } catch (err) {
    console.error('Achievement check failed:', err.message);
  }
}

module.exports = router;