"use client";

import { useState } from "react";
import {
  HardHat,
  Shield,
  Package,
  Zap,
  Droplet,
  Hammer,
  Construction,
  Layers,
  Paintbrush,
  Users,
  Sun,
  Moon,
  Key,
  ArrowRight,
  Lock,
  Check,
  X,
} from "lucide-react";
import { AppToolbar } from "@/components/app-toolbar";
import { Dashboard } from "@/components/dashboard";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_CONFIG, ROLE_ORDER, cn } from "@/lib/utils";
import type { Role } from "@/lib/utils";

/** Map the string icon name stored in ROLE_CONFIG to the actual lucide component. */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  package: Package,
  "hard-hat": HardHat,
  zap: Zap,
  droplet: Droplet,
  hammer: Hammer,
  trowel: Construction,
  layers: Layers,
  paintbrush: Paintbrush,
  users: Users,
};

/** Map the color name from ROLE_CONFIG to a Tailwind text color class. */
const COLOR_TEXT: Record<string, string> = {
  red: "text-red-600",
  amber: "text-amber-600",
  orange: "text-orange-600",
  yellow: "text-yellow-600",
  teal: "text-teal-600",
  slate: "text-slate-700",
  green: "text-green-600",
  purple: "text-purple-600",
};

export function LoginScreen() {
  const { role, mounted, login, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Decorative theme toggle state (no real theme system wired up yet).
  const [themeIcon, setThemeIcon] = useState<"sun" | "moon">("sun");

  // After mount + auth check: if a role is set, render the dashboard.
  if (mounted && role) {
    return <Dashboard role={role} onLogout={logout} />;
  }

  const handlePick = (r: Role) => {
    setSelectedRole(r);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Veuillez saisir un code d'accès.");
      return;
    }
    // If the user has selected an espace, ensure the code matches that role.
    if (
      selectedRole &&
      code.trim().toUpperCase() !== ROLE_CONFIG[selectedRole].accessCode
    ) {
      setError(
        `Code incorrect pour l'espace « ${ROLE_CONFIG[selectedRole].label} ». Vérifiez votre saisie.`
      );
      return;
    }
    setLoading(true);
    setError(null);
    // Small delay for UX feedback.
    setTimeout(() => {
      const result = login(code);
      if (!result.success) {
        setError(result.error ?? "Échec de connexion.");
        setLoading(false);
      } else {
        setSuccess(true);
        // On success, the hook will re-render and switch to Dashboard.
      }
    }, 180);
  };

  const colorTextFor = (r: Role) =>
    COLOR_TEXT[ROLE_CONFIG[r].color] ?? "text-slate-700";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] batitrack-bg">
      <AppToolbar />

      {/* ───────────────────────── Header bar ───────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <h1 className="text-xl font-extrabold tracking-tight">
                  <span className="text-orange-500">Bâti</span>
                  <span className="text-red-700">Track</span>
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                  Gestion de chantier &amp; parc
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setThemeIcon((t) => (t === "sun" ? "moon" : "sun"))}
              aria-label="Changer le thème"
              title="Thème (décoratif)"
              className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--primary)]/40 transition flex items-center justify-center"
            >
              {themeIcon === "sun" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ───────────────────────── Main content ───────────────────────── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto animate-fade-in">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1 text-xs font-medium">
            <Lock className="w-3 h-3" />
            Accès par code personnel
          </span>
          <h2
            className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Bienvenue sur BâtiTrack
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Chaque métier dispose de son espace réservé. Sélectionnez votre
            espace puis saisissez le code d&apos;accès personnel qui vous a été
            remis par l&apos;administrateur.
          </p>
        </div>

        {/* ───────────────────────── Grid of métier cards ───────────────────────── */}
        <section
          aria-label="Espaces métiers"
          className="mt-10 grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {ROLE_ORDER.map((r, i) => {
            const cfg = ROLE_CONFIG[r];
            const Icon = ICON_MAP[cfg.icon] ?? Shield;
            const colorText = colorTextFor(r);
            const active = selectedRole === r;
            return (
              <article
                key={r}
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => handlePick(r)}
                className={cn(
                  "animate-fade-in rounded-xl border bg-[var(--surface)] shadow-sm overflow-hidden transition-all duration-200 cursor-pointer",
                  active
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30 shadow-md -translate-y-0.5"
                    : "border-[var(--border)] hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--primary)]/40"
                )}
              >
                {/* Gradient header band */}
                <div
                  className={cn(
                    "relative bg-gradient-to-r flex items-center justify-between px-4 py-3",
                    cfg.gradient
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/90 bg-white/15 rounded-full px-2 py-1">
                    <Lock className="w-2.5 h-2.5" />
                    Code requis
                  </span>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className={cn("text-base font-bold", colorText)}>
                    {cfg.label}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed min-h-[2.25rem]">
                    {cfg.description}
                  </p>

                  <div className="mt-3 flex items-start gap-1.5 text-xs text-[var(--text-muted)]">
                    <Users className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Périmètre :{" "}
                      <span className={cn("font-medium", colorText)}>
                        {cfg.perimetre}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePick(r);
                      document
                        .getElementById("login-form")
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className={cn(
                      "mt-3 inline-flex items-center gap-1.5 text-xs font-semibold transition group",
                      colorText,
                      "hover:underline underline-offset-2"
                    )}
                  >
                    <Key className="w-3.5 h-3.5" />
                    Entrer
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* ───────────────────────── Unified code input ───────────────────────── */}
        <section
          id="login-form"
          aria-label="Connexion par code d'accès"
          className="mt-10 mx-auto max-w-md scroll-mt-24"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-5 sm:p-6 animate-fade-in"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-sm">
                <Key className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text)]">
                  Code d&apos;accès
                </p>
                {selectedRole ? (
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    Espace sélectionné :{" "}
                    <span className="font-medium text-[var(--text)]">
                      {ROLE_CONFIG[selectedRole].label}
                    </span>
                  </p>
                ) : (
                  <p className="text-xs text-[var(--text-muted)]">
                    Sélectionnez un espace ci-dessus.
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(null);
                  if (success) setSuccess(false);
                }}
                placeholder="Saisissez votre code…"
                className="w-full h-11 pl-10 pr-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition font-mono tracking-wide"
              />
              {code && (
                <button
                  type="button"
                  onClick={() => {
                    setCode("");
                    setError(null);
                    setSuccess(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition"
                  aria-label="Effacer la saisie"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {error && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {selectedRole &&
              !error &&
              code.trim().toUpperCase() ===
                ROLE_CONFIG[selectedRole].accessCode && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Code valide pour l&apos;espace{" "}
                    {ROLE_CONFIG[selectedRole].label}.
                  </span>
                </div>
              )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className={cn(
                "mt-4 w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-white transition",
                "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md",
                "active:scale-[0.99]"
              )}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Connexion…
                </>
              ) : success ? (
                <>
                  <Check className="w-4 h-4" />
                  Connecté
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
              {selectedRole
                ? "Vérifiez votre code puis cliquez sur « Se connecter »."
                : "Choisissez un métier ci-dessus pour commencer."}
            </p>
          </form>
        </section>
      </main>

      {/* ───────────────────────── Footer ───────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-[var(--text-muted)]">
          BâtiTrack · par{" "}
          <span className="font-semibold text-[var(--text)]">
            LEGAGNEUR DÉVELOPPEMENT
          </span>
        </div>
      </footer>
    </div>
  );
}

export default LoginScreen;
