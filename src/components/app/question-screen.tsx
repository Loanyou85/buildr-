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

          {question.kind === 'slider' ? (
            <>
              <SliderChoice question={question} currentValue={currentValue} />
              <div className="mt-10">
                <Button type="submit" variant="signal" size="lg">
                  Continuer
                </Button>
              </div>
            </>
          ) : isSingle ? (
            <SingleChoice question={question} currentValue={currentValue} />
          ) : (
            <>
              <MultiChoice
                question={question}
                skills={skills}
                interests={interests}
                currentValue={currentValue}
              />
              <p className="mt-6 text-sm text-beton-600">
                Tu peux en cocher plusieurs. Valide quand tu as fini.
              </p>
              <div className="mt-3 flex items-center gap-3">
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
              className="inline-flex min-h-11 items-center text-sm text-beton-600 underline-offset-4 hover:text-encre hover:underline"
            >
              ← Revenir à la question précédente
            </button>
          </form>
        ) : null}
      </motion.main>
    </div>
  );
}

/**
 * Barre à glisser. Le champ reste non contrôlé : il fonctionne et s'envoie
 * même si le script n'a pas encore chargé. Seul l'affichage du montant est
 * rafraîchi par JavaScript.
 */
function SliderChoice({
  question,
  currentValue,
}: {
  question: Question;
  currentValue: string | string[] | null;
}) {
  const min = question.min ?? 0;
  const max = question.max ?? 100;
  const step = question.step ?? 1;
  const initial =
    typeof currentValue === 'string' && currentValue.length > 0 ? Number(currentValue) : Math.round(max / 25);
  const start = Number.isFinite(initial) ? Math.min(max, Math.max(min, initial)) : min;

  const [value, setValue] = useState(start);
  const format = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  return (
    <div>
      <p className="tabular font-display text-4xl font-extrabold tracking-[-0.02em] text-encre">
        {format(value)}
        {value >= max ? '+' : ''}{' '}
        <span className="font-sans text-lg font-medium text-beton-600">{question.unit}</span>
      </p>

      <input
        type="range"
        name="value"
        min={min}
        max={max}
        step={step}
        defaultValue={start}
        onInput={(event) => setValue(Number(event.currentTarget.value))}
        aria-label={question.title}
        className="mt-6 h-2 w-full cursor-pointer appearance-none rounded-full bg-beton-300 accent-[#3E7BFA] outline-none [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blanc [&::-moz-range-thumb]:bg-acier [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blanc [&::-webkit-slider-thumb]:bg-acier [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(16,24,40,0.3)]"
      />

      <div className="tabular mt-3 flex justify-between text-sm text-beton-600">
        <span>{format(min)} €</span>
        <span>{format(max)} €+</span>
      </div>
    </div>
  );
}

/**
 * Carte cliquable qui répond et enchaîne : c'est un bouton d'envoi.
 *
 * La carte se marque **au clic**, sans attendre le serveur. Entre le clic et
 * l'affichage de la question suivante il y a un aller-retour ; sans ce retour
 * visuel immédiat, on croit que le clic n'a pas été pris. Le choix reste un
 * envoi de formulaire natif : sans JavaScript, la carte fonctionne pareil,
 * simplement sans l'état intermédiaire.
 */
function SingleChoice({
  question,
  currentValue,
}: {
  question: Question;
  currentValue: string | string[] | null;
}) {
  const [clicked, setClicked] = useState<string | null>(null);

  return (
    <div className="space-y-2.5">
      {question.options?.map((option) => {
        const selected = clicked === option.value || (clicked === null && currentValue === option.value);
        const dimmed = clicked !== null && clicked !== option.value;

        return (
          <button
            key={option.value}
            type="submit"
            name="value"
            value={option.value}
            onClick={() => setClicked(option.value)}
            className={cn(
              'group flex w-full items-center gap-4 rounded-card border p-4 text-left transition-[border-color,background-color,opacity,transform] duration-150 active:scale-[0.995]',
              selected ? 'border-acier bg-acier-50' : 'border-beton-300 bg-blanc hover:border-acier',
              dimmed && 'opacity-45',
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

/**
 * Case à cocher dessinée comme une carte.
 *
 * Volontairement **sans état React** : l'apparence suit la case native, via
 * CSS. Une case pilotée par JavaScript ne se coche pas tant que le script
 * n'est pas chargé — et se décoche toute seule à l'hydratation si on a cliqué
 * avant. Invisible en local, très visible sur une connexion lente.
 */
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
  return (
    <label className="flex cursor-pointer items-center gap-3.5 rounded-card border border-beton-300 bg-blanc p-4 transition-colors hover:border-acier has-[:checked]:border-acier has-[:checked]:bg-acier-50">
      <input
        type="checkbox"
        name="value"
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded-md border border-beton-300 text-xs text-transparent transition-colors peer-checked:border-acier peer-checked:bg-acier peer-checked:text-white"
        aria-hidden
      >
        ✓
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base text-encre">{label}</span>
        {hint ? <span className="block text-sm text-beton-600">{hint}</span> : null}
      </span>
    </label>
  );
}
