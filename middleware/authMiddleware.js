const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Get token from header
  let token = req.header('x-auth-token');
  
  if (!token && req.header('Authorization')) {
    token = req.header('Authorization').replace('Bearer ', '');
  }

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // --- THE FIX IS HERE ---
    // If the token has a 'user' object inside, use it. 
    // Otherwise, assume the token IS the user object.
    req.user = decoded.user || decoded;
    
    // Debug log to see what we actually got (check your Render logs if this fails again)
    console.log("Auth Middleware Success. User ID:", req.user.id);

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};