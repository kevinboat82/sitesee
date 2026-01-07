// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This is REQUIRED for Neon/Render connections
  },
});

// Test the connection when the app starts
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('✅ Connected to PostgreSQL Database');
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};