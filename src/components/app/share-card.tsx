'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DECLARED_LABEL } from '@/lib/guardrails';
import { formatDateFr, formatEuros } from '@/lib/utils';

/**
 * Carte partageable d'un jalon. Elle porte toujours la mention « déclaré »
 * (garde-fou n° 3) et ne formule aucune promesse de revenu (garde-fou n° 2).
 * L'utilisateur choisit librement ce qu'il partage.
 */
export function ShareCard({
  milestoneLabel,
  businessName,
  declaredValue,
  reachedAt,
  canSharePublicly,
}: {
  milestoneLabel: string;
  businessName: string | null;
  declaredValue: number | null;
  reachedAt: string;
  canSharePublicly: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  async function copyText() {
    const text = [
      `${milestoneLabel} — ${businessName ?? 'mon activité'}`,
      declaredValue !== null ? `${formatEuros(declaredValue)} (${DECLARED_LABEL.toLowerCase()})` : null,
      formatDateFr(new Date(reachedAt)),
      'Construit étape par étape avec Nexteo.',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-card bg-plan-900 px-8 py-10 text-white"
      >
        <div className="glow-acier pointer-events-none absolute -right-20 -top-20 size-64" aria-hidden />
        <p className="relative font-display text-xs font-bold tracking-[0.12em] text-white/60">NEXTEO</p>
        <p className="relative mt-6 font-display text-2xl font-bold tracking-[-0.02em]">{milestoneLabel}</p>
        {businessName ? <p className="relative mt-1 text-sm text-white/70">{businessName}</p> : null}
        {declaredValue !== null ? (
          <p className="tabular relative mt-6 font-display text-4xl font-extrabold tracking-[-0.02em]">
            {formatEuros(declaredValue)}
          </p>
        ) : null}
        <p className="relative mt-6 text-xs text-white/60">
          {formatDateFr(new Date(reachedAt))} · {DECLARED_LABEL}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={copyText}>
          {copied ? 'Copié' : 'Copier le texte'}
        </Button>
        {!canSharePublicly ? (
          <p className="text-xs text-beton-600">
            Le partage public s’ouvre à 18 ans. Tu peux garder la carte pour toi d’ici là.
          </p>
        ) : null}
      </div>
    </div>
  );
}
