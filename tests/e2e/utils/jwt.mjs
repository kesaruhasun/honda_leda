import crypto from 'node:crypto';

export const JWT_SECRET = process.env.JWT_SECRET || 'pulseos_jwt_secret_key_sliit_se2030_group60_2026_super_secure';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64url');
}

function base64UrlDecode(str) {
  return Buffer.from(str, 'base64url').toString('utf8');
}

/**
 * Creates an authentic HMAC-SHA256 JWT token
 */
export function signJwt(payload, secret = JWT_SECRET, expiresInSeconds = 3600) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 JWT token and returns payload if valid
 */
export function verifyJwt(token, secret = JWT_SECRET) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token missing or not a string' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed JWT token structure' };
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return { valid: false, error: 'Invalid or forged JWT signature' };
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: 'JWT token has expired' };
    }
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Invalid payload encoding' };
  }
}
