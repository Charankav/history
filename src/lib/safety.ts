import { APP_CONFIG } from '../config/limits';
import { AgeBand, ChatApiRequest } from '../types/figure';

const ALLOWED_AGE_BANDS: AgeBand[] = ['8-10', '11-13', '14-16'];

// Basic PII & harmful request screening before calling Claude API
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/;
const UNSAFE_PATTERNS = [
  /how to make a (bomb|weapon|explosive|poison)/i,
  /self[-\s]?harm|suicide/i,
  /explicit sexual|pornograph/i,
];

export interface ValidationResult {
  ok: boolean;
  error?: string;
  statusCode?: number;
  sanitizedRequest?: ChatApiRequest;
  piiWarning?: boolean;
}

export function validateAndSanitizeChatRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request payload.', statusCode: 400 };
  }

  const raw = body as Record<string, unknown>;
  const allowedKeys = new Set(['figureSlug', 'ageBand', 'studentName', 'messages']);
  for (const key of Object.keys(raw)) {
    if (!allowedKeys.has(key)) {
      return { ok: false, error: `Disallowed request field: ${key}`, statusCode: 400 };
    }
  }

  const figureSlug = typeof raw.figureSlug === 'string' ? raw.figureSlug.trim() : '';
  if (!figureSlug || !/^[a-z0-9-]+$/.test(figureSlug)) {
    return { ok: false, error: 'Invalid historical figure identifier.', statusCode: 400 };
  }

  const ageBand = raw.ageBand as AgeBand;
  if (!ALLOWED_AGE_BANDS.includes(ageBand)) {
    return { ok: false, error: 'Please select a valid age band (8-10, 11-13, or 14-16).', statusCode: 400 };
  }

  let studentName: string | undefined;
  if (typeof raw.studentName === 'string' && raw.studentName.trim().length > 0) {
    const cleaned = raw.studentName.trim().slice(0, APP_CONFIG.limits.maxStudentNameChars);
    // Strip anything other than letters, spaces, hyphens, or apostrophes
    studentName = cleaned.replace(/[^\p{L}\s'-]/gu, '').trim() || undefined;
  }

  if (!Array.isArray(raw.messages) || raw.messages.length === 0) {
    return { ok: false, error: 'Conversation must include at least one student question.', statusCode: 400 };
  }

  if (raw.messages.length > APP_CONFIG.limits.maxConversationHistoryMessages) {
    return {
      ok: false,
      error: `This conversation has reached the ${APP_CONFIG.limits.maxConversationHistoryMessages}-message session limit. Please clear or start a new conversation.`,
      statusCode: 400,
    };
  }

  const sanitizedMessages = [];
  for (const msg of raw.messages) {
    if (!msg || typeof msg !== 'object') {
      return { ok: false, error: 'Malformed message entry.', statusCode: 400 };
    }
    const role = (msg as Record<string, unknown>).role;
    const content = (msg as Record<string, unknown>).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') {
      return { ok: false, error: 'Invalid message role or content.', statusCode: 400 };
    }
    const trimmed = content.trim();
    if (!trimmed) {
      return { ok: false, error: 'Message content cannot be empty.', statusCode: 400 };
    }
    if (role === 'user' && trimmed.length > APP_CONFIG.limits.maxUserMessageChars) {
      return {
        ok: false,
        error: `Please keep your question under ${APP_CONFIG.limits.maxUserMessageChars} characters.`,
        statusCode: 400,
      };
    }
    sanitizedMessages.push({ role: role as 'user' | 'assistant', content: trimmed });
  }

  const latestMessage = sanitizedMessages[sanitizedMessages.length - 1];
  if (latestMessage.role !== 'user') {
    return { ok: false, error: 'The latest message must be from the student.', statusCode: 400 };
  }

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(latestMessage.content)) {
      return {
        ok: false,
        error: 'Chat Past is a history learning space for students. I cannot help with dangerous or harmful topics, but we can explore historical events, inventions, or ideas instead.',
        statusCode: 422,
      };
    }
  }

  const piiWarning = EMAIL_REGEX.test(latestMessage.content) || PHONE_REGEX.test(latestMessage.content);

  return {
    ok: true,
    piiWarning,
    sanitizedRequest: {
      figureSlug,
      ageBand,
      studentName,
      messages: sanitizedMessages,
    },
  };
}
