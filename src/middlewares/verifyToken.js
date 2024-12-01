const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT tokens for protected routes.
 */
const verifyToken = (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1]; // Get the token after 'Bearer'

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded token data to the request object
    req.user = decoded;

    // Call the next middleware
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
