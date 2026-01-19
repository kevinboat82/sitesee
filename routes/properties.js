// routes/properties.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

// @route   POST /api/properties
// @desc    Add a new property
router.post('/', auth, async (req, res) => {
  const { name, address, description, google_maps_link } = req.body;

  try {
    if (!name || !address) {
      return res.status(400).json({ error: "Name and Address are required" });
    }

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
// @desc    Get visits for a property with detailed info
router.get('/:id/visits', auth, async (req, res) => {
  try {
    const propertyCheck = await db.query(
      'SELECT * FROM properties WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const visits = await db.query(`
      SELECT vr.id, vr.scheduled_date, vr.status, vr.completed_at, 
             vr.scout_notes, vr.client_rating, vr.client_comment, vr.instructions,
             u.full_name as scout_name,
             (SELECT json_agg(json_build_object('url', url, 'type', media_type)) 
              FROM media WHERE visit_id = vr.id) as media
      FROM visit_requests vr
      LEFT JOIN users u ON vr.assigned_scout_id = u.id
      WHERE vr.property_id = $1
      ORDER BY vr.scheduled_date DESC
    `, [req.params.id]);

    res.json(visits.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/properties/:id/gallery
// @desc    Get all media for a property (paginated)
router.get('/:id/gallery', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const propertyCheck = await db.query(
      'SELECT * FROM properties WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const media = await db.query(`
      SELECT m.*, vr.scheduled_date, vr.completed_at
      FROM media m
      JOIN visit_requests vr ON m.visit_id = vr.id
      WHERE vr.property_id = $1
      ORDER BY m.uploaded_at DESC
      LIMIT $2 OFFSET $3
    `, [req.params.id, limit, offset]);

    const total = await db.query(`
      SELECT COUNT(*) FROM media m
      JOIN visit_requests vr ON m.visit_id = vr.id
      WHERE vr.property_id = $1
    `, [req.params.id]);

    res.json({
      media: media.rows,
      total: parseInt(total.rows[0].count),
      limit,
      offset
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/properties/:id/health
// @desc    Get property health score
router.get('/:id/health', auth, async (req, res) => {
  try {
    const propertyCheck = await db.query(
      'SELECT * FROM properties WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Get stats for health calculation
    const stats = await db.query(`
      SELECT 
        p.*,
        COALESCE(s.status, 'INACTIVE') as sub_status,
        (SELECT COUNT(*) FROM visit_requests WHERE property_id = p.id AND status = 'COMPLETED') as completed_visits,
        (SELECT COUNT(*) FROM visit_requests WHERE property_id = p.id AND status = 'PENDING') as pending_visits,
        (SELECT AVG(client_rating) FROM visit_requests WHERE property_id = p.id AND client_rating IS NOT NULL) as avg_rating,
        (SELECT MAX(completed_at) FROM visit_requests WHERE property_id = p.id AND status = 'COMPLETED') as last_visit
      FROM properties p
      LEFT JOIN subscriptions s ON p.id = s.property_id AND s.status = 'ACTIVE'
      WHERE p.id = $1
    `, [req.params.id]);

    const prop = stats.rows[0];

    // Calculate health score (0-100)
    let score = 0;
    const factors = [];

    // 1. Active subscription (+30 points)
    if (prop.sub_status === 'ACTIVE') {
      score += 30;
      factors.push({ name: 'Active Subscription', points: 30, status: 'good' });
    } else {
      factors.push({ name: 'No Active Subscription', points: 0, status: 'bad' });
    }

    // 2. Recent visit within 30 days (+25 points)
    const lastVisit = prop.last_visit ? new Date(prop.last_visit) : null;
    const daysSinceVisit = lastVisit ? Math.floor((Date.now() - lastVisit) / (1000 * 60 * 60 * 24)) : null;

    if (daysSinceVisit !== null && daysSinceVisit <= 30) {
      score += 25;
      factors.push({ name: 'Recent Visit', points: 25, status: 'good', detail: `${daysSinceVisit} days ago` });
    } else if (daysSinceVisit !== null && daysSinceVisit <= 60) {
      score += 15;
      factors.push({ name: 'Visit Due', points: 15, status: 'warning', detail: `${daysSinceVisit} days ago` });
    } else {
      factors.push({ name: 'No Recent Visit', points: 0, status: 'bad' });
    }

    // 3. Multiple visits history (+20 points max)
    const visitPoints = Math.min(20, parseInt(prop.completed_visits) * 4);
    score += visitPoints;
    factors.push({ name: 'Visit History', points: visitPoints, status: visitPoints >= 15 ? 'good' : 'neutral', detail: `${prop.completed_visits} total` });

    // 4. Good ratings (+15 points)
    const avgRating = parseFloat(prop.avg_rating) || 0;
    if (avgRating >= 4) {
      score += 15;
      factors.push({ name: 'High Ratings', points: 15, status: 'good', detail: `${avgRating.toFixed(1)}/5` });
    } else if (avgRating >= 3) {
      score += 10;
      factors.push({ name: 'Good Ratings', points: 10, status: 'neutral', detail: `${avgRating.toFixed(1)}/5` });
    }

    // 5. No pending issues (+10 points)
    if (parseInt(prop.pending_visits) === 0) {
      score += 10;
      factors.push({ name: 'No Pending Visits', points: 10, status: 'good' });
    } else {
      factors.push({ name: 'Pending Visits', points: 0, status: 'neutral', detail: `${prop.pending_visits} pending` });
    }

    res.json({
      score: Math.min(100, score),
      maxScore: 100,
      factors,
      lastVisit: prop.last_visit,
      completedVisits: parseInt(prop.completed_visits),
      avgRating: avgRating || null
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/properties/:id/visits/:visitId/rate
// @desc    Rate a completed visit
router.post('/:id/visits/:visitId/rate', auth, async (req, res) => {
  const { rating, comment } = req.body;

  try {
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be 1-5" });
    }

    // Verify ownership
    const visit = await db.query(`
      SELECT vr.* FROM visit_requests vr
      JOIN properties p ON vr.property_id = p.id
      WHERE vr.id = $1 AND p.id = $2 AND p.user_id = $3 AND vr.status = 'COMPLETED'
    `, [req.params.visitId, req.params.id, req.user.id]);

    if (visit.rows.length === 0) {
      return res.status(404).json({ msg: 'Visit not found or not authorized' });
    }

    const updated = await db.query(`
      UPDATE visit_requests
      SET client_rating = $1, client_comment = $2
      WHERE id = $3
      RETURNING *
    `, [rating, comment || null, req.params.visitId]);

    res.json({ msg: 'Rating submitted', visit: updated.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/properties/:id
// @desc    Get details for ONE specific property (including subscription status and health)
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await db.query(
      `SELECT p.*, 
              COALESCE(s.status, 'INACTIVE') as sub_status,
              p.last_visit_date,
              p.visit_count
       FROM properties p
       LEFT JOIN subscriptions s 
       ON p.id = s.property_id AND s.status = 'ACTIVE'
       WHERE p.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id]
    );

    if (property.rows.length === 0) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    res.json(property.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;