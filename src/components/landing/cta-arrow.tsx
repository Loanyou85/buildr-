/**
 * Flèche de l'appel à l'action. Elle avance légèrement au survol : le geste
 * dit la direction, il ne décore pas. La translation est une transition CSS,
 * donc neutralisée par la règle `prefers-reduced-motion` globale.
 */
export function CtaArrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="size-4 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5"
    >
      <path
        d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
