'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { Question } from '@/lib/onboarding/questions';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
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
 * Un écran, une question (section 8.2). L'utilisateur doit avoir l'impression
 * de commencer une aventure, pas de remplir un dossier administratif.
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
        className="flex flex-1 flex-col justify-center py-12"
      >
        {isFirst ? (
          <p className="prose-buildr mb-6 text-base text-beton-600">
            On commence par toi. Plus on comprend qui tu es, plus ton parcours sera personnalisé.
          </p>
        ) : null}

        <h1 className="text-2xl">{question.title}</h1>
        {question.help ? <p className="prose-buildr mt-3 text-base text-beton-600">{question.help}</p> : null}

        <form action={saveAnswer} className="mt-8">
          <input type="hidden" name="key" value={question.key} />
          <QuestionInput
            question={question}
            skills={skills}
            interests={interests}
            currentValue={currentValue}
          />

          <div className="mt-10 flex items-center gap-3">
            <Button type="submit" variant="signal" size="lg">
              Continuer
            </Button>
            {question.optional ? (
              <Button type="submit" variant="ghost" name="value" value="">
                Passer
              </Button>
            ) : null}
          </div>
        </form>

        {index > 0 ? (
          <form action={goToQuestion} className="mt-6">
            <input type="hidden" name="index" value={index - 1} />
            <button type="submit" className="text-sm text-beton-600 underline-offset-4 hover:text-encre hover:underline">
              ← Revenir à la question précédente
            </button>
          </form>
        ) : null}
      </motion.main>
    </div>
  );
}

function QuestionInput({
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
  switch (question.kind) {
    case 'number':
      return (
        <div className="flex items-center gap-3">
          <Input
            type="number"
            name="value"
            required={!question.optional}
            min={question.min}
            max={question.max}
            step={question.step ?? 1}
            defaultValue={typeof currentValue === 'string' ? currentValue : undefined}
            autoFocus
            className="tabular max-w-40 text-lg"
          />
          {question.unit ? <span className="text-base text-beton-600">{question.unit}</span> : null}
        </div>
      );

    case 'text':
      return question.field === 'habit' ? (
        <Textarea
          name="value"
          rows={4}
          required={!question.optional}
          placeholder={question.placeholder}
          defaultValue={typeof currentValue === 'string' ? currentValue : undefined}
          autoFocus
        />
      ) : (
        <Input
          type="text"
          name="value"
          required={!question.optional}
          placeholder={question.placeholder}
          defaultValue={typeof currentValue === 'string' ? currentValue : undefined}
          autoFocus
          className="max-w-md text-lg"
        />
      );

    case 'choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-start gap-3 rounded-card border border-beton-300 bg-blanc p-4 transition-colors hover:border-acier has-checked:border-acier has-checked:bg-acier-50"
            >
              <input
                type="radio"
                name="value"
                value={option.value}
                required
                defaultChecked={currentValue === option.value}
                className="mt-1 accent-[#3E7BFA]"
              />
              <span>
                <span className="block text-base text-encre">{option.label}</span>
                {option.hint ? <span className="block text-sm text-beton-600">{option.hint}</span> : null}
              </span>
            </label>
          ))}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'true', label: 'Oui, ça me va' },
            { value: 'false', label: 'Non, pas pour moi' },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 rounded-card border border-beton-300 bg-blanc px-5 py-4 transition-colors hover:border-acier has-checked:border-acier has-checked:bg-acier-50"
            >
              <input
                type="radio"
                name="value"
                value={option.value}
                required
                defaultChecked={currentValue === option.value}
                className="accent-[#3E7BFA]"
              />
              <span className="text-base text-encre">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'interests':
      return (
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <label
              key={interest.id}
              className="cursor-pointer rounded-full border border-beton-300 bg-blanc px-3.5 py-2 text-sm text-encre transition-colors hover:border-acier has-checked:border-acier has-checked:bg-acier-50 has-checked:text-acier"
            >
              <input
                type="checkbox"
                name="value"
                value={interest.slug}
                defaultChecked={Array.isArray(currentValue) && currentValue.includes(interest.slug)}
                className="sr-only"
              />
              {interest.label}
            </label>
          ))}
        </div>
      );

    case 'skills':
      return <SkillPicker skills={skills} currentValue={currentValue} />;

    default:
      return null;
  }
}

/** Compétence : on choisit d'abord, on règle le niveau ensuite. Deux gestes, pas un formulaire. */
function SkillPicker({ skills, currentValue }: { skills: SkillRow[]; currentValue: string | string[] | null }) {
  const initial = new Map<string, number>(
    (Array.isArray(currentValue) ? currentValue : []).map((entry) => {
      const [slug, level] = entry.split(':');
      return [slug ?? '', Number(level) || 3];
    }),
  );
  const [selected, setSelected] = useState<Map<string, number>>(initial);

  const categories = [...new Set(skills.map((s) => s.category))];

  function toggle(slug: string) {
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(slug)) next.delete(slug);
      else next.set(slug, 3);
      return next;
    });
  }

  function setLevel(slug: string, level: number) {
    setSelected((current) => new Map(current).set(slug, level));
  }

  return (
    <div className="space-y-6">
      {[...selected.keys()].map((slug) => (
        <input key={slug} type="hidden" name="value" value={`${slug}:${selected.get(slug) ?? 3}`} />
      ))}

      {categories.map((category) => (
        <div key={category}>
          <p className="mb-2 text-sm text-beton-600">{category}</p>
          <div className="flex flex-wrap gap-2">
            {skills
              .filter((s) => s.category === category)
              .map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggle(skill.slug)}
                  aria-pressed={selected.has(skill.slug)}
                  className={cn(
                    'rounded-full border px-3.5 py-2 text-sm transition-colors',
                    selected.has(skill.slug)
                      ? 'border-acier bg-acier-50 text-acier'
                      : 'border-beton-300 bg-blanc text-encre hover:border-acier',
                  )}
                >
                  {skill.label}
                </button>
              ))}
          </div>
        </div>
      ))}

      {selected.size > 0 ? (
        <div className="rounded-card border border-beton-300 bg-blanc p-4">
          <p className="text-sm text-beton-600">Ton niveau sur chacune, de 1 à 5.</p>
          <div className="mt-3 space-y-3">
            {[...selected.entries()].map(([slug, level]) => {
              const skill = skills.find((s) => s.slug === slug);
              if (!skill) return null;
              return (
                <div key={slug} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-encre">{skill.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setLevel(slug, value)}
                        aria-label={`${skill.label} : niveau ${value}`}
                        className={cn(
                          'tabular size-8 rounded-lg border text-sm transition-colors',
                          value <= level
                            ? 'border-acier bg-acier text-white'
                            : 'border-beton-300 bg-blanc text-beton-600',
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
