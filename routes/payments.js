// routes/payments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const axios = require('axios');
const db = require('../config/db');
const crypto = require('crypto');

// @route   POST /api/payments/initialize
// @desc    Start a payment for a property subscription
router.post('/initialize', auth, async (req, res) => {
  const { property_id, amount, email } = req.body;

  try {
    // 1. Call Paystack API
    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email,
        amount: amount * 100, // Paystack counts in Pesewas (50 GHS = 5000)
        metadata: {
            property_id: property_id,
            user_id: req.user.id
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 2. Save the Reference to DB (so we know they are trying to pay)
    // We update the subscription table to 'PENDING'
    const { reference, authorization_url } = paystackResponse.data.data;

    await db.query(
      `INSERT INTO subscriptions (property_id, paystack_sub_code, status, plan_type)
       VALUES ($1, $2, 'PENDING', 'BASIC_MONTHLY')`,
      [property_id, reference]
    );

    // 3. Send the URL back to the user
    res.json({ checkout_url: authorization_url, reference });

  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Paystack Error' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Listen for Paystack payment success
router.post('/webhook', async (req, res) => {
    // 1. Validate the Event (Security Check)
    // We hash the body with our secret key and compare it to what Paystack sent.
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');
  
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).send('Invalid signature'); // Block hackers
    }
  
    // 2. Handle the Event
    const event = req.body;
  
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      
      // metadata.property_id comes from the "initialize" step we did earlier
      const propertyId = metadata.property_id;
  
      try {
        console.log(`💰 Payment received for Reference: ${reference}`);
  
        // A. Activate the Subscription
        await db.query(
          `UPDATE subscriptions SET status = 'ACTIVE' WHERE paystack_sub_code = $1`,
          [reference]
        );
  
        // B. Create the Visit Request (The Job Ticket)
        // We set the scheduled date to "Tomorrow" automatically
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
  
        await db.query(
          `INSERT INTO visit_requests (property_id, status, scheduled_date, admin_notes)
           VALUES ($1, 'PENDING', $2, 'Auto-generated from subscription payment')`,
          [propertyId, tomorrow]
        );
  
        console.log('✅ Subscription Active & Scout Job Created!');
  
      } catch (err) {
        console.error('Webhook Error:', err.message);
      }
    }
  
    // 3. Acknowledge Paystack (Always say "OK" quickly)
    res.sendStatus(200);
  });

module.exports = router;