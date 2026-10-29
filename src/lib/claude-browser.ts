import { APP_CONFIG } from '../config/limits';
import { getFigureBySlug } from '../data/figures';
import { buildSystemPrompt } from './persona-prompt';
import { validateAndSanitizeChatRequest } from './safety';
import { AgeBand, ChatMessage } from '../types/figure';

// The API key is typed in by the teacher and kept ONLY in this browser's localStorage.
// It is never written into the code or the GitHub repository.
const KEY_STORAGE = 'chatpast_anthropic_key';
const MODEL_STORAGE = 'chatpast_model';
const USAGE_STORAGE = 'chatpast_usage';

export const DEFAULT_MODEL = 'claude-haiku-5-5';

function safeGet(key: string): string {
  try {
    return window.localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function safeSet(key: string, value: string) {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export const getApiKey = () => safeGet(KEY_STORAGE);
export const setApiKey = (k: string) => safeSet(KEY_STORAGE, k.trim());
export const getModel = () => safeGet(MODEL_STORAGE) || DEFAULT_MODEL;
export const setModel = (m: string) => safeSet(MODEL_STORAGE, m.trim());

// Simple per-browser rate limit (replaces the old server-side limiter)
function checkRateLimit(): string | null {
  const now = Date.now();
  let stamps: number[] = [];
  try {
    stamps = JSON.parse(safeGet(USAGE_STORAGE) || '[]');
  } catch {
    stamps = [];
  }
  stamps = stamps.filter((t) => now - t < 24 * 60 * 60 * 1000);
  const lastMinute = stamps.filter((t) => now - t < 60 * 1000).length;
  if (lastMinute >= APP_CONFIG.limits.maxRequestsPerMinute) {
    return 'Please wait a minute before asking another question.';
  }
  if (stamps.length >= APP_CONFIG.limits.maxRequestsPerDay) {
    return 'The daily question limit for this device has been reached. Please come back tomorrow.';
  }
  stamps.push(now);
  safeSet(USAGE_STORAGE, JSON.stringify(stamps));
  return null;
}

export async function askFigure(
  figureSlug: string,
  ageBand: AgeBand,
  messages: ChatMessage[]
): Promise<{ reply?: string; error?: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { error: 'No Claude API key is set on this device. Ask your teacher to open "Teacher Settings" and add the key.' };
  }

  const validation = validateAndSanitizeChatRequest({ figureSlug, ageBand, messages });
  if (!validation.ok || !validation.sanitizedRequest) {
    return { error: validation.error || 'Invalid request.' };
  }

  const figure = getFigureBySlug(figureSlug);
  if (!figure) return { error: 'Selected historical figure was not found.' };

  const limitError = checkRateLimit();
  if (limitError) return { error: limitError };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), APP_CONFIG.limits.apiTimeoutMs);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: getModel(),
        max_tokens: APP_CONFIG.limits.maxOutputTokens,
        system: buildSystemPrompt(figure, ageBand, validation.piiWarning),
        messages: validation.sanitizedRequest.messages,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return { error: 'The Claude API key on this device is not valid. Please check it in Teacher Settings.' };
      }
      if (res.status === 429) {
        return { error: 'Claude is busy right now. Please wait a moment and try again.' };
      }
      const msg = (data as { error?: { message?: string } })?.error?.message;
      return { error: `Claude could not answer (${res.status})${msg ? `: ${msg}` : '.'}` };
    }

    const blocks = (data as { content?: { type: string; text?: string }[] }).content || [];
    const text = blocks.find((b) => b.type === 'text')?.text?.trim();
    return {
      reply:
        text ||
        'I apologise, but I could not form a complete answer right now. Please try asking your question again.',
    };
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') {
      return { error: 'Claude took too long to answer. Please try again.' };
    }
    return { error: 'Network connection error. Please check your connection and try again.' };
  } finally {
    clearTimeout(timer);
  }
}
