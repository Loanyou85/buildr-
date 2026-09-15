'use client';

import { useState } from 'react';
import type { Question } from '@/lib/diagnostic/questions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Choix {
  value: string;
  label: string;
  hint?: string;
}

/**
 * Un choix unique est un bouton d'envoi natif : cliquer envoie le formulaire
 * et passe à la question suivante, sans attendre que le JavaScript soit
 * chargé. L'état local ne sert qu'à marquer la carte pendant la navigation.
 */
function ChoixUnique({ options }: { options: Choix[] }) {
  const [choisi, setChoisi] = useState<string | null>(null);
  return (
    <div className="space-y-2.5">
      {options.map((option) => {
        const actif = choisi === option.value;
        return (
          <button
            key={option.value}
            type="submit"
            name="value"
            value={option.value}
            onClick={() => setChoisi(option.value)}
            className={cn(
              'tactile flex w-full items-center justify-between gap-3 rounded-[--radius-card] border px-4 py-3.5 text-left transition-colors',
              actif
                ? 'border-neo-500/60 bg-neo-500/10'
                : choisi
                  ? 'border-gris-700 bg-nuit-800 opacity-40'
                  : 'border-gris-700 bg-nuit-800 hover:border-neo-500/30',
            )}
          >
            <span>
              <span className="block text-sm font-medium text-white">{option.label}</span>
              {option.hint ? <span className="mt-0.5 block text-xs text-gris-300">{option.hint}</span> : null}
            </span>
            <span
              aria-hidden
              className={cn(
                'h-5 w-5 shrink-0 rounded-full border',
                actif ? 'border-neo-500 bg-neo-500' : 'border-gris-700',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Case à cocher sans état React : l'apparence est pilotée en CSS, par l'état
 * de la case native.
 *
 * C'est délibéré. Une version contrôlée ne dessinait la coche qu'après
 * l'hydratation, et un clic avant celle-ci était annulé — la case se cochait
 * puis se décochait toute seule.
 */
function Case({ value, label, hint }: Choix) {
  return (
    <label className="group tactile flex cursor-pointer items-center justify-between gap-3 rounded-[--radius-card] border border-gris-700 bg-nuit-800 px-4 py-3 transition-colors has-[:checked]:border-neo-500/60 has-[:checked]:bg-neo-500/10">
      <input type="checkbox" name="value" value={value} className="sr-only" />
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-gris-300">{hint}</span> : null}
      </span>
      <span
        aria-hidden
        className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-gris-700 group-has-[:checked]:border-neo-500 group-has-[:checked]:bg-neo-500"
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3 opacity-0 group-has-[:checked]:opacity-100" fill="none">
          <path d="M3 8.5l3.2 3.2L13 5" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  );
}

/**
 * Compétence à trois états : ignorée, « je sais faire » (3), « je suis
 * vraiment bon » (5). Un seul appui fait avancer l'état.
 */
function Competence({ value, label }: Choix) {
  const [niveau, setNiveau] = useState(0);
  const suivant = () => setNiveau((n) => (n === 0 ? 3 : n === 3 ? 5 : 0));
  return (
    <>
      {niveau > 0 ? <input type="hidden" name="value" value={`${value}:${niveau}`} /> : null}
      <button
        type="button"
        onClick={suivant}
        aria-pressed={niveau > 0}
        className={cn(
          'tactile flex w-full items-center justify-between gap-3 rounded-[--radius-card] border px-4 py-3 text-left transition-colors',
          niveau === 0 && 'border-gris-700 bg-nuit-800',
          niveau === 3 && 'border-neo-500/40 bg-neo-500/10',
          niveau === 5 && 'border-neo-500 bg-neo-500/20',
        )}
      >
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="shrink-0 text-xs text-gris-300">
          {niveau === 0 ? '—' : niveau === 3 ? 'je sais faire' : 'très à l’aise'}
        </span>
      </button>
    </>
  );
}

/**
 * Curseur non contrôlé : le champ natif reste la source de vérité, le
 * JavaScript ne sert qu'à afficher la valeur au-dessus.
 */
function Curseur({ question }: { question: Question }) {
  const [valeur, setValeur] = useState(question.defaultValue ?? question.min ?? 0);
  return (
    <div className="pt-2">
      <p className="mb-6 text-center font-display text-2xl font-extrabold tabular text-white">
        {valeur.toLocaleString('fr-FR')}
        <span className="ml-2 text-base font-medium text-gris-300">{question.unit}</span>
      </p>
      <input
        type="range"
        name="value"
        min={question.min ?? 0}
        max={question.max ?? 100}
        step={question.step ?? 1}
        defaultValue={question.defaultValue ?? question.min ?? 0}
        onChange={(event) => setValeur(Number(event.currentTarget.value))}
        className="h-11 w-full accent-[--color-neo-500]"
        aria-label={question.title}
      />
      <div className="mt-1 flex justify-between text-xs text-gris-300 tabular">
        <span>{(question.min ?? 0).toLocaleString('fr-FR')}</span>
        <span>{(question.max ?? 100).toLocaleString('fr-FR')}</span>
      </div>
    </div>
  );
}

export function QuestionScreen({ question, options }: { question: Question; options: Choix[] }) {
  if (question.kind === 'choice') return <ChoixUnique options={question.options ?? options} />;

  if (question.kind === 'multi') {
    return (
      <div className="space-y-2.5">
        {options.map((option) => (
          <Case key={option.value} {...option} />
        ))}
      </div>
    );
  }

  if (question.kind === 'skills') {
    return (
      <div className="space-y-2.5">
        {options.map((option) => (
          <Competence key={option.value} {...option} />
        ))}
      </div>
    );
  }

  if (question.kind === 'slider') return <Curseur question={question} />;

  return (
    <Textarea
      name="value"
      rows={5}
      placeholder={question.placeholder}
      aria-label={question.title}
      maxLength={2000}
    />
  );
}

/** Le bouton de validation, affiché seulement quand le choix n'est pas unique. */
export function ValiderQuestion({ label }: { label: string }) {
  return (
    <Button type="submit" taille="bloc">
      {label}
    </Button>
  );
}
