'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Question } from '@/lib/onboarding/questions';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/progress-bar';
import { goToQuestion, saveAnswer } from '@/server/actions/onboarding';
import { cn } from '@/lib/utils';

interface SkillRow {
  id: string;
  slug: string;
  label: string;
  category: string;
}
interface InterestRow {
  id: string;
  slug: string;
  label: string;
}

/**
 * Un écran, une question, rien à taper (section 8.2).
 *
 * Choix unique : chaque carte est elle-même le bouton d'envoi du formulaire.
 * Cliquer répond et enchaîne — pas de « Continuer » à chercher, et ça
 * fonctionne même sans JavaScript.
 * Choix multiple : des cases, puis un « Continuer ».
 */
export function QuestionScreen({
  question,
  index,
  total,
  sectionLabel,
  skills,
  interests,
  currentValue,
  isFirst,
}: {
  question: Question;
  index: number;
  total: number;
  sectionLabel: string;
  skills: SkillRow[];
  interests: InterestRow[];
  currentValue: string | string[] | null;
  isFirst: boolean;
}) {
  const reduced = useReducedMotion();
  const percent = Math.round((index / total) * 100);
  const isSingle = question.kind === 'choice';

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8">
      <header>
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-beton-600">{sectionLabel}</p>
          <p className="tabular text-sm text-beton-600">
            {index + 1} / {total}
          </p>
        </div>
        <ProgressBar value={percent} className="mt-3" label="Progression de l’onboarding" />
      </header>

      <motion.main
        key={question.key}
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-1 flex-col justify-center py-10"
      >
        {isFirst ? (
          <p className="prose-nexteo mb-6 text-base text-beton-600">
            On commence par toi. Plus on comprend qui tu es, plus ton parcours sera personnalisé.
          </p>
        ) : null}

        <h1 className="text-2xl">{question.title}</h1>
        {question.help ? <p className="prose-nexteo mt-3 text-base text-beton-600">{question.help}</p> : null}

        <form action={saveAnswer} className="mt-8">
          <input type="hidden" name="key" value={question.key} />

          {isSingle ? (
            <SingleChoice question={question} currentValue={currentValue} />
          ) : (
            <>
              <MultiChoice
                question={question}
                skills={skills}
                interests={interests}
                currentValue={currentValue}
              />
              <div className="mt-8 flex items-center gap-3">
                <Button type="submit" variant="signal" size="lg">
                  Continuer
                </Button>
                {question.optional ? (
                  <Button type="submit" variant="ghost" name="value" value="">
                    Passer
                  </Button>
                ) : null}
              </div>
            </>
          )}
        </form>

        {index > 0 ? (
          <form action={goToQuestion} className="mt-8">
            <input type="hidden" name="index" value={index - 1} />
            <button
              type="submit"
              className="text-sm text-beton-600 underline-offset-4 hover:text-encre hover:underline"
            >
              ← Revenir à la question précédente
            </button>
          </form>
        ) : null}
      </motion.main>
    </div>
  );
}

/** Carte cliquable qui répond et enchaîne : c'est un bouton d'envoi. */
function SingleChoice({
  question,
  currentValue,
}: {
  question: Question;
  currentValue: string | string[] | null;
}) {
  return (
    <div className="space-y-2.5">
      {question.options?.map((option) => {
        const selected = currentValue === option.value;
        return (
          <button
            key={option.value}
            type="submit"
            name="value"
            value={option.value}
            className={cn(
              'group flex w-full items-center gap-4 rounded-card border bg-blanc p-4 text-left transition-[border-color,transform] duration-150 hover:border-acier active:scale-[0.995]',
              selected ? 'border-acier' : 'border-beton-300',
            )}
          >
            <span
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full border text-xs transition-colors',
                selected
                  ? 'border-acier bg-acier text-white'
                  : 'border-beton-300 group-hover:border-acier',
              )}
              aria-hidden
            >
              {selected ? '✓' : ''}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base text-encre">{option.label}</span>
              {option.hint ? <span className="block text-sm text-beton-600">{option.hint}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MultiChoice({
  question,
  skills,
  interests,
  currentValue,
}: {
  question: Question;
  skills: SkillRow[];
  interests: InterestRow[];
  currentValue: string | string[] | null;
}) {
  const selected = new Set(Array.isArray(currentValue) ? currentValue : []);

  if (question.kind === 'skills') {
    const categories = [...new Set(skills.map((s) => s.category))];
    return (
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <p className="mb-2.5 text-sm text-beton-600">{category}</p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {skills
                .filter((s) => s.category === category)
                .map((skill) => (
                  <Checkable
                    key={skill.id}
                    value={skill.slug}
                    label={skill.label}
                    defaultChecked={selected.has(skill.slug)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (question.kind === 'interests') {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2">
        {interests.map((interest) => (
          <Checkable
            key={interest.id}
            value={interest.slug}
            label={interest.label}
            defaultChecked={selected.has(interest.slug)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {question.options?.map((option) => (
        <Checkable
          key={option.value}
          value={option.value}
          label={option.label}
          hint={option.hint}
          defaultChecked={selected.has(option.value)}
        />
      ))}
    </div>
  );
}

/** Case à cocher dessinée comme une carte. */
function Checkable({
  value,
  label,
  hint,
  defaultChecked,
}: {
  value: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3.5 rounded-card border bg-blanc p-4 transition-colors hover:border-acier',
        checked ? 'border-acier bg-acier-50' : 'border-beton-300',
      )}
    >
      <input
        type="checkbox"
        name="value"
        value={value}
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        className="sr-only"
      />
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-md border text-xs transition-colors',
          checked ? 'border-acier bg-acier text-white' : 'border-beton-300',
        )}
        aria-hidden
      >
        {checked ? '✓' : ''}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base text-encre">{label}</span>
        {hint ? <span className="block text-sm text-beton-600">{hint}</span> : null}
      </span>
    </label>
  );
}
