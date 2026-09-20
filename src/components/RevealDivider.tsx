interface RevealDividerProps {
  className: string;
}

export function RevealDivider({ className }: RevealDividerProps) {
  return (
    <span
      aria-hidden
      data-divider-reveal
      className={`pointer-events-none absolute block ${className}`}
    />
  );
}
