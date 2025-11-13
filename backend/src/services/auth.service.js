import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { ACCESS_EXPIRES, ACCESS_TOKEN_SECRET, REFRESH_EXPIRES_MS } from '../config/jwt.js';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function generateAccessToken(user) {
  const secret = process.env.ACCESS_TOKEN_SECRET || ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET not set');

  const payload = {
    sub: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email
  };
  return jwt.sign(payload, secret, { expiresIn: ACCESS_EXPIRES });
}

export function generateRefreshTokenRaw() {
  // large random string
  return crypto.randomBytes(64).toString('hex');
}

export async function saveRefreshToken(userId, rawToken) {
  const hashed = hashToken(rawToken);
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);
  try {
    const tokenDoc = await RefreshToken.create({
      user: userId,
      token: hashed,
      createdAt: new Date(),
      expiresAt
    });
    // token created
    return tokenDoc.token; // hashed
  } catch (err) {
    // log error for diagnosis and rethrow
    console.error('Failed to create RefreshToken', { userId, err: err?.message || err });
    throw err;
  }
}

export async function verifyRefreshToken(rawToken) {
  const hashed = hashToken(rawToken);
  const tokenDoc = await RefreshToken.findOne({ token: hashed }).populate('user');
  if (!tokenDoc) return null;
  if (tokenDoc.revokedAt) return null;
  if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() <= Date.now()) return null;
  return { tokenDoc, user: tokenDoc.user, hashed };
}

export async function rotateRefreshToken(userId, oldRawToken) {
  const oldHash = hashToken(oldRawToken);
  const tokenDoc = await RefreshToken.findOne({ user: userId, token: oldHash });
  if (!tokenDoc) {
    throw new Error('Refresh token invalid or already used');
  }

  if (tokenDoc.revokedAt) {
    throw new Error('Refresh token invalid or already used');
  }

  if (tokenDoc.expiresAt && tokenDoc.expiresAt.getTime() <= Date.now()) {
    throw new Error('Refresh token expired');
  }

  // revoke old token and create a new one
  const newRaw = generateRefreshTokenRaw();
  const newHash = hashToken(newRaw);

  tokenDoc.revokedAt = new Date();
  tokenDoc.replacedByToken = newHash;
  await tokenDoc.save();

  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);
  await RefreshToken.create({ user: userId, token: newHash, createdAt: new Date(), expiresAt });

  return newRaw;
}

export async function removeRefreshToken(rawToken) {
  const hashed = hashToken(rawToken);
  // prefer marking revokedAt for audit, but delete to immediately prevent reuse
  await RefreshToken.deleteOne({ token: hashed });
}

export async function removeAllRefreshTokensForUser(userId) {
  await RefreshToken.deleteMany({ user: userId });
}

export const REFRESH_TOKEN_MAX_AGE = REFRESH_EXPIRES_MS; // ms
