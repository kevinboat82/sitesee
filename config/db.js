// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

// LOGIC: Check if the URL is for the Cloud (Neon) or Local
// If the URL contains 'neon.tech', we know it's the cloud and needs SSL.
// If not, we assume it's local and disable SSL.
const isNeonConnection = connectionString && connectionString.includes('neon.tech');

const pool = new Pool({
  connectionString: connectionString,
  // If it's Neon, use SSL. If it's Local, set ssl to false (undefined).
  ssl: isNeonConnection ? { rejectUnauthorized: false } : undefined,
});

// Test the connection when the app starts
pool.connect((err, client, release) => {
  if (err) {
    // This will print the exact reason if it fails again
    return console.error('Error acquiring client', err.stack);
  }
  console.log(`✅ Connected to Database (${isNeonConnection ? 'Cloud/Neon' : 'Local'})`);
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};