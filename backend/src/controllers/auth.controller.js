import { z } from 'zod';
import User from '../models/User.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshTokenRaw,
  saveRefreshToken,
  verifyRefreshToken,
  rotateRefreshToken,
  removeRefreshToken
} from '../services/auth.service.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookie.js';

const signupSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8).optional(),
  role: z.enum(['User', 'Admin']).optional()
}).refine(
  (data) => (data.firstName && data.lastName) || data.name,
  { message: 'Either name or (firstName and lastName) is required' }
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function signup(req, res, next) {
  try {
    const parsed = signupSchema.parse(req.body);
    const existing = await User.findOne({ email: parsed.email });
    if (existing) return res.status(400).json({ success: false, error: 'Email already in use' });

    // Combine firstName and lastName into name, or use provided name
    const fullName = parsed.name || `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim();

    const passwordHash = await hashPassword(parsed.password);
    const user = await User.create({ name: fullName, email: parsed.email, passwordHash, role: parsed.role || 'User' });

    const accessToken = generateAccessToken(user);
    const rawRefresh = generateRefreshTokenRaw();
    await saveRefreshToken(user._id, rawRefresh);
    setRefreshTokenCookie(res, rawRefresh);

    return res.status(201).json({
      success: true,
      data: { accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await User.findOne({ email: parsed.email });
    if (!user) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    const ok = await comparePassword(parsed.password, user.passwordHash);
    if (!ok) return res.status(400).json({ success: false, error: 'Invalid credentials' });

    const accessToken = generateAccessToken(user);
    const rawRefresh = generateRefreshTokenRaw();
    await saveRefreshToken(user._id, rawRefresh);
    setRefreshTokenCookie(res, rawRefresh);

    return res.json({ success: true, data: { accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const raw = req.cookies?.refreshToken;
    // debug: log missing/invalid cookies in development to aid troubleshooting
    // eslint-disable-next-line no-console
      if (!raw) {
        // If no refresh token cookie is present, return unauthorized
      return res.status(401).json({ success: false, error: 'No refresh token' });
    }

    // eslint-disable-next-line no-console
      // If refresh token cookie is found, attempt verification
    const verified = await verifyRefreshToken(raw);
    if (!verified) {
      // eslint-disable-next-line no-console
          // If verification fails, return unauthorized
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    const { user } = verified;
    // rotate
    const newRaw = await rotateRefreshToken(user._id, raw);
    const accessToken = generateAccessToken(user);
    setRefreshTokenCookie(res, newRaw);

    // debug log for successful refresh
    // eslint-disable-next-line no-console
      // Successful refresh for user

    return res.json({ success: true, data: { accessToken } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Auth refresh: error during token rotation', err?.message || err);
    // If rotation failed, attempt to force logout client-side
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      try {
        await removeRefreshToken(raw);
      } catch (e) {
        // ignore
      }
    }
    clearRefreshTokenCookie(res);
    return res.json({ success: true, data: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    // `authenticate` middleware attaches req.user
    const u = req.user;
    if (!u) return res.status(401).json({ success: false, error: 'Not authenticated' });
    // minimal user response
    return res.json({ success: true, data: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (err) {
    next(err);
  }
}
