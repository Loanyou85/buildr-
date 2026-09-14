'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { reorderSteps } from '@/server/actions/admin';

interface StepRow {
  id: string;
  number: number;
  title: string;
  detail: string;
}

/**
 * Réordonnancement par glisser-déposer (section 8.9), avec des boutons en
 * repli : le glisser seul exclurait le clavier et le tactile imprécis.
 */
export function StepReorder({ journeyId, steps }: { journeyId: string; steps: StepRow[] }) {
  const [order, setOrder] = useState(steps);
  const [dragging, setDragging] = useState<string | null>(null);
  const dirty = order.map((s) => s.id).join(',') !== steps.map((s) => s.id).join(',');

  function move(id: string, direction: -1 | 1) {
    setOrder((current) => {
      const index = current.findIndex((s) => s.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      if (item) next.splice(target, 0, item);
      return next;
    });
  }

  function dropOn(targetId: string) {
    if (!dragging || dragging === targetId) return;
    setOrder((current) => {
      const from = current.findIndex((s) => s.id === dragging);
      const to = current.findIndex((s) => s.id === targetId);
      if (from === -1 || to === -1) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      if (item) next.splice(to, 0, item);
      return next;
    });
    setDragging(null);
  }

  if (steps.length === 0) {
    return <p className="mt-3 text-sm text-beton-600">Aucune étape dans cette phase.</p>;
  }

  return (
    <div className="mt-4">
      <ul className="space-y-2">
        {order.map((step, index) => (
          <li
            key={step.id}
            draggable
            onDragStart={() => setDragging(step.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropOn(step.id)}
            className="flex flex-wrap items-center gap-3 rounded-card border border-beton-300 bg-blanc px-4 py-3"
          >
            <span className="tabular w-6 shrink-0 font-display text-sm font-bold text-beton-300">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1">
              <Link href={`/admin/etape/${step.id}`} className="block text-sm text-encre hover:text-acier">
                {step.title}
              </Link>
              <span className="block text-xs text-beton-600">{step.detail}</span>
            </span>
            <span className="flex gap-1">
              <button
                type="button"
                onClick={() => move(step.id, -1)}
                aria-label={`Monter ${step.title}`}
                className="size-8 rounded-lg border border-beton-300 text-sm text-beton-600 hover:border-acier hover:text-acier"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(step.id, 1)}
                aria-label={`Descendre ${step.title}`}
                className="size-8 rounded-lg border border-beton-300 text-sm text-beton-600 hover:border-acier hover:text-acier"
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ul>

      {dirty ? (
        <form action={reorderSteps} className="mt-3">
          <input type="hidden" name="journeyId" value={journeyId} />
          <input type="hidden" name="order" value={order.map((s) => s.id).join(',')} />
          <Button type="submit" variant="acier" size="sm">
            Enregistrer l’ordre
          </Button>
        </form>
      ) : null}
    </div>
  );
}
