import { Badge } from '@/components/ui/badge';

interface ActionRow {
  id: string;
  order: number;
  instruction: string;
  externalUrl: string | null;
  templateRef: string | null;
  example: string | null;
}

interface SubStepRow {
  id: string;
  order: number;
  title: string;
  body: string;
  actions: ActionRow[];
}

interface ResourceRow {
  id: string;
  type: string;
  title: string;
  url: string | null;
  body: string | null;
}

const RESOURCE_LABEL: Record<string, string> = {
  template: 'Modèle',
  script: 'Script',
  checklist: 'Checklist',
  link: 'Lien',
  example: 'Exemple',
};

/**
 * Le niveau de détail est une fonctionnalité (section 9) : chaque action est
 * exécutable telle quelle, avec sa règle, son critère et son exemple.
 */
export function StepBody({ subSteps, resources }: { subSteps: SubStepRow[]; resources: ResourceRow[] }) {
  return (
    <>
      <div className="mt-10 space-y-10">
        {subSteps.map((subStep) => (
          <section key={subStep.id}>
            <h2 className="text-lg text-encre">
              <span className="tabular mr-2 text-beton-300">{subStep.order}.</span>
              {subStep.title}
            </h2>

            <Markdown className="prose-buildr mt-3 text-sm text-beton-600" content={subStep.body} />

            <ol className="mt-5 space-y-4">
              {subStep.actions.map((action) => (
                <li key={action.id} className="flex gap-4">
                  <span className="tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-beton-100 font-display text-xs font-bold text-beton-600">
                    {action.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="prose-buildr text-base text-encre">{action.instruction}</p>
                    {action.example ? (
                      <p className="prose-buildr mt-1.5 border-l-2 border-beton-300 pl-3 text-sm text-beton-600">
                        Exemple : {action.example}
                      </p>
                    ) : null}
                    {action.externalUrl ? (
                      <a
                        href={action.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-block text-sm text-acier underline-offset-4 hover:underline"
                      >
                        Ouvrir l’outil ↗
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {resources.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-lg text-encre">Ce dont tu as besoin</h2>
          <div className="mt-4 space-y-3">
            {resources.map((resource) => (
              <details key={resource.id} className="rounded-card border border-beton-300 bg-blanc">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4">
                  <Badge>{RESOURCE_LABEL[resource.type] ?? resource.type}</Badge>
                  <span className="text-sm text-encre">{resource.title}</span>
                </summary>
                <div className="border-t border-beton-300 px-5 py-4">
                  {resource.body ? (
                    <pre className="prose-buildr overflow-x-auto whitespace-pre-wrap font-sans text-sm text-beton-600">
                      {resource.body}
                    </pre>
                  ) : null}
                  {resource.url ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-acier underline-offset-4 hover:underline"
                    >
                      {resource.url} ↗
                    </a>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

/**
 * Rendu markdown minimal — titres, gras, listes, tableaux et citations suffisent
 * au contenu des parcours. Pas de dépendance, pas de HTML arbitraire injecté.
 */
function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = content.split('\n\n');

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const lines = block.split('\n');

        if (lines.every((line) => line.startsWith('|'))) {
          const rows = lines.filter((line) => !/^\|[\s|:-]+\|$/.test(line));
          const [head, ...body] = rows;
          return (
            <div key={index} className="my-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                {head ? (
                  <thead>
                    <tr>
                      {splitRow(head).map((cell, i) => (
                        <th key={i} className="border-b border-beton-300 py-2 pr-4 font-medium text-encre">
                          {inline(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {body.map((row, i) => (
                    <tr key={i}>
                      {splitRow(row).map((cell, j) => (
                        <td key={j} className="border-b border-beton-300/60 py-2 pr-4 align-top">
                          {inline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (lines.every((line) => line.startsWith('- '))) {
          return (
            <ul key={index} className="my-3 list-disc space-y-1 pl-5">
              {lines.map((line, i) => (
                <li key={i}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }

        if (lines.every((line) => /^\d+\.\s/.test(line))) {
          return (
            <ol key={index} className="my-3 list-decimal space-y-1 pl-5">
              {lines.map((line, i) => (
                <li key={i}>{inline(line.replace(/^\d+\.\s/, ''))}</li>
              ))}
            </ol>
          );
        }

        if (block.startsWith('> ')) {
          return (
            <blockquote key={index} className="my-3 border-l-2 border-acier pl-3 text-encre">
              {inline(block.replace(/^>\s?/gm, ''))}
            </blockquote>
          );
        }

        if (block.startsWith('```')) {
          return (
            <pre
              key={index}
              className="my-3 overflow-x-auto rounded-xl bg-beton-100 p-4 font-sans text-sm text-encre"
            >
              {block.replace(/```/g, '').trim()}
            </pre>
          );
        }

        return (
          <p key={index} className="my-3">
            {inline(block)}
          </p>
        );
      })}
    </div>
  );
}

function splitRow(row: string): string[] {
  return row
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

/** Gras `**texte**` uniquement : le reste du markdown n'est pas nécessaire ici. */
function inline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={index} className="font-medium text-encre">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}
