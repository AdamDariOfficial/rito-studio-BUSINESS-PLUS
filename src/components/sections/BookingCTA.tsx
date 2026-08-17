import { Link } from "@tanstack/react-router";
import { ctaLabels } from "@/lib/site-config";

export function BookingCTA() {
  return (
    <section aria-labelledby="booking-cta-heading" className="bg-ink py-16 md:py-20">
      <div className="container-editorial">
        <div className="relative p-1 md:px-8 md:py-4">
          <div className="grid gap-10 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-7">
              <p className="eyebrow text-surface">Consulenza</p>
              <h2
                id="booking-cta-heading"
                className="mt-4 font-display text-[clamp(1.9rem,4.4vw,3.25rem)] leading-[1.05] text-white"
                data-reveal
              >
                Il tuo tempo <span className="italic">di cura.</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:pt-8">
              <p
                className="text-base leading-relaxed text-surface md:text-lg"
                data-reveal
                style={{ ["--reveal-delay" as string]: "80ms" }}
              >
                Parti da un trattamento e rispondi a poche domande. Ti proponiamo un percorso
                essenziale con al massimo due servizi complementari.
              </p>
              <Link
                to="/consulenza"
                aria-label={ctaLabels.startConsultation}
                data-reveal
                style={{ ["--reveal-delay" as string]: "160ms" }}
                className="action-primary mt-8 inline-flex min-h-12 items-center justify-center border border-white bg-white px-6 text-sm font-medium text-ink hover:border-surface hover:bg-surface focus-visible:outline-white"
              >
                {ctaLabels.startConsultation}
              </Link>
            </div>
          </div>
          <span aria-hidden className="absolute -top-4 left-1 h-px w-16 bg-accent md:left-8" />
        </div>
      </div>
    </section>
  );
}
