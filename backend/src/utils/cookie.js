import { REFRESH_TOKEN_MAX_AGE } from '../services/auth.service.js';

export function setRefreshTokenCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  // In production (HTTPS + deployed) we should use SameSite=None and Secure.
  // In development with plain HTTP on localhost, SameSite='lax' is more compatible.
  const opts = {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    path: '/',
    maxAge: REFRESH_TOKEN_MAX_AGE
  };
  res.cookie('refreshToken', token, opts);
}

export function clearRefreshTokenCookie(res) {
  res.clearCookie('refreshToken', { path: '/' });
}
