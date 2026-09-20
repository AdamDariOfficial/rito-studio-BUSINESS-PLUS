import { Link } from "@tanstack/react-router";
import { Mail, MessageCircle } from "lucide-react";
import { BookingAction } from "@/components/BookingAction";
import { ctaLabels } from "@/lib/site-config";

export function BookingCTA() {
  return (
    <section aria-labelledby="booking-cta-heading" className="bg-ink py-12 md:py-16">
      <div className="container-editorial">
        <div className="relative p-1 md:px-8 md:py-4">
          <div className="grid gap-8 md:grid-cols-12 md:gap-8">
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
                essenziale, poi puoi contattarci direttamente se preferisci.
              </p>
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap">
                <div
                  className="w-full sm:w-auto"
                  data-reveal
                  style={{ ["--reveal-delay" as string]: "160ms" }}
                >
                  <Link
                    to="/consulenza"
                    aria-label={ctaLabels.startConsultation}
                    className="action-primary action-primary-light inline-flex min-h-12 w-full items-center justify-center gap-2 border border-white bg-white px-6 text-sm font-medium text-ink focus-visible:outline-white sm:w-auto"
                  >
                    <MessageCircle aria-hidden size={16} strokeWidth={1.7} />
                    {ctaLabels.startConsultation}
                  </Link>
                </div>
                <div
                  className="w-full sm:w-auto"
                  data-reveal
                  style={{ ["--reveal-delay" as string]: "240ms" }}
                >
                  <BookingAction
                    kind="contact"
                    ariaLabel="Contatti: email o telefono"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-white/35 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-white sm:w-auto"
                  >
                    <Mail aria-hidden size={16} strokeWidth={1.7} />
                    {ctaLabels.contact}
                  </BookingAction>
                </div>
              </div>
            </div>
          </div>
          <span aria-hidden className="absolute -top-4 left-1 h-px w-16 bg-accent md:left-8" />
        </div>
      </div>
    </section>
  );
}
