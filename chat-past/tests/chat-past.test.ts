import { describe, it, expect } from 'vitest';
import { FIGURES_LIBRARY, getFigureBySlug } from '../src/data/figures';
import { validateFigureLibrary } from '../src/lib/validate-library';
import { validateAndSanitizeChatRequest } from '../src/lib/safety';
import { checkAndIncrementRateLimit, computeVisitorKey } from '../src/lib/rate-limit';

describe('Chat Past — Figure Library & Security Validation', () => {
  it('validates all records in the development dataset without errors', () => {
    const result = validateFigureLibrary(FIGURES_LIBRARY);
    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('retrieves known figures by slug and returns undefined for unknown slugs', () => {
    expect(getFigureBySlug('ashoka-the-great')?.displayName).toBe('Emperor Ashoka');
    expect(getFigureBySlug('non-existent-figure')).toBeUndefined();
  });

  it('rejects oversized user messages (>500 chars) and invalid age bands', () => {
    const oversized = 'A'.repeat(505);
    const res1 = validateAndSanitizeChatRequest({
      figureSlug: 'ashoka-the-great',
      ageBand: '11-13',
      messages: [{ role: 'user', content: oversized }],
    });
    expect(res1.ok).toBe(false);

    const res2 = validateAndSanitizeChatRequest({
      figureSlug: 'ashoka-the-great',
      ageBand: '99-100',
      messages: [{ role: 'user', content: 'Hello!' }],
    });
    expect(res2.ok).toBe(false);
  });

  it('rejects conversation histories exceeding 12 messages', () => {
    const thirteenMessages = Array.from({ length: 13 }, (_, idx) => ({
      role: idx % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${idx + 1}`,
    }));
    const res = validateAndSanitizeChatRequest({
      figureSlug: 'ashoka-the-great',
      ageBand: '8-10',
      messages: thirteenMessages,
    });
    expect(res.ok).toBe(false);
  });

  it('enforces per-minute rate limits per visitor key', () => {
    const key = computeVisitorKey('203.0.113.10', 'test-session-1');
    for (let i = 0; i < 5; i++) {
      expect(checkAndIncrementRateLimit(key).allowed).toBe(true);
    }
    const sixth = checkAndIncrementRateLimit(key);
    expect(sixth.allowed).toBe(false);
  });
});
