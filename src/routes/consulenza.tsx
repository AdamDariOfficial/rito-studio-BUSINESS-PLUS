import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Phone, Plus, Sparkles } from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SiteShell } from "@/components/SiteShell";
import {
  formatTreatmentSelectionTotal,
  getCategory,
  getTreatment,
  servicesNote,
  treatmentCategories,
  treatments,
} from "@/data/treatments";
import {
  consultationWindows,
  getConsultationHandoff,
  getConsultationProfile,
  getConsultationQuestions,
  MAX_CONSULTATION_SELECTED_SERVICES,
} from "@/features/consultation/config";
import { submitLiveConsultation } from "@/features/consultation/consultation-submit";
import { createDemoConsultation } from "@/features/consultation/demo-store";
import { trackConsultationEvent } from "@/features/consultation/events";
import { resolveRecommendations } from "@/features/consultation/recommendations";
import { consultationSubmissionSchema } from "@/features/consultation/schemas";
import type { ConsultationRequest, PreferredContact } from "@/features/consultation/types";
import { buildHead, routeSeo } from "@/lib/seo";
import { site } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const totalSteps = 4;

type ConsultationSearch = {
  servizio?: string;
};

export const Route = createFileRoute("/consulenza")({
  validateSearch: (search: Record<string, unknown>): ConsultationSearch => ({
    servizio: typeof search.servizio === "string" ? search.servizio : undefined,
  }),
  head: () => buildHead(routeSeo.consultation),
  component: ConsultationPage,
});

function ConsultationPage() {
  const { servizio } = Route.useSearch();
  const navigate = Route.useNavigate();
  const requestedTreatment = servizio ? getTreatment(servizio) : undefined;
  const invalidRequestedTreatment = Boolean(servizio && !requestedTreatment);

  const [serviceSlug, setServiceSlug] = useState(requestedTreatment?.slug ?? "");
  const [step, setStep] = useState(requestedTreatment ? 2 : 1);
  const [stepDirection, setStepDirection] = useState<"forward" | "backward">("forward");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [excludedRecommendations, setExcludedRecommendations] = useState<string[]>([]);
  const [additionalServiceSlugs, setAdditionalServiceSlugs] = useState<string[]>([]);
  const [servicePickerOpen, setServicePickerOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredContact, setPreferredContact] = useState<PreferredContact>("phone");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredWindow, setPreferredWindow] = useState("");
  const [consent, setConsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<ConsultationRequest | null>(null);
  const submissionKeyRef = useRef(crypto.randomUUID());

  const selectedTreatment = serviceSlug ? getTreatment(serviceSlug) : undefined;
  const questions = selectedTreatment ? getConsultationQuestions(selectedTreatment.category) : [];
  const recommendations = useMemo(
    () => (selectedTreatment ? resolveRecommendations(selectedTreatment.slug, answers) : []),
    [answers, selectedTreatment],
  );
  const selectedRecommendations = recommendations.filter(
    (recommendation) => !excludedRecommendations.includes(recommendation.slug),
  );
  const additionalServices = additionalServiceSlugs
    .map((slug) => getTreatment(slug))
    .filter((treatment): treatment is NonNullable<typeof treatment> => Boolean(treatment));
  const selectedServiceSlugs = selectedTreatment
    ? Array.from(
        new Set([
          selectedTreatment.slug,
          ...selectedRecommendations.map((item) => item.slug),
          ...additionalServices.map((item) => item.slug),
        ]),
      )
    : [];
  const selectedServices = selectedServiceSlugs
    .map((slug) => getTreatment(slug))
    .filter((treatment): treatment is NonNullable<typeof treatment> => Boolean(treatment));
  const selectedTotal = selectedServices.length
    ? formatTreatmentSelectionTotal(selectedServices)
    : "";

  const profile = getConsultationProfile();
  const handoff = getConsultationHandoff();

  useEffect(() => {
    if (!submittedRequest) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    window.requestAnimationFrame(() => {
      document.getElementById("consultation-success-heading")?.focus({ preventScroll: true });
    });
  }, [submittedRequest]);

  useEffect(() => {
    const fromUrl = servizio ? getTreatment(servizio) : undefined;
    setServiceSlug(fromUrl?.slug ?? "");
    setAnswers({});
    setExcludedRecommendations([]);
    setAdditionalServiceSlugs([]);
    setServicePickerOpen(false);
    setSubmittedRequest(null);
    setStepDirection(fromUrl ? "forward" : "backward");
    setStep(fromUrl ? 2 : 1);
    setErrorMessage("");
  }, [servizio]);

  function resetError() {
    if (errorMessage) setErrorMessage("");
  }

  function selectService(slug: string) {
    setServiceSlug(slug);
    setAnswers({});
    setExcludedRecommendations([]);
    setAdditionalServiceSlugs([]);
    resetError();
  }

  function goToStep(nextStep: number) {
    setStepDirection(nextStep < step ? "backward" : "forward");
    setStep(nextStep);
    resetError();
    window.requestAnimationFrame(() => {
      document.getElementById("consultation-flow-start")?.scrollIntoView({
        block: "start",
        behavior: "auto",
      });
      window.requestAnimationFrame(() => {
        document.getElementById("consultation-panel")?.focus({ preventScroll: true });
      });
    });
  }

  function continueFromService() {
    if (!selectedTreatment) {
      setErrorMessage("Scegli un trattamento per continuare.");
      return;
    }
    trackConsultationEvent({
      name: "consultation_started",
      serviceSlug: selectedTreatment.slug,
      step: 1,
    });

    if (servizio !== selectedTreatment.slug) {
      void navigate({
        search: { servizio: selectedTreatment.slug },
        resetScroll: false,
      });
      return;
    }

    goToStep(2);
  }

  function continueFromQuestions() {
    const missingQuestion = questions.find((question) => !answers[question.id]);
    if (missingQuestion) {
      setErrorMessage(`Rispondi a “${missingQuestion.prompt}” per continuare.`);
      return;
    }

    setExcludedRecommendations([]);
    setAdditionalServiceSlugs([]);
    trackConsultationEvent({
      name: "consultation_step_completed",
      serviceSlug: selectedTreatment?.slug,
      step: 2,
    });
    goToStep(3);
  }

  function toggleRecommendation(slug: string) {
    const currentlyExcluded = excludedRecommendations.includes(slug);
    if (currentlyExcluded && selectedServiceSlugs.length >= MAX_CONSULTATION_SELECTED_SERVICES) {
      setErrorMessage(
        `Puoi selezionare fino a ${MAX_CONSULTATION_SELECTED_SERVICES} servizi complessivi.`,
      );
      return;
    }

    setExcludedRecommendations((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
    resetError();
    trackConsultationEvent({
      name: "consultation_recommendation_toggled",
      serviceSlug: selectedTreatment?.slug,
      step: 3,
      value: slug,
    });
  }

  function toggleAdditionalService(slug: string) {
    setAdditionalServiceSlugs((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);

      const fixedSelectionCount = 1 + selectedRecommendations.length;
      const maxAdditional = Math.max(0, MAX_CONSULTATION_SELECTED_SERVICES - fixedSelectionCount);
      if (current.length >= maxAdditional) return current;
      return [...current, slug];
    });
    resetError();
  }

  function continueFromRecommendations() {
    trackConsultationEvent({
      name: "consultation_step_completed",
      serviceSlug: selectedTreatment?.slug,
      step: 3,
    });
    goToStep(4);
  }

  async function submitConsultation() {
    if (!selectedTreatment) {
      setErrorMessage("Il trattamento selezionato non è disponibile.");
      goToStep(1);
      return;
    }

    const result = consultationSubmissionSchema.safeParse({
      serviceSlug: selectedTreatment.slug,
      answers,
      recommendedSlugs: recommendations.map((item) => item.slug),
      selectedServiceSlugs,
      contact: {
        name,
        phone,
        email,
        preferredContact,
        preferredDate,
        preferredWindow,
      },
      consent,
    });

    if (!result.success) {
      const first = result.error.issues[0];
      setErrorMessage(
        first?.path.includes("consent")
          ? "Conferma di aver letto l'informativa privacy prima di inviare."
          : "Controlla i dati di contatto e completa i campi richiesti.",
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      const request =
        profile === "demo"
          ? createDemoConsultation(result.data)
          : await submitLiveConsultation({
              submissionKey: submissionKeyRef.current,
              submission: result.data,
            });

      setSubmittedRequest(request);
      submissionKeyRef.current = crypto.randomUUID();
      trackConsultationEvent({
        name: "consultation_completed",
        serviceSlug: selectedTreatment.slug,
        step: 4,
      });
    } catch {
      setErrorMessage(
        profile === "live"
          ? "La richiesta non è stata inviata. Riprova tra poco oppure contatta lo studio."
          : "Non è stato possibile salvare la richiesta. Riprova tra poco.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submittedRequest && selectedTreatment) {
    const confirmedServices = submittedRequest.selectedServiceSlugs
      .map((slug) => getTreatment(slug))
      .filter((treatment): treatment is NonNullable<typeof treatment> => Boolean(treatment));
    const confirmedMain = confirmedServices[0] ?? selectedTreatment;
    const confirmedAdditional = confirmedServices.slice(1);
    const confirmedTotal = confirmedServices.length
      ? formatTreatmentSelectionTotal(confirmedServices)
      : selectedTreatment.priceLabel;

    return (
      <SiteShell>
        <section className="pb-20 pt-[calc(var(--header-height)+4rem)] md:pb-28 md:pt-[calc(var(--header-height)+6rem)]">
          <div className="container-editorial">
            <div className="mx-auto max-w-3xl border border-line bg-surface p-6 sm:p-8 md:p-12">
              <div className="consultation-success-status">
                <div className="consultation-success-mark" aria-hidden>
                  <span className="consultation-success-ring" />
                  <Check className="consultation-success-icon" size={22} strokeWidth={1.8} />
                </div>
                <p className="consultation-success-label eyebrow text-accent">Richiesta ricevuta</p>
              </div>
              <h1
                id="consultation-success-heading"
                tabIndex={-1}
                className="mt-5 font-display text-[clamp(2.6rem,8vw,5rem)] leading-[0.96] text-ink outline-none"
              >
                Il tuo percorso, <span className="italic text-accent">in sintesi.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
                Abbiamo raccolto le tue preferenze. Questa è una richiesta di contatto, non una
                conferma automatica dell'appuntamento.
              </p>

              <div className="mt-8 border-y border-line py-6">
                <p className="eyebrow">Trattamento principale</p>
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <p className="font-display text-2xl text-ink">{confirmedMain.name}</p>
                  <span className="shrink-0 text-sm text-muted">{confirmedMain.priceLabel}</span>
                </div>

                {confirmedAdditional.length ? (
                  <div className="mt-6">
                    <p className="eyebrow">Servizi aggiunti</p>
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      {confirmedAdditional.map((item) => (
                        <li key={item.slug} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-2">
                            <Check
                              aria-hidden
                              size={16}
                              strokeWidth={1.7}
                              className="text-accent"
                            />
                            {item.name}
                          </span>
                          <span className="shrink-0 text-muted">{item.priceLabel}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-line pt-5">
                <span className="text-sm text-muted">Totale indicativo</span>
                <strong className="font-display text-2xl font-normal text-ink">
                  {confirmedTotal}
                </strong>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{servicesNote}</p>

              <div className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
                <section>
                  <p className="eyebrow">I tuoi dati</p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <SummaryRow label="Nome" value={submittedRequest.contact.name} />
                    <SummaryRow label="Telefono" value={submittedRequest.contact.phone} />
                    {submittedRequest.contact.email ? (
                      <SummaryRow label="Email" value={submittedRequest.contact.email} />
                    ) : null}
                  </dl>
                </section>
                <section>
                  <p className="eyebrow">Preferenze di contatto</p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <SummaryRow
                      label="Canale"
                      value={preferredContactLabel(submittedRequest.contact.preferredContact)}
                    />
                    <SummaryRow
                      label="Giorno"
                      value={
                        submittedRequest.contact.preferredDate
                          ? formatPreferredDate(submittedRequest.contact.preferredDate)
                          : "Non indicato"
                      }
                    />
                    <SummaryRow label="Fascia" value={submittedRequest.contact.preferredWindow} />
                  </dl>
                </section>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {handoff === "tel" ? (
                  <a
                    href={site.contact.phoneHref}
                    onClick={() =>
                      trackConsultationEvent({
                        name: "consultation_handoff_clicked",
                        serviceSlug: selectedTreatment.slug,
                        value: "tel",
                      })
                    }
                    className="action-primary inline-flex min-h-12 w-full items-center justify-center gap-2 border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong sm:w-auto sm:px-6"
                  >
                    <Phone aria-hidden size={16} strokeWidth={1.7} />
                    Chiama lo studio
                  </a>
                ) : null}

                {handoff === "whatsapp" && site.consultation.whatsappHref ? (
                  <a
                    href={site.consultation.whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackConsultationEvent({
                        name: "consultation_handoff_clicked",
                        serviceSlug: selectedTreatment.slug,
                        value: "whatsapp",
                      })
                    }
                    className="action-primary inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
                  >
                    Continua su WhatsApp
                  </a>
                ) : null}

                {handoff === "external" && site.consultation.externalUrl ? (
                  <a
                    href={site.consultation.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackConsultationEvent({
                        name: "consultation_handoff_clicked",
                        serviceSlug: selectedTreatment.slug,
                        value: "external",
                      })
                    }
                    className="action-primary inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
                  >
                    Apri la prenotazione
                  </a>
                ) : null}

                <Link
                  to="/trattamenti"
                  className="editorial-link min-h-12 px-1 text-sm font-medium"
                >
                  Torna ai trattamenti
                  <ChevronRight aria-hidden size={17} strokeWidth={1.7} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageIntro
        eyebrow="Consulenza"
        title={
          <>
            Poche domande, <span className="italic text-accent">più chiarezza.</span>
          </>
        }
        intro="Parti da un trattamento, raccontaci in pochi passaggi cosa stai cercando e componi un percorso essenziale."
      />

      <section className="py-14 md:py-20">
        <div className="container-editorial">
          <div className="mx-auto max-w-4xl">
            <div
              id="consultation-flow-start"
              className="mb-7 flex scroll-mt-[calc(var(--header-height)+1rem)] items-center justify-between gap-4"
            >
              <p className="eyebrow">
                Step {String(step).padStart(2, "0")} / {String(totalSteps).padStart(2, "0")}
              </p>
              <div className="flex gap-1.5" aria-label={`Passaggio ${step} di ${totalSteps}`}>
                {Array.from({ length: totalSteps }, (_, index) => (
                  <span
                    key={index}
                    aria-hidden
                    className={cn(
                      "h-1 w-8 transition-colors duration-200 motion-reduce:transition-none",
                      index < step ? "bg-accent" : "bg-line",
                    )}
                  />
                ))}
              </div>
            </div>

            <div
              id="consultation-panel"
              tabIndex={-1}
              className="border border-line bg-canvas p-5 outline-none sm:p-7 md:p-10"
            >
              {errorMessage ? (
                <div
                  role="alert"
                  className="mb-7 border border-accent/35 bg-surface p-4 text-sm leading-relaxed text-ink"
                >
                  {errorMessage}
                </div>
              ) : null}

              <div
                key={step}
                className={cn(
                  "consultation-step",
                  stepDirection === "backward"
                    ? "consultation-step-backward"
                    : "consultation-step-forward",
                )}
              >
                {step === 1 ? (
                  <div>
                    <p className="eyebrow text-accent">01 · Trattamento</p>
                    <h2 className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl">
                      Da dove vuoi partire?
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                      Scegli il servizio principale. Potrai poi valutare al massimo due suggerimenti
                      complementari.
                    </p>

                    {invalidRequestedTreatment ? (
                      <p
                        className="mt-5 border border-line bg-surface p-4 text-sm text-muted"
                        role="status"
                      >
                        Il trattamento richiesto nell'URL non è disponibile. Scegline uno dal
                        catalogo.
                      </p>
                    ) : null}

                    <label className="mt-7 block">
                      <span className="text-sm font-medium text-ink">Trattamento principale</span>
                      <select
                        value={serviceSlug}
                        onChange={(event) => selectService(event.target.value)}
                        className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
                      >
                        <option value="">Seleziona un trattamento</option>
                        {treatmentCategories.map((category) => (
                          <optgroup key={category.id} label={category.name}>
                            {treatments
                              .filter((item) => item.category === category.id)
                              .map((item) => (
                                <option key={item.slug} value={item.slug}>
                                  {item.name} · {item.priceLabel}
                                </option>
                              ))}
                          </optgroup>
                        ))}
                      </select>
                    </label>

                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={continueFromService}
                        className="action-primary inline-flex min-h-12 items-center justify-center gap-2 border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
                      >
                        Continua
                        <ChevronRight aria-hidden size={17} strokeWidth={1.7} />
                      </button>
                    </div>
                  </div>
                ) : null}

                {step === 2 && selectedTreatment ? (
                  <div>
                    <p className="eyebrow text-accent">02 · Preferenze</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">
                          {selectedTreatment.name}
                        </h2>
                        <p className="mt-2 text-sm text-muted">
                          {getCategory(selectedTreatment.category)?.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void navigate({
                            search: { servizio: undefined },
                            resetScroll: false,
                          })
                        }
                        className="editorial-link min-h-11 self-start text-sm font-medium sm:self-auto"
                      >
                        Cambia servizio
                      </button>
                    </div>

                    <div className="mt-8 space-y-8">
                      {questions.map((question) => (
                        <fieldset key={question.id}>
                          <legend className="font-display text-2xl leading-tight text-ink">
                            {question.prompt}
                          </legend>
                          {question.hint ? (
                            <p className="mt-2 text-sm text-muted">{question.hint}</p>
                          ) : null}
                          <div className="mt-4 grid gap-2 sm:grid-cols-3">
                            {question.options.map((option) => {
                              const active = answers[question.id] === option.value;
                              return (
                                <label
                                  key={option.value}
                                  className={cn(
                                    "flex min-h-12 cursor-pointer items-center border px-4 py-3 text-sm transition-colors motion-reduce:transition-none",
                                    active
                                      ? "border-accent bg-surface text-accent-strong"
                                      : "border-line bg-canvas text-ink hover:border-ink",
                                  )}
                                >
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={option.value}
                                    checked={active}
                                    onChange={() => {
                                      setAnswers((current) => ({
                                        ...current,
                                        [question.id]: option.value,
                                      }));
                                      resetError();
                                    }}
                                    className="mr-3 h-4 w-4 shrink-0 accent-accent"
                                  />
                                  <span>{option.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      ))}
                    </div>

                    <StepActions
                      onBack={() => goToStep(1)}
                      onNext={continueFromQuestions}
                      nextLabel="Vedi il percorso"
                    />
                  </div>
                ) : null}

                {step === 3 && selectedTreatment ? (
                  <div>
                    <p className="eyebrow text-accent">03 · Il tuo percorso</p>
                    <h2 className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl">
                      Essenziale, non complicato.
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                      Mantieni il trattamento scelto e valuta fino a due suggerimenti pensati per
                      completarlo. Se desideri un percorso più ampio, puoi aggiungere altri servizi
                      dal catalogo. Sono suggerimenti editoriali, non indicazioni mediche.
                    </p>

                    <div className="mt-8 border-y border-line">
                      <div className="py-5">
                        <p className="eyebrow">Principale</p>
                        <div className="mt-2 flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-2xl text-ink">
                              {selectedTreatment.name}
                            </h3>
                            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                              {selectedTreatment.shortDescription}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-sm text-muted">
                              {selectedTreatment.priceLabel}
                            </span>
                            <Check
                              aria-hidden
                              size={20}
                              strokeWidth={1.7}
                              className="text-accent"
                            />
                          </div>
                        </div>
                      </div>

                      {recommendations.map((recommendation) => {
                        const included = !excludedRecommendations.includes(recommendation.slug);
                        return (
                          <div key={recommendation.slug} className="border-t border-line py-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="eyebrow">Complementare</p>
                                <h3 className="mt-2 font-display text-2xl text-ink">
                                  {recommendation.name}
                                </h3>
                                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                                  {recommendation.shortDescription}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-2">
                                <span className="text-sm text-muted">
                                  {recommendation.priceLabel}
                                </span>
                                <button
                                  type="button"
                                  aria-pressed={included}
                                  onClick={() => toggleRecommendation(recommendation.slug)}
                                  className={cn(
                                    "interactive-control inline-flex min-h-11 items-center border px-4 text-xs font-medium",
                                    included
                                      ? "border-accent bg-surface text-accent-strong"
                                      : "border-line bg-canvas text-muted",
                                  )}
                                >
                                  {included ? "Incluso" : "Escluso"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-ink">Vuoi aggiungere altro?</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                          Puoi comporre un percorso fino a {MAX_CONSULTATION_SELECTED_SERVICES}{" "}
                          servizi complessivi. Lo studio confermerà tempi e disponibilità.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setServicePickerOpen(true)}
                        className="interactive-control inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-line px-4 text-sm text-ink hover:border-ink"
                      >
                        <Plus aria-hidden size={16} strokeWidth={1.7} />
                        Aggiungi altri servizi
                      </button>
                    </div>

                    {additionalServices.length ? (
                      <div className="mt-5">
                        <p className="eyebrow">Aggiunti da te</p>
                        <ul className="mt-3 space-y-2 text-sm text-muted">
                          {additionalServices.map((item) => (
                            <li key={item.slug} className="flex items-center justify-between gap-4">
                              <span className="text-ink">+ {item.name}</span>
                              <span className="shrink-0">{item.priceLabel}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <AdditionalServicesDialog
                      open={servicePickerOpen}
                      onOpenChange={setServicePickerOpen}
                      mainServiceSlug={selectedTreatment.slug}
                      recommendationSlugs={recommendations.map((item) => item.slug)}
                      selectedSlugs={additionalServiceSlugs}
                      selectedCount={selectedServiceSlugs.length}
                      onToggle={toggleAdditionalService}
                    />

                    <div className="mt-5 flex items-baseline justify-between gap-4">
                      <span className="text-sm text-muted">Totale indicativo del percorso</span>
                      <strong className="font-display text-2xl font-normal text-ink">
                        {selectedTotal}
                      </strong>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{servicesNote}</p>

                    <StepActions
                      onBack={() => goToStep(2)}
                      onNext={continueFromRecommendations}
                      nextLabel="Continua"
                    />
                  </div>
                ) : null}

                {step === 4 && selectedTreatment ? (
                  <div>
                    <p className="eyebrow text-accent">04 · Contatto</p>
                    <h2 className="mt-4 font-display text-3xl leading-tight text-ink md:text-4xl">
                      Come possiamo ricontattarti?
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                      Invia una richiesta. Lo studio confermerà direttamente disponibilità e
                      appuntamento.
                    </p>

                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="text-sm font-medium text-ink">Nome e cognome *</span>
                        <input
                          value={name}
                          onChange={(event) => {
                            setName(event.target.value);
                            resetError();
                          }}
                          autoComplete="name"
                          className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-ink">Telefono *</span>
                        <input
                          value={phone}
                          onChange={(event) => {
                            setPhone(event.target.value);
                            resetError();
                          }}
                          inputMode="tel"
                          autoComplete="tel"
                          className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-ink">Email</span>
                        <input
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            resetError();
                          }}
                          type="email"
                          autoComplete="email"
                          className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-ink">
                          Preferisci essere contattato via *
                        </span>
                        <select
                          value={preferredContact}
                          onChange={(event) =>
                            setPreferredContact(event.target.value as PreferredContact)
                          }
                          className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
                        >
                          <option value="phone">Telefono</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="email">Email</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-ink">
                          Giorno preferito <span className="text-muted">(facoltativo)</span>
                        </span>
                        <input
                          type="date"
                          value={preferredDate}
                          onChange={(event) => setPreferredDate(event.target.value)}
                          className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
                        />
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-ink">Fascia preferita *</span>
                        <select
                          value={preferredWindow}
                          onChange={(event) => {
                            setPreferredWindow(event.target.value);
                            resetError();
                          }}
                          className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none focus:border-accent"
                        >
                          <option value="">Seleziona una fascia</option>
                          {consultationWindows.map((windowLabel) => (
                            <option key={windowLabel} value={windowLabel}>
                              {windowLabel}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="mt-6 flex items-start gap-3 border-t border-line pt-5 text-sm leading-relaxed text-muted">
                      <input
                        id="consultation-consent"
                        type="checkbox"
                        checked={consent}
                        onChange={(event) => {
                          setConsent(event.target.checked);
                          resetError();
                        }}
                        className="mt-1 h-4 w-4 shrink-0 accent-accent"
                      />
                      <p>
                        <label htmlFor="consultation-consent" className="cursor-pointer">
                          Ho letto l'
                        </label>
                        <Link
                          to="/privacy"
                          target="_blank"
                          rel="noreferrer"
                          className="text-ink underline decoration-line underline-offset-4 hover:text-accent"
                        >
                          informativa privacy
                        </Link>{" "}
                        <label htmlFor="consultation-consent" className="cursor-pointer">
                          e acconsento all'uso dei dati per essere ricontattato in merito a questa
                          richiesta.
                        </label>
                      </p>
                    </div>

                    <div className="mt-8 border-t border-line pt-6">
                      <p className="eyebrow">Riepilogo</p>
                      <ul className="mt-4 divide-y divide-line border-y border-line">
                        {selectedServices.map((item, index) => (
                          <li
                            key={item.slug}
                            className="flex items-center justify-between gap-4 py-3 text-sm"
                          >
                            <span className="text-ink">
                              {index === 0 ? item.name : `+ ${item.name}`}
                            </span>
                            <span className="shrink-0 text-muted">{item.priceLabel}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex items-baseline justify-between gap-4">
                        <span className="text-sm text-muted">Totale indicativo</span>
                        <strong className="font-display text-2xl font-normal text-ink">
                          {selectedTotal}
                        </strong>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-muted">{servicesNote}</p>
                    </div>

                    <div className="mt-8 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:flex sm:justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className="editorial-link inline-flex min-h-12 items-center gap-1.5 px-1 text-sm font-medium"
                      >
                        <ChevronLeft aria-hidden size={17} strokeWidth={1.7} />
                        Indietro
                      </button>
                      <button
                        type="button"
                        onClick={() => void submitConsultation()}
                        disabled={submitting}
                        className="action-primary inline-flex min-h-12 w-full items-center justify-center gap-2 border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong disabled:opacity-60 sm:w-auto sm:px-6"
                      >
                        <Sparkles aria-hidden size={16} strokeWidth={1.7} />
                        {submitting ? "Invio..." : "Invia la richiesta"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function AdditionalServicesDialog({
  open,
  onOpenChange,
  mainServiceSlug,
  recommendationSlugs,
  selectedSlugs,
  selectedCount,
  onToggle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mainServiceSlug: string;
  recommendationSlugs: string[];
  selectedSlugs: string[];
  selectedCount: number;
  onToggle: (slug: string) => void;
}) {
  const recommendationSet = new Set(recommendationSlugs);
  const options = treatments.filter(
    (treatment) => treatment.slug !== mainServiceSlug && !recommendationSet.has(treatment.slug),
  );
  const atLimit = selectedCount >= MAX_CONSULTATION_SELECTED_SERVICES;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[min(86dvh,46rem)] max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-none border-line bg-canvas p-0 text-ink sm:max-w-2xl">
        <DialogHeader className="border-b border-line px-5 pb-5 pt-6 text-left sm:px-6">
          <DialogTitle className="font-display text-3xl font-normal">
            Personalizza il percorso
          </DialogTitle>
          <DialogDescription className="mt-2 leading-relaxed text-muted">
            Aggiungi altri servizi oltre ai suggerimenti iniziali. Puoi selezionare fino a{" "}
            {MAX_CONSULTATION_SELECTED_SERVICES} servizi complessivi; la composizione finale verrà
            confermata dallo studio.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-2 sm:px-6">
          <div className="divide-y divide-line">
            {options.map((treatment) => {
              const active = selectedSlugs.includes(treatment.slug);
              const disabled = !active && atLimit;
              const category = getCategory(treatment.category);
              return (
                <button
                  key={treatment.slug}
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  onClick={() => onToggle(treatment.slug)}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 py-4 text-left transition-colors motion-reduce:transition-none",
                    disabled ? "cursor-not-allowed opacity-40" : "hover:text-accent",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-[0.12em] text-muted">
                      {category?.name ?? treatment.category}
                    </span>
                    <span className="mt-1 block font-medium text-ink">{treatment.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="text-sm text-muted">{treatment.priceLabel}</span>
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center border",
                        active
                          ? "border-accent bg-accent text-white"
                          : "border-line text-transparent",
                      )}
                    >
                      <Check aria-hidden size={14} strokeWidth={2} />
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <DialogFooter className="border-t border-line px-5 py-4 sm:px-6">
          <div className="flex w-full items-center justify-between gap-4">
            <span className="text-xs tabular-nums text-muted">
              {selectedCount} / {MAX_CONSULTATION_SELECTED_SERVICES} servizi
            </span>
            <DialogClose asChild>
              <button
                type="button"
                className="action-primary inline-flex min-h-11 items-center justify-center border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
              >
                Conferma selezione
              </button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line pb-2 last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="max-w-[60%] break-words text-right text-ink">{value}</dd>
    </div>
  );
}

function preferredContactLabel(value: PreferredContact) {
  if (value === "whatsapp") return "WhatsApp";
  if (value === "email") return "Email";
  return "Telefono";
}

function formatPreferredDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function StepActions({
  onBack,
  onNext,
  nextLabel,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-9 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t border-line pt-6 sm:flex sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        className="editorial-link inline-flex min-h-12 items-center gap-1.5 px-1 text-sm font-medium"
      >
        <ChevronLeft aria-hidden size={17} strokeWidth={1.7} />
        Indietro
      </button>
      <button
        type="button"
        onClick={onNext}
        className="action-primary inline-flex min-h-12 w-full items-center justify-center gap-2 border border-ink bg-ink px-5 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong sm:w-auto sm:px-6"
      >
        {nextLabel}
        <ChevronRight aria-hidden size={17} strokeWidth={1.7} />
      </button>
    </div>
  );
}
