const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Try to get token from 'x-auth-token' OR 'Authorization' header
  let token = req.header('x-auth-token');
  
  // If not found there, check for "Bearer [token]"
  if (!token && req.header('Authorization')) {
    token = req.header('Authorization').replace('Bearer ', '');
  }

  // 2. If still no token, deny access
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};