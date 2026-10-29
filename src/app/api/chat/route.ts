import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { APP_CONFIG } from '@/config/limits';
import { getFigureBySlug } from '@/data/figures';
import { validateAndSanitizeChatRequest } from '@/lib/safety';
import { checkAndIncrementRateLimit, computeVisitorKey } from '@/lib/rate-limit';
import { buildSystemPrompt } from '@/lib/persona-prompt';

export async function POST(req: NextRequest) {
  // 1. Fail closed if server environment is missing the secret API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'replace_with_your_key') {
    return NextResponse.json(
      {
        error:
          'The historical chat service is not configured yet. Please ask the site administrator to set a valid ANTHROPIC_API_KEY in .env.local.',
      },
      { status: 503 }
    );
  }

  // 2. Enforce server-side rate limiting before parsing or calling Claude
  const forwardedFor = req.headers.get('x-forwarded-for');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const visitorHeader = req.headers.get('x-chatpast-visitor');
  const visitorKey = computeVisitorKey(clientIp, visitorHeader);

  const rateCheck = checkAndIncrementRateLimit(visitorKey);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: rateCheck.reason },
      {
        status: 429,
        headers: rateCheck.retryAfterSeconds
          ? { 'Retry-After': String(rateCheck.retryAfterSeconds) }
          : undefined,
      }
    );
  }

  // 3. Parse and validate incoming payload
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const validation = validateAndSanitizeChatRequest(rawBody);
  if (!validation.ok || !validation.sanitizedRequest) {
    return NextResponse.json(
      { error: validation.error || 'Invalid request.' },
      { status: validation.statusCode || 400 }
    );
  }

  const { figureSlug, ageBand, messages } = validation.sanitizedRequest;

  // 4. Load trusted figure profile strictly from server-side library
  const figure = getFigureBySlug(figureSlug);
  if (!figure) {
    return NextResponse.json(
      { error: 'Selected historical figure was not found in the verified museum collection.' },
      { status: 404 }
    );
  }

  // 5. Build trusted system instruction (do not include studentName in model calls after client-side greeting)
  const systemPrompt = buildSystemPrompt(figure, ageBand, validation.piiWarning);

  // 6. Call Anthropic SDK with strict timeout and output token bounds
  const anthropic = new Anthropic({
    apiKey,
    timeout: APP_CONFIG.limits.apiTimeoutMs,
    maxRetries: 0, // Avoid automatic retries that multiply API costs
  });

  try {
    const response = await anthropic.messages.create({
      model: APP_CONFIG.defaultModel,
      max_tokens: APP_CONFIG.limits.maxOutputTokens,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const replyText =
      textBlock && 'text' in textBlock
        ? textBlock.text.trim()
        : 'I apologise, but I could not form a complete answer right now. Please try asking your question again.';

    const remainingSessionMessages = Math.max(
      0,
      APP_CONFIG.limits.maxMessagesPerConversation - messages.length
    );

    return NextResponse.json({
      reply: replyText,
      figureDisplayName: figure.displayName,
      remainingSessionMessages,
      simulationDisclaimer:
        'AI historical simulation based on documented sources — not the real historical person.',
    });
  } catch (err: unknown) {
    // Log only non-sensitive error status metadata (never log chat messages, student names, or API keys)
    const status = (err as { status?: number })?.status || 500;
    console.error(`[ChatPast API] Anthropic request failed with status ${status}`);

    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: 'The AI service credentials could not be verified on the server.' },
        { status: 503 }
      );
    }
    if (status === 429) {
      return NextResponse.json(
        { error: 'The museum archive is currently busy helping other students. Please wait a moment and try again.' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'We could not reach the historical simulation service right now. Please try again in a moment.' },
      { status: 502 }
    );
  }
}
