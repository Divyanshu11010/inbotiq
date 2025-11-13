// JWT and token-related helpers & defaults
import ms from 'ms';

const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_TOKEN_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '30d';

function parseToMs(value) {
  // if value is numeric string, treat as milliseconds
  if (!value) return undefined;
  try {
    // use ms package form (e.g., 15m, 30d)
    return ms(value);
  } catch (e) {
    return undefined;
  }
}

export const ACCESS_EXPIRES = ACCESS_TOKEN_EXPIRES; // e.g. '15m'
export const REFRESH_EXPIRES = REFRESH_TOKEN_EXPIRES; // e.g. '30d'
export const REFRESH_EXPIRES_MS = parseToMs(REFRESH_TOKEN_EXPIRES) || 30 * 24 * 60 * 60 * 1000;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
