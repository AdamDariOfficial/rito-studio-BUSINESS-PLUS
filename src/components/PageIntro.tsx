import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageIntroProps {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  aside?: ReactNode;
  className?: string;
}

export function PageIntro({ eyebrow, title, intro, aside, className }: PageIntroProps) {
  return (
    <header
      className={cn(
        "border-b border-line pb-10 pt-[calc(var(--header-height)+3rem)] md:pb-14 md:pt-[calc(var(--header-height)+4.5rem)]",
        className,
      )}
    >
      <div className="container-editorial grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="eyebrow" data-reveal>
            {eyebrow}
          </p>
          <h1
            className="mt-5 max-w-5xl font-display text-[clamp(2.85rem,7vw,6rem)] leading-[0.96] tracking-[-0.02em] text-ink"
            data-reveal
            style={{ ["--reveal-delay" as string]: "70ms" }}
          >
            {title}
          </h1>
        </div>
        <div className="md:col-span-4">
          <p
            className="max-w-lg text-base leading-relaxed text-muted md:text-lg"
            data-reveal
            style={{ ["--reveal-delay" as string]: "130ms" }}
          >
            {intro}
          </p>
          {aside}
        </div>
      </div>
    </header>
  );
}
