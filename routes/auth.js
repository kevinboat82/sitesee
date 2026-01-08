// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

console.log("--- Auth Routes File Loaded ---"); // Debug Log 1

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me_in_prod';

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
  console.log("Login Route Hit!"); // Debug Log 2
  
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      console.log("User not found");
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    const user = userResult.rows[0];

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log("Password mismatch");
      return res.status(400).json({ error: 'Invalid Credentials' });
    }

    // 3. Generate Token
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '1d',
    });
    
    console.log("Login Success");
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      } 
    });

  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    const { email, password, full_name, phone_number, role } = req.body;
  
    try {
      const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userRole = role || 'CLIENT'; 
      
      const newUser = await db.query(
        'INSERT INTO users (email, password_hash, full_name, phone_number, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
        [email, hashedPassword, full_name, phone_number, userRole]
      );
  
      const token = jwt.sign({ id: newUser.rows[0].id, role: userRole }, JWT_SECRET, {
        expiresIn: '1d', 
      });
  
      res.status(201).json({ token, user: newUser.rows[0] });
  
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;