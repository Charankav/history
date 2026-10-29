export const APP_CONFIG = {
  brandName: 'Chat Past',
  tagline: 'Talk to the past.',
  defaultModel: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
  limits: {
    maxUserMessageChars: Number(process.env.MAX_USER_MESSAGE_CHARS) || 500,
    maxConversationHistoryMessages: Number(process.env.MAX_CONVERSATION_MESSAGES) || 12,
    maxMessagesPerConversation: Number(process.env.MAX_CONVERSATION_MESSAGES) || 12,
    maxOutputTokens: Number(process.env.MAX_OUTPUT_TOKENS) || 280,
    maxRequestsPerMinute: Number(process.env.RATE_LIMIT_RPM) || 5,
    maxRequestsPerDay: Number(process.env.RATE_LIMIT_RPD) || 30,
    apiTimeoutMs: 18000,
    maxStudentNameChars: 30,
  },
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  'indian-history': 'Indian History',
  'world-history': 'World History',
  'scientists-inventors': 'Scientists & Inventors',
  'leaders-reformers': 'Leaders & Reformers',
  'writers-artists': 'Writers & Artists',
  'explorers-adventurers': 'Explorers & Adventurers',
  'philosophers-thinkers': 'Philosophers & Thinkers',
};
