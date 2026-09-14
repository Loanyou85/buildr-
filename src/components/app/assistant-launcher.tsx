'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Bouton permanent « Besoin d'aide ? » présent sur tous les écrans de l'app
 * (section 8.7). L'assistant reçoit systématiquement l'étape en cours et son
 * contenu intégral : il ne répond jamais comme un chatbot généraliste.
 */
export function AssistantLauncher({ stepId }: { stepId: string | null }) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending]);

  async function send(formData: FormData) {
    const message = String(formData.get('message') ?? '').trim();
    if (message.length < 3 || !stepId) return;

    setMessages((current) => [...current, { role: 'user', content: message }]);
    setPending(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, message }),
      });
      const data: { answer?: string; error?: string } = await response.json();
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            data.answer ??
            data.error ??
            'Je n’ai pas pu répondre. Ouvre l’étape : tout ce qu’il te faut y est déjà écrit.',
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'La connexion a échoué. Réessaie dans un instant.' },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 rounded-full border border-beton-300 bg-blanc px-4 py-2.5 text-sm font-medium text-encre shadow-[0_4px_16px_rgba(16,24,40,0.08)] transition-colors hover:border-acier hover:text-acier"
        aria-expanded={open}
      >
        Besoin d’aide ?
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: reduced ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 right-5 z-40 flex max-h-[70dvh] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-card border border-beton-300 bg-blanc shadow-[0_12px_40px_rgba(16,24,40,0.12)]"
          >
            <div className="flex items-center justify-between border-b border-beton-300 px-4 py-3">
              <p className="text-sm font-medium text-encre">Assistance sur ton étape</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-beton-600 hover:text-encre"
              >
                Fermer
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 ? (
                <p className="text-sm text-beton-600">
                  Pose ta question sur l’étape en cours. Exemple : « je ne comprends pas comment trouver
                  mes premiers prospects ».
                </p>
              ) : null}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'whitespace-pre-wrap rounded-xl px-3.5 py-2.5 text-sm',
                    message.role === 'user'
                      ? 'ml-8 bg-beton-100 text-encre'
                      : 'mr-4 bg-acier-50 text-encre',
                  )}
                >
                  {message.content}
                </div>
              ))}
              {pending ? <p className="text-sm text-beton-600">Je regarde ton étape…</p> : null}
            </div>

            <form
              action={send}
              className="flex items-end gap-2 border-t border-beton-300 p-3"
              onSubmit={(event) => {
                const form = event.currentTarget;
                setTimeout(() => form.reset(), 0);
              }}
            >
              <Textarea
                name="message"
                rows={2}
                required
                minLength={3}
                placeholder="Ta question…"
                className="text-sm"
              />
              <Button type="submit" variant="acier" size="sm" disabled={pending || !stepId}>
                Envoyer
              </Button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
