import { Link } from "@tanstack/react-router";
import { EditorialArrow } from "@/components/EditorialArrow";
import { RevealDivider } from "@/components/RevealDivider";
import { faqItems } from "@/data/content";

export function FaqTeaser() {
  return (
    <section
      className="border-y border-line bg-surface py-12 md:py-16"
      aria-labelledby="faq-teaser-heading"
    >
      <div className="container-editorial grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="eyebrow">Prima dell'appuntamento</p>
          <h2
            id="faq-teaser-heading"
            className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl"
          >
            Domande essenziali.
          </h2>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <ul className="relative border-t border-transparent">
            <RevealDivider className="inset-x-0 -top-px h-px bg-line" />
            {faqItems.slice(0, 3).map((item, index) => (
              <li
                key={item.id}
                className="relative border-b border-transparent py-5 text-sm text-ink"
                style={{ ["--reveal-delay" as string]: `${Math.min(index * 60, 240)}ms` }}
              >
                <span className="block" data-reveal>
                  {item.question}
                </span>
                <RevealDivider className="inset-x-0 -bottom-px h-px bg-line" />
              </li>
            ))}
          </ul>
          <Link to="/faq" className="editorial-link group mt-7 min-h-11 text-sm font-medium">
            Leggi tutte le risposte
            <EditorialArrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
