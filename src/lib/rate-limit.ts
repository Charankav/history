import { APP_CONFIG } from '../config/limits';
import crypto from 'crypto';

interface VisitorBucket {
  minuteCount: number;
  minuteResetAt: number;
  dayCount: number;
  dayResetAt: number;
}

// Note: In a multi-instance serverless deployment, configure Upstash Redis or Vercel KV
// via an adapter if strict cross-instance synchronisation is required.
// To avoid blocking an entire school classroom sharing one NAT IP, we combine a salted hash
// of the IP address with an ephemeral per-browser session header (`x-chatpast-visitor`).
const visitorStore = new Map<string, VisitorBucket>();

export function computeVisitorKey(ip: string, visitorHeader: string | null): string {
  const safeSession = (visitorHeader || 'anon').slice(0, 64);
  return crypto.createHash('sha256').update(`${ip}::${safeSession}`).digest('hex').slice(0, 32);
}

export function checkAndIncrementRateLimit(visitorKey: string): {
  allowed: boolean;
  reason?: string;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const minuteWindowMs = 60 * 1000;
  const dayWindowMs = 24 * 60 * 60 * 1000;

  let bucket = visitorStore.get(visitorKey);
  if (!bucket) {
    bucket = {
      minuteCount: 0,
      minuteResetAt: now + minuteWindowMs,
      dayCount: 0,
      dayResetAt: now + dayWindowMs,
    };
  }

  if (now > bucket.minuteResetAt) {
    bucket.minuteCount = 0;
    bucket.minuteResetAt = now + minuteWindowMs;
  }
  if (now > bucket.dayResetAt) {
    bucket.dayCount = 0;
    bucket.dayResetAt = now + dayWindowMs;
  }

  if (bucket.minuteCount >= APP_CONFIG.limits.maxRequestsPerMinute) {
    const retryAfterSeconds = Math.ceil((bucket.minuteResetAt - now) / 1000);
    return {
      allowed: false,
      reason: `You are asking questions very quickly! Please wait ${retryAfterSeconds} seconds before sending your next question.`,
      retryAfterSeconds,
    };
  }

  if (bucket.dayCount >= APP_CONFIG.limits.maxRequestsPerDay) {
    const retryAfterSeconds = Math.ceil((bucket.dayResetAt - now) / 1000);
    return {
      allowed: false,
      reason: `You have reached today's limit of ${APP_CONFIG.limits.maxRequestsPerDay} questions. Please come back tomorrow to continue exploring history!`,
      retryAfterSeconds,
    };
  }

  bucket.minuteCount += 1;
  bucket.dayCount += 1;
  visitorStore.set(visitorKey, bucket);

  return { allowed: true };
}
