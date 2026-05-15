/**
 * otpStore.js
 * In-memory OTP challenge store for signup and login flows.
 * Challenges expire after OTP_TTL_MS milliseconds.
 */

const crypto = require('crypto');

// OTP time-to-live: 10 minutes
const OTP_TTL_MS = 10 * 60 * 1000;

// In-memory store: challengeId -> { purpose, otp, payload, expiresAt }
const store = new Map();

/**
 * Generate a secure random 6-digit OTP string.
 */
function generateOtp() {
  // Generates a number between 100000 and 999999 (inclusive)
  const num = crypto.randomInt(100000, 1000000);
  return String(num);
}

/**
 * Create a new OTP challenge.
 *
 * @param {string} purpose  - e.g. 'signup' | 'login'
 * @param {object} payload  - data to store alongside the challenge (e.g. user info)
 * @returns {{ challengeId: string, otp: string }}
 */
function createChallenge(purpose, payload) {
  const challengeId = crypto.randomUUID();
  const otp = generateOtp();
  const expiresAt = Date.now() + OTP_TTL_MS;

  store.set(challengeId, { purpose, otp, payload, expiresAt });

  // Auto-cleanup after TTL
  setTimeout(() => store.delete(challengeId), OTP_TTL_MS + 1000);

  return { challengeId, otp };
}

/**
 * Retrieve a challenge without consuming it.
 *
 * @param {string} challengeId
 * @returns {object|null} The challenge record or null if not found / expired
 */
function getChallenge(challengeId) {
  const entry = store.get(challengeId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(challengeId);
    return null;
  }
  return entry;
}

/**
 * Verify the OTP and consume (delete) the challenge on success.
 *
 * @param {string} challengeId
 * @param {string} expectedPurpose  - must match the stored purpose
 * @param {string} otp              - the OTP provided by the user
 * @returns {{ ok: boolean, payload?: object, reason?: string }}
 */
function consumeChallenge(challengeId, expectedPurpose, otp) {
  const entry = store.get(challengeId);

  if (!entry) {
    return { ok: false, reason: 'not_found' };
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(challengeId);
    return { ok: false, reason: 'expired' };
  }

  if (entry.purpose !== expectedPurpose) {
    return { ok: false, reason: 'wrong_purpose' };
  }

  if (entry.otp !== otp) {
    return { ok: false, reason: 'mismatch' };
  }

  // Consume the challenge
  store.delete(challengeId);
  return { ok: true, payload: entry.payload };
}

module.exports = {
  OTP_TTL_MS,
  createChallenge,
  getChallenge,
  consumeChallenge
};
