import { EditorialArrow } from "@/components/EditorialArrow";
import { getCategory, type Treatment } from "@/data/treatments";

interface TreatmentRowsProps {
  items: readonly Treatment[];
  emptyMessage?: string;
  onSelect: (treatment: Treatment, trigger: HTMLButtonElement) => void;
}

export function TreatmentRows({
  items,
  emptyMessage = "Nessun trattamento disponibile per questo filtro.",
  onSelect,
}: TreatmentRowsProps) {
  if (items.length === 0) {
    return (
      <div className="border-y border-line py-14 text-center" role="status">
        <p className="font-display text-2xl text-ink">Nessun risultato</p>
        <p className="mt-3 text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ol className="border-t border-line">
      {items.map((treatment, index) => (
        <li key={treatment.slug} className="border-b border-line">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-controls="treatment-detail-dialog"
            onClick={(event) => onSelect(treatment, event.currentTarget)}
            className="interactive-row treatment-row group grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3.5 text-left md:min-h-24 md:grid-cols-12 md:gap-8 md:py-5"
          >
            <span className="eyebrow hidden text-accent md:col-span-1 md:block">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 md:col-span-4">
              <span className="block font-display text-xl leading-tight text-ink transition-colors duration-[var(--motion-duration-ui)] group-hover:text-accent group-focus-visible:text-accent group-active:text-accent md:text-3xl">
                {treatment.name}
              </span>
              <span className="mt-1 block text-xs text-muted md:mt-2">
                <span className="hidden md:inline">{getCategory(treatment.category)?.name}</span>
                {treatment.duration ? (
                  <>
                    <span className="hidden md:inline"> · </span>
                    <span>{treatment.duration}</span>
                  </>
                ) : null}
              </span>
            </span>
            <span className="hidden text-sm leading-relaxed text-muted md:col-span-4 md:block">
              {treatment.shortDescription}
            </span>
            <span className="flex items-center justify-end gap-3 md:col-span-3 md:gap-4">
              <span className="text-sm font-medium tabular-nums text-accent-strong">
                {treatment.priceLabel}
              </span>
              <EditorialArrow />
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
