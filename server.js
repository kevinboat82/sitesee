// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./config/db'); // Import our DB connection
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const paymentRoutes = require('./routes/payments');
const scoutRoutes = require('./routes/scouts');
const dashboardRoutes = require('./routes/dashboard');

require('dotenv').config();

const app = express();

// Middleware
app.use(express.json()); // Allows us to parse JSON bodies
app.use(cors()); // Allow frontend to talk to backend
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/scouts', scoutRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Basic Route to Test
app.get('/', (req, res) => {
  res.json({ message: 'SiteSee API is running 🚀' });
});

// Test DB Route (Fetch all users)
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

//fix