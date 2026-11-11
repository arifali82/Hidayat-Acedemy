import { createHmac, timingSafeEqual } from 'node:crypto';
import { CENTERS, SLOT_TIMES } from './constants';

const TOKEN_TTL_MS = 365 * 24 * 60 * 60 * 1000;

export function hasAdmitCardSigningSecret(secret) {
  return typeof secret === 'string' && secret.length >= 32;
}

export function isValidAdmitCardDetails(details) {
  if (!details || typeof details !== 'object') return false;

  const examDate = typeof details.examDate === 'string' ? new Date(`${details.examDate}T00:00:00.000Z`) : null;
  const room = Number(details.room);
  const seat = Number(details.seat);

  return (
    typeof details.applicationNo === 'string' &&
    /^2026\d{6}$/.test(details.applicationNo) &&
    typeof details.rollNumber === 'string' &&
    /^H1448\d{7}$/.test(details.rollNumber) &&
    typeof details.fullName === 'string' &&
    details.fullName.trim().length >= 2 &&
    details.fullName.length <= 100 &&
    typeof details.examCenter === 'string' &&
    Object.prototype.hasOwnProperty.call(CENTERS, details.examCenter) &&
    examDate instanceof Date &&
    Number.isFinite(examDate.getTime()) &&
    examDate.toISOString().slice(0, 10) === details.examDate &&
    Object.prototype.hasOwnProperty.call(SLOT_TIMES, details.examSlot) &&
    details.examTime === SLOT_TIMES[details.examSlot] &&
    Number.isInteger(room) &&
    room >= 1 &&
    room <= 8 &&
    Number.isInteger(seat) &&
    seat >= 1 &&
    seat <= 40
  );
}

export function createAdmitCardToken(details, paymentId, secret, now = Date.now()) {
  if (!hasAdmitCardSigningSecret(secret)) {
    throw new Error('Admit-card signing is not configured.');
  }
  if (!isValidAdmitCardDetails(details) || typeof paymentId !== 'string' || !/^pay_[A-Za-z0-9]+$/.test(paymentId)) {
    throw new Error('Verified payment order has invalid admit-card details.');
  }

  const payload = {
    v: 1,
    a: details.applicationNo,
    r: details.rollNumber,
    n: details.fullName.trim(),
    c: details.examCenter,
    d: details.examDate,
    s: details.examSlot,
    m: Number(details.room),
    z: Number(details.seat),
    e: now + TOKEN_TTL_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signedValue = `v1.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(signedValue).digest('base64url');

  return `${signedValue}.${signature}`;
}

export function verifyAdmitCardToken(token, secret, now = Date.now()) {
  if (!hasAdmitCardSigningSecret(secret)) return { valid: false, reason: 'unavailable' };
  if (typeof token !== 'string' || token.length > 4096) return { valid: false, reason: 'invalid' };

  const [version, encodedPayload, signature, extra] = token.split('.');
  if (version !== 'v1' || !encodedPayload || !signature || extra !== undefined) {
    return { valid: false, reason: 'invalid' };
  }

  const signedValue = `${version}.${encodedPayload}`;
  const expectedSignature = createHmac('sha256', secret).update(signedValue).digest();
  let receivedSignature;
  try {
    receivedSignature = Buffer.from(signature, 'base64url');
  } catch {
    return { valid: false, reason: 'invalid' };
  }

  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature)
  ) {
    return { valid: false, reason: 'invalid' };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return { valid: false, reason: 'invalid' };
  }

  const card = payload && {
    applicationNo: payload.a,
    rollNumber: payload.r,
    fullName: payload.n,
    examCenter: payload.c,
    examDate: payload.d,
    examSlot: payload.s,
    examTime: SLOT_TIMES[payload.s],
    room: payload.m,
    seat: payload.z,
  };

  if (
    payload?.v !== 1 ||
    !isValidAdmitCardDetails(card) ||
    !Number.isSafeInteger(payload.e) ||
    payload.e > now + TOKEN_TTL_MS + 60_000
  ) {
    return { valid: false, reason: 'invalid' };
  }

  if (payload.e <= now) return { valid: false, reason: 'expired' };

  return { valid: true, card: { ...card, expiresAt: payload.e } };
}
