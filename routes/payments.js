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

// @route   POST /api/payments/webhook
// @desc    Paystack calls this when payment is successful
router.post('/webhook', async (req, res) => {
    // 1. Verify Signature
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
      const { property_id, scheduled_date, instructions } = metadata;
  
      try {
        console.log(`💰 Payment Success! Ref: ${reference}`);
  
        // 1. Activate Subscription (If they are paying for activation)
        // We update this regardless, just to be safe/keep them active
        await db.query(
          `UPDATE subscriptions SET status = 'ACTIVE' WHERE property_id = $1`,
          [property_id]
        );
        // Note: If they didn't have a subscription row, this update does nothing, which is fine for repeat visits.

        // 2. CREATE THE VISIT REQUEST (The Job Ticket)
        // We use the date/instructions from the payment metadata
        const visitDate = scheduled_date || new Date(new Date().setDate(new Date().getDate() + 1)); // Default to tomorrow if null
        
        await db.query(
          `INSERT INTO visit_requests (property_id, user_id, status, scheduled_date, instructions, created_at)
           VALUES ($1, $2, 'PENDING', $3, $4, NOW())`,
          [property_id, metadata.user_id, visitDate, instructions]
        );
  
        console.log('✅ Visit Request Created from Payment!');
  
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