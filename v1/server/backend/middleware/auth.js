const jwt = require('jsonwebtoken');

/**
 * Middleware that accepts either:
 * - Bearer JWT signed with process.env.JWT_SECRET, or
 * - x-api-key header matching process.env.BACKEND_API_KEY
 */
function authMiddleware(req, res, next) {
  const apiKey = process.env.BACKEND_API_KEY;
  const authHeader = req.headers['authorization'];

  if (apiKey && req.headers['x-api-key'] === apiKey) return next();

  if (!authHeader) return res.status(401).json({ error: 'missing auth' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'invalid auth header' });

  const token = parts[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'server missing JWT_SECRET' });

  try {
    const payload = jwt.verify(token, secret);
    // attach user info if present
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

module.exports = authMiddleware;
