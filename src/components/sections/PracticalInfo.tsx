import { useState } from "react";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { RevealDivider } from "@/components/RevealDivider";
import { site } from "@/lib/site-config";

export function PracticalInfo() {
  const [mapActive, setMapActive] = useState(false);

  return (
    <section
      id="contatti"
      aria-labelledby="contatti-heading"
      className="relative scroll-mt-[calc(var(--header-height)+24px)] border-t border-transparent bg-canvas py-12 md:py-16"
    >
      <RevealDivider className="inset-x-0 -top-px h-px bg-line" />
      <div className="container-editorial">
        <p id="contatti-heading" className="eyebrow">
          Informazioni pratiche
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="font-display text-3xl text-ink md:text-4xl">{site.contact.city}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
              {site.contact.locationDetail}
            </p>

            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <dl className="space-y-2 text-sm text-ink">
                {site.hours.map((h) => (
                  <div
                    key={h.label}
                    className="relative flex justify-between gap-6 border-b border-transparent pb-2"
                  >
                    <dt className="text-muted">{h.label}</dt>
                    <dd>{h.value}</dd>
                    <RevealDivider className="inset-x-0 -bottom-px h-px bg-line" />
                  </div>
                ))}
              </dl>

              <ul className="space-y-3 text-sm text-ink">
                <li>
                  <a
                    href={site.contact.mapExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2.5 text-ink underline decoration-line underline-offset-4 transition-[color,text-decoration-color] hover:text-accent hover:decoration-accent"
                  >
                    <MapPin
                      aria-hidden
                      size={15}
                      strokeWidth={1.6}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <span>{site.contact.locationLabel}</span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone
                    aria-hidden
                    size={15}
                    strokeWidth={1.6}
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <a
                    href={site.contact.phoneHref}
                    className="text-ink underline decoration-line underline-offset-4 transition-[color,text-decoration-color] hover:text-accent hover:decoration-accent"
                  >
                    {site.contact.phone}
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail
                    aria-hidden
                    size={15}
                    strokeWidth={1.6}
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <a
                    href={site.contact.emailHref}
                    className="text-ink underline decoration-line underline-offset-4 transition-[color,text-decoration-color] hover:text-accent hover:decoration-accent"
                  >
                    {site.contact.email}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="relative min-h-[17rem] overflow-hidden border border-line bg-surface sm:min-h-[19rem] lg:aspect-[5/3] lg:min-h-0">
              {mapActive ? (
                <iframe
                  title={`Mappa interattiva di ${site.contact.mapQuery}`}
                  src={site.contact.mapEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-7 py-10 text-center sm:px-12 sm:py-12">
                  <MapPin aria-hidden size={30} strokeWidth={1.4} className="mb-4 text-accent" />
                  <p className="font-display text-[1.75rem] leading-tight text-ink sm:text-3xl">
                    {site.contact.area}
                  </p>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-on-surface">
                    La mappa di Google viene caricata soltanto dopo una tua scelta esplicita.
                  </p>
                  <button
                    data-js-only
                    type="button"
                    onClick={() => setMapActive(true)}
                    className="action-primary mt-7 inline-flex min-h-12 w-full max-w-xs items-center justify-center border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong sm:w-auto"
                  >
                    Attiva la mappa interattiva
                  </button>
                  <noscript>
                    <a
                      href={site.contact.mapExternalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 border border-ink bg-ink px-5 text-sm font-medium text-white sm:w-auto"
                    >
                      Apri la mappa su Google Maps
                      <ExternalLink aria-hidden size={14} />
                    </a>
                  </noscript>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 text-xs text-muted">
              <div>
                {mapActive && (
                  <button
                    type="button"
                    onClick={() => setMapActive(false)}
                    className="underline-offset-4 hover:underline"
                  >
                    Disattiva mappa
                  </button>
                )}
              </div>
              <a
                href={site.contact.mapExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink underline decoration-line underline-offset-4 transition-[color,text-decoration-color] hover:text-accent hover:decoration-accent"
              >
                Apri su Google Maps
                <ExternalLink aria-hidden size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
