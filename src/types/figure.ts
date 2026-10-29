export type FigureCategory =
  | 'indian-history'
  | 'world-history'
  | 'scientists-inventors'
  | 'leaders-reformers'
  | 'writers-artists'
  | 'explorers-adventurers'
  | 'philosophers-thinkers';

export type HistoricalPeriod =
  | 'Ancient (Before 500 CE)'
  | 'Medieval & Early Modern (500–1750)'
  | 'Modern (1750–Present)';

export type AgeBand = '8-10' | '11-13' | '14-16';

export type VerificationStatus = 'verified' | 'pending-verification' | 'placeholder';

export interface PortraitMetadata {
  imageUrl: string;
  sourcePageUrl: string;
  creatorOrPhotographer: string;
  licence: string;
  requiredAttribution: string;
  verificationStatus: VerificationStatus;
  altText: string;
}

export interface SourceMetadata {
  title: string;
  publisherOrInstitution: string;
  url: string;
  claimSupported: string;
  sourceType: 'museum' | 'archive' | 'scholarly' | 'encyclopaedia' | 'primary-source';
  lastVerificationDate: string;
  verified: boolean;
}

export interface TimelineEvent {
  yearLabel: string;
  event: string;
}

export interface ViewpointEntry {
  topic: string;
  documentedPosition: string;
  historicalContext: string;
}

export interface HistoricalFigure {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  birthYear: number | null;
  deathYear: number | null;
  lifePeriodLabel: string;
  region: string;
  summary: string;
  categories: FigureCategory[];
  historicalPeriod: HistoricalPeriod;
  portrait: PortraitMetadata;
  keyFacts: string[];
  timeline: TimelineEvent[];
  viewpoints: ViewpointEntry[];
  suggestedQuestions: string[];
  sources: SourceMetadata[];
  uncertaintyNotes: string[];
  sensitiveTopicsGuidance: string[];
  personaInstructions: string;
  approvalStatus: 'development-preview' | 'approved-production';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatApiRequest {
  figureSlug: string;
  ageBand: AgeBand;
  studentName?: string;
  messages: ChatMessage[];
}

export interface ChatApiResponse {
  reply: string;
  figureDisplayName: string;
  remainingSessionMessages: number;
  simulationDisclaimer: string;
}
