'use client';

import { useState } from 'react';
import { PortraitMetadata } from '@/types/figure';

interface Props {
  portrait: PortraitMetadata;
  displayName: string;
  priority?: boolean;
}

export function PortraitImage({ portrait, displayName, priority = false }: Props) {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  if (!portrait.imageUrl || hasError || portrait.verificationStatus === 'placeholder') {
    return (
      <div
        role="img"
        aria-label={portrait.altText || `Archival monogram placeholder for ${displayName}`}
        className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-parchment-200 to-parchment-300 p-4 text-center"
      >
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-bronze-500/40 bg-parchment-50 font-serif text-xl font-bold text-bronze-700 shadow-inner">
          {initials}
        </div>
        <span className="text-xs font-semibold text-ink-800">{displayName}</span>
        <span className="mt-1 text-[11px] text-bronze-700">
          Archival Emblem (No contemporary portrait)
        </span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-parchment-200">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-parchment-200" aria-hidden="true" />
      )}
      <img
        src={portrait.imageUrl}
        alt={portrait.altText}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
}
