// Single source of truth for the JWT signing secret.
//
// The secret MUST be provided via the JWT_SECRET environment variable.
// There is intentionally NO hardcoded fallback: a missing secret is a fatal
// misconfiguration and the process must refuse to start rather than run with a
// well-known, publicly-committed default.
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.trim() === '') {
    console.error('❌ FATAL: JWT_SECRET environment variable is not set.');
    console.error('   Refusing to start without a real JWT secret. Set JWT_SECRET and restart.');
    throw new Error('JWT_SECRET environment variable is required');
}

if (JWT_SECRET === 'kashtec-secret-key-2024' || JWT_SECRET === 'your-secret-key') {
    console.error('❌ FATAL: JWT_SECRET is set to a known insecure default value.');
    console.error('   Generate a strong random secret and set JWT_SECRET before starting.');
    throw new Error('JWT_SECRET must not be a known insecure default value');
}

const JWT_EXPIRE = process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || '7d';

module.exports = { JWT_SECRET, JWT_EXPIRE };
