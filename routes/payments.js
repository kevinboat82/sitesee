// routes/payments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const axios = require('axios');
const db = require('../config/db');
const crypto = require('crypto');

// @route   POST /api/payments/initialize
// @desc    Start a payment (Used for both Subscriptions AND New Visits)
router.post('/initialize', auth, async (req, res) => {
  // We now accept visit details (date, instructions) in the request
  const { property_id, amount, email, scheduled_date, instructions } = req.body;

  try {
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email,
        amount: amount * 100, // Amount in Pesewas
        metadata: {
            property_id: property_id,
            user_id: req.user.id,
            // Pass the visit details to Paystack so we get them back in the webhook
            scheduled_date: scheduled_date || null,
            instructions: instructions || 'Standard Visit'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { reference, authorization_url } = paystackResponse.data.data;

    // Optional: Log the attempt in a 'transactions' table if you had one
    // For now, we trust Paystack to handle the flow
    
    res.json({ checkout_url: authorization_url, reference });

  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Paystack Error' });
  }
});

// routes/payments.js (Webhook Section Only)

router.post('/webhook', async (req, res) => {
  // 1. Validate Signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const { reference, metadata } = event.data;
    
    console.log(`🔔 Webhook Received for Ref: ${reference}`); // LOG THIS!

    try {
      // 2. Try updating using 'paystack_sub_code'
      let result = await db.query(
        `UPDATE subscriptions SET status = 'ACTIVE' WHERE paystack_sub_code = $1 RETURNING *`,
        [reference]
      );

      // 3. Fallback: If that didn't work, try 'reference' column
      if (result.rowCount === 0) {
           console.log("⚠️ paystack_sub_code not found, trying 'reference' column...");
           result = await db.query(
              `UPDATE subscriptions SET status = 'ACTIVE' WHERE reference = $1 RETURNING *`,
              [reference]
           );
      }

      if (result.rowCount > 0) {
          console.log('✅ Subscription Activated!');
      } else {
          console.error('❌ Could not find subscription to activate. Ref:', reference);
      }

      // 4. Handle "New Visit" requests (if metadata exists)
      if (metadata && metadata.scheduled_date) {
           await db.query(
            `INSERT INTO visit_requests (property_id, user_id, status, scheduled_date, instructions, created_at)
             VALUES ($1, $2, 'PENDING', $3, $4, NOW())`,
            [metadata.property_id, metadata.user_id, metadata.scheduled_date, metadata.instructions || 'Paid Visit']
          );
          console.log('✅ Visit Job Created!');
      }

    } catch (err) {
      console.error('Webhook Error:', err.message);
    }
  }

  res.sendStatus(200);
});

// @route   GET /api/payments/callback
router.get('/callback', async (req, res) => {
    const { reference } = req.query;
    // Redirect back to dashboard with success flag
    res.redirect('https://sitesee-mu.vercel.app/dashboard?payment=success');
});

module.exports = router;