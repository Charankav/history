import { HistoricalFigure } from '../types/figure';

export interface ValidationIssue {
  figureId: string;
  field: string;
  message: string;
}

export function validateFigureLibrary(figures: HistoricalFigure[]): {
  valid: boolean;
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const fig of figures) {
    if (!fig.id || !/^[a-z0-9-]+$/.test(fig.id)) {
      issues.push({ figureId: fig.id || 'UNKNOWN', field: 'id', message: 'Invalid or missing stable ID.' });
    }
    if (seenIds.has(fig.id)) {
      issues.push({ figureId: fig.id, field: 'id', message: `Duplicate ID detected: ${fig.id}` });
    }
    seenIds.add(fig.id);

    if (!fig.slug || !/^[a-z0-9-]+$/.test(fig.slug)) {
      issues.push({ figureId: fig.id, field: 'slug', message: 'Invalid or missing URL-safe slug.' });
    }
    if (seenSlugs.has(fig.slug)) {
      issues.push({ figureId: fig.id, field: 'slug', message: `Duplicate slug detected: ${fig.slug}` });
    }
    seenSlugs.add(fig.slug);

    if (fig.birthYear !== null && fig.deathYear !== null && fig.birthYear > fig.deathYear) {
      issues.push({
        figureId: fig.id,
        field: 'birthYear/deathYear',
        message: `birthYear (${fig.birthYear}) cannot be greater than deathYear (${fig.deathYear}).`,
      });
    }

    if (!fig.categories || fig.categories.length === 0) {
      issues.push({ figureId: fig.id, field: 'categories', message: 'At least one category is required.' });
    }

    if (!fig.sources || fig.sources.length === 0) {
      issues.push({ figureId: fig.id, field: 'sources', message: 'At least one reliable historical source is required.' });
    } else {
      for (const src of fig.sources) {
        if (!src.url.startsWith('https://')) {
          issues.push({ figureId: fig.id, field: 'sources.url', message: `Source URL must use HTTPS: ${src.url}` });
        }
      }
    }

    if (!fig.portrait.sourcePageUrl.startsWith('https://') && fig.portrait.verificationStatus !== 'placeholder') {
      issues.push({
        figureId: fig.id,
        field: 'portrait.sourcePageUrl',
        message: 'Non-placeholder portraits must have an HTTPS sourcePageUrl.',
      });
    }

    if (!fig.suggestedQuestions || fig.suggestedQuestions.length < 3) {
      issues.push({
        figureId: fig.id,
        field: 'suggestedQuestions',
        message: 'At least 3 suggested student questions are required.',
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
