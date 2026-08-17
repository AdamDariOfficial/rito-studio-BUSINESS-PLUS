import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { getAdminSession, loginAdminSession } from "@/features/consultation/consultation.functions";
import { getConsultationProfile } from "@/features/consultation/config";
import { buildHead, routeSeo } from "@/lib/seo";

export const Route = createFileRoute("/admin_/login")({
  head: () => buildHead(routeSeo.adminLogin),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const profile = getConsultationProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(profile === "live");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (profile !== "live") return;
    let cancelled = false;
    void getAdminSession()
      .then((session) => {
        if (!cancelled && session.authenticated) window.location.replace("/admin");
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (profile !== "live" || submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const result = await loginAdminSession({ data: { email, password } });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      window.location.assign("/admin");
    } catch {
      setMessage("Accesso temporaneamente non disponibile. Riprova tra poco.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line bg-canvas">
        <div className="container-editorial flex min-h-16 items-center justify-between gap-4 py-3">
          <Link to="/" className="font-display text-lg text-ink">
            RITO Studio
          </Link>
          <Link to="/" className="editorial-link min-h-11 text-sm font-medium">
            <ArrowLeft aria-hidden size={16} strokeWidth={1.7} />
            Torna al sito
          </Link>
        </div>
      </header>

      <main className="container-editorial grid min-h-[calc(100vh-4rem)] items-center py-10 md:py-16">
        <section className="mx-auto grid w-full max-w-5xl overflow-hidden border border-line bg-canvas md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden min-h-[36rem] overflow-hidden border-r border-line bg-ink p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <p className="eyebrow text-white/60">RITO Studio</p>
              <h1 className="mt-5 max-w-sm font-display text-[clamp(3rem,6vw,5rem)] leading-[0.92]">
                Uno spazio riservato, nel ritmo dello studio.
              </h1>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/60">
              Consultation Inbox raccoglie esclusivamente le richieste inviate dal percorso di
              consulenza RITO.
            </p>
          </div>

          <div className="flex min-h-[32rem] flex-col justify-center p-6 sm:p-10 md:p-12 lg:p-16">
            <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-accent/30 text-accent">
              <LockKeyhole aria-hidden size={19} strokeWidth={1.6} />
            </div>
            <p className="eyebrow text-accent">Area riservata</p>
            <h2 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.4rem)] leading-[0.95]">
              Accedi alla <span className="italic text-accent">Consultation Inbox.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
              Inserisci le credenziali amministrative RITO. La sessione resta protetta sul server e
              non viene salvata nel browser come token leggibile da JavaScript.
            </p>

            {profile === "demo" ? (
              <div className="mt-8 border border-line bg-surface p-5">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                  Credenziale demo
                </p>
                <p className="mt-2 font-medium text-ink">admin@gmail.com</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  In profilo demo l'Inbox usa dati locali e non simula una protezione server-side.
                </p>
                <Link
                  to="/admin"
                  className="action-primary mt-5 inline-flex min-h-12 w-full items-center justify-center border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong"
                >
                  Apri la demo
                </Link>
              </div>
            ) : loading ? (
              <p className="mt-8 text-sm text-muted">Verifica sessione…</p>
            ) : (
              <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
                <label className="block">
                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">
                    Email
                  </span>
                  <input
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (message) setMessage("");
                    }}
                    required
                    className="mt-2 min-h-12 w-full border border-line bg-canvas px-4 text-sm text-ink outline-none transition-colors focus:border-accent motion-reduce:transition-none"
                  />
                </label>

                <label className="block">
                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">
                    Password
                  </span>
                  <span className="relative mt-2 block">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        if (message) setMessage("");
                      }}
                      required
                      className="min-h-12 w-full border border-line bg-canvas px-4 pr-12 text-sm text-ink outline-none transition-colors focus:border-accent motion-reduce:transition-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute inset-y-0 right-0 flex min-h-12 min-w-12 items-center justify-center text-muted hover:text-ink"
                      aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden size={17} strokeWidth={1.7} />
                      ) : (
                        <Eye aria-hidden size={17} strokeWidth={1.7} />
                      )}
                    </button>
                  </span>
                </label>

                {message ? (
                  <p
                    role="alert"
                    className="border border-accent/30 bg-surface p-4 text-sm text-ink"
                  >
                    {message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting || !email.trim() || !password}
                  className="action-primary inline-flex min-h-12 w-full items-center justify-center border border-ink bg-ink px-6 text-sm font-medium text-white hover:border-accent-strong hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Accesso…" : "Accedi"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
