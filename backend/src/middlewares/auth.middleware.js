import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../config/jwt.js';
import User from '../models/User.js';

export function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const secret = process.env.ACCESS_TOKEN_SECRET || ACCESS_TOKEN_SECRET;
    if (!secret) return res.status(500).json({ success: false, error: 'Server misconfiguration: ACCESS_TOKEN_SECRET not set' });
    const payload = jwt.verify(token, secret);
    // attach minimal user info
    req.user = { id: payload.sub, role: payload.role, name: payload.name, email: payload.email };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function requireRole(required) {
  return (req, res, next) => {
    const { user } = req;
    if (!user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    const roles = Array.isArray(required) ? required : [required];
    if (!roles.includes(user.role)) return res.status(403).json({ success: false, error: 'Forbidden' });
    return next();
  };
}
