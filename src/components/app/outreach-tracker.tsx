'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { recordOutreach } from '@/server/actions/journey';

/**
 * Compteur de prospection. C'est la donnée qui déclenche la règle d'adaptation
 * « taux de réponse anormalement bas » (section 10). On ne juge rien avant
 * 30 envois : c'est écrit dans l'étape, et la règle l'applique.
 */
export function OutreachTracker({
  stepId,
  sent,
  replies,
}: {
  stepId: string;
  sent: number | null;
  replies: number | null;
}) {
  const rate = sent && sent > 0 ? Math.round(((replies ?? 0) / sent) * 100) : null;

  return (
    <section className="mt-10 rounded-card border border-beton-300 bg-blanc p-5">
      <p className="text-sm font-medium text-encre">Où tu en es</p>
      <p className="mt-1 text-sm text-beton-600">
        Note tes chiffres au fur et à mesure. Ils servent à repérer si le problème vient du volume ou du
        message.
      </p>

      <form action={recordOutreach} className="mt-4 flex flex-wrap items-end gap-3">
        <input type="hidden" name="stepId" value={stepId} />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-beton-600">Messages envoyés</span>
          <Input
            type="number"
            name="sent"
            min={0}
            max={10000}
            defaultValue={sent ?? 0}
            className="tabular w-32"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-beton-600">Réponses reçues</span>
          <Input
            type="number"
            name="replies"
            min={0}
            max={10000}
            defaultValue={replies ?? 0}
            className="tabular w-32"
          />
        </label>
        <Button type="submit" variant="outline">
          Enregistrer
        </Button>
      </form>

      {rate !== null ? (
        <p className="tabular mt-4 text-sm text-beton-600">
          Taux de réponse : {rate} %
          {sent !== null && sent < 30 ? ' — trop tôt pour en tirer une conclusion, continue.' : ''}
        </p>
      ) : null}
    </section>
  );
}
