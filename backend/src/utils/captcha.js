const crypto = require('crypto');

const CAPTCHA_TTL_MS = 5 * 60 * 1000;
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function getCaptchaSecret() {
  return process.env.CAPTCHA_SECRET || process.env.JWT_SECRET || 'dft-captcha-secret';
}

function generateCaptchaCode(length = 6) {
  let code = '';
  for (let index = 0; index < length; index += 1) {
    const randomIndex = crypto.randomInt(0, CAPTCHA_CHARS.length);
    code += CAPTCHA_CHARS[randomIndex];
  }
  return code;
}

function signCaptchaPayload(payload) {
  return crypto
    .createHmac('sha256', getCaptchaSecret())
    .update(payload)
    .digest('hex');
}

function encodeTokenParts(parts) {
  return Buffer.from(JSON.stringify(parts)).toString('base64url');
}

function decodeToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    return JSON.parse(decoded);
  } catch (_) {
    return null;
  }
}

function generateCaptchaChallenge() {
  const code = generateCaptchaCode();
  const issuedAt = Date.now();
  const expiresAt = issuedAt + CAPTCHA_TTL_MS;
  const nonce = crypto.randomBytes(12).toString('hex');
  const payload = `${code}:${expiresAt}:${nonce}`;
  const signature = signCaptchaPayload(payload);

  return {
    captchaToken: encodeTokenParts({ expiresAt, nonce, signature }),
    captchaSvg: buildCaptchaSvg(code),
    expiresAt
  };
}

function verifyCaptchaChallenge(captchaToken, captchaResponse) {
  if (!captchaToken || !captchaResponse) {
    return false;
  }

  const parsed = decodeToken(captchaToken);
  if (!parsed || !parsed.expiresAt || !parsed.nonce || !parsed.signature) {
    return false;
  }

  if (Date.now() > parsed.expiresAt) {
    return false;
  }

  const normalizedResponse = String(captchaResponse).trim().toUpperCase();
  const expectedSignature = signCaptchaPayload(`${normalizedResponse}:${parsed.expiresAt}:${parsed.nonce}`);

  return crypto.timingSafeEqual(
    Buffer.from(parsed.signature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8')
  );
}

function buildCaptchaSvg(code) {
  const backgroundHue = 250;
  const letters = code.split('').map((character, index) => {
    const x = 24 + (index * 28);
    const y = 34 + (index % 2 === 0 ? -2 : 4);
    const rotate = index % 2 === 0 ? -8 : 7;
    return `<text x="${x}" y="${y}" transform="rotate(${rotate} ${x} ${y})">${character}</text>`;
  }).join('');

  const noiseLines = Array.from({ length: 6 }, (_, index) => {
    const x1 = 10 + (index * 22);
    const y1 = 10 + ((index % 3) * 11);
    const x2 = 176 - (index * 20);
    const y2 = 44 - ((index % 2) * 12);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`;
  }).join('');

  const noiseDots = Array.from({ length: 18 }, (_, index) => {
    const cx = 12 + ((index * 17) % 176);
    const cy = 8 + ((index * 13) % 40);
    const radius = index % 3 === 0 ? 1.7 : 1.1;
    return `<circle cx="${cx}" cy="${cy}" r="${radius}" />`;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="188" height="56" viewBox="0 0 188 56" role="img" aria-label="CAPTCHA challenge">
      <defs>
        <linearGradient id="captchaBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${backgroundHue}, 100%, 98%)" />
          <stop offset="100%" stop-color="hsl(${backgroundHue + 45}, 100%, 94%)" />
        </linearGradient>
      </defs>
      <rect width="188" height="56" rx="16" fill="url(#captchaBg)" />
      <g fill="none" stroke="rgba(108,99,255,0.28)" stroke-width="1.2">
        ${noiseLines}
      </g>
      <g fill="rgba(255,77,148,0.22)">
        ${noiseDots}
      </g>
      <g fill="#3d3565" font-family="'Courier New', monospace" font-size="28" font-weight="700" letter-spacing="4">
        ${letters}
      </g>
    </svg>
  `.trim();
}

module.exports = {
  CAPTCHA_TTL_MS,
  generateCaptchaChallenge,
  verifyCaptchaChallenge
};
