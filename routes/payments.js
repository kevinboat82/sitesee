// routes/payments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const axios = require('axios');
const db = require('../config/db');
const crypto = require('crypto');

// @route   POST /api/payments/initialize
// @desc    Start a payment (Used for both Subscriptions AND New Visits)
// routes/payments.js

router.post('/initialize', auth, async (req, res) => {
  const { email, amount, plan_type, property_id } = req.body;

  try {
    // 1. Generate a Unique Reference
    const reference = crypto.randomBytes(8).toString('hex');

    // 2. CRITICAL STEP: Save to Database FIRST
    // We insert the SAME reference into both 'reference' and 'paystack_sub_code' columns
    const newSub = await db.query(
      `INSERT INTO subscriptions 
       (user_id, property_id, status, plan_type, start_date, end_date, reference, paystack_sub_code)
       VALUES ($1, $2, 'PENDING', $3, NOW(), NOW() + INTERVAL '30 days', $4, $4)
       RETURNING *`,
      [req.user.id, property_id, plan_type || 'BASIC', reference]
    );

    console.log(`✅ Pending Subscription Created for Ref: ${reference}`);

    // 3. Send to Paystack
    const params = JSON.stringify({
      email: email,
      amount: amount * 100, 
      reference: reference, 
      callback_url: "https://sitesee-api.onrender.com/api/payments/callback",
      metadata: {
        user_id: req.user.id,
        property_id: property_id,
        custom_fields: [
          {
            display_name: "Property ID",
            variable_name: "property_id",
            value: property_id
          }
        ]
      }
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const paystackReq = https.request(options, paystackRes => {
      let data = '';
      paystackRes.on('data', (chunk) => { data += chunk; });
      paystackRes.on('end', () => {
        const responseData = JSON.parse(data);
        if (responseData.status) {
            res.json({ authorization_url: responseData.data.authorization_url });
        } else {
            console.error("Paystack Init Failed:", responseData.message);
            res.status(400).json({ error: "Payment initialization failed" });
        }
      });
    });

    paystackReq.on('error', error => {
      console.error(error);
      res.status(500).json({ error: "Connection to payment gateway failed" });
    });

    paystackReq.write(params);
    paystackReq.end();

  } catch (err) {
    console.error("Initialize Error:", err.message);
    res.status(500).send('Server Error');
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