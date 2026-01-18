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
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// --- FIXED: Log BEFORE mounting ---
console.log("Mounting Routes...");

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

// Bind to 0.0.0.0 for Render compatibility
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started on port ${PORT}`);
});