import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Wordmark } from "../components/Shell";

type Mode = "signin" | "signup";

export function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const valid = email.includes("@") && password.length >= 8;
  const redirectTo = `${window.location.origin}/auth/callback`;

  async function continueWithGoogle() {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setBusy(false);
      setError(error.message);
    }
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setError(null);
    setInfo(null);
    setBusy(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      navigate("/dashboard", { replace: true });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    setBusy(false);
    if (error) return setError(error.message);
    if (data.session) {
      navigate("/dashboard", { replace: true });
      return;
    }
    setInfo(`Check ${email}. We sent a confirmation link.`);
  }

  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-gutter">
        <header className="flex items-center justify-between border-b border-sauce-hairlineStrong py-5">
          <Link to="/" className="contents"><Wordmark size="sm" /></Link>
          <Link to="/" className="mono-folio text-sauce-muted hover:text-sauce-gold transition">← Back</Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-section">
          <section className="w-full max-w-[420px] rounded-2xl border border-sauce-hairlineStrong bg-sauce-surface/40 p-8 backdrop-blur animate-screen-enter">
            <div className="mb-6">
              <h1 className="font-display text-3xl font-semibold leading-[1.05] tracking-tightest text-sauce-cream">
                {mode === "signin" ? "Sign in" : "Create account"}
              </h1>
              <p className="mt-2 text-caption text-sauce-creamMuted">
                {mode === "signin"
                  ? "Pick up where you left off."
                  : "Start the 90 days."}
              </p>
            </div>

            <form onSubmit={submitEmail} className="flex flex-col gap-5">
              <label className="flex flex-col gap-1.5">
                <span className="mono-folio text-sauce-muted">Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="input"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="mono-folio text-sauce-muted">Password</span>
                  {mode === "signin" && (
                    <button type="button" className="mono-folio text-sauce-muted hover:text-sauce-gold transition">
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="input"
                  minLength={8}
                  required
                />
              </label>

              {error && (
                <p className="mono-folio text-sauce-gold" role="alert">{error}</p>
              )}
              {info && (
                <p className="flex items-start gap-2 mono-folio text-sauce-gold" role="status">
                  <Mail size={14} className="mt-0.5 shrink-0" />
                  <span>{info}</span>
                </p>
              )}

              <button type="submit" disabled={!valid || busy} className="btn-gold w-full justify-center !rounded-xl">
                {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
              </button>

              <button
                type="button"
                onClick={continueWithGoogle}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-sauce-hairlineStrong bg-transparent px-4 py-3 mono-folio text-sauce-cream transition hover:bg-sauce-surface/60 disabled:opacity-50"
              >
                <GoogleGlyph />
                Continue with Google
              </button>
            </form>

            <p className="mt-6 text-center mono-folio text-sauce-muted">
              {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setInfo(null); }}
                className="text-sauce-cream underline underline-offset-4 hover:text-sauce-gold transition"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </section>
        </div>

        <footer className="border-t border-sauce-hairline py-5 mono-folio text-sauce-muted">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline underline-offset-4 hover:text-sauce-goldBright">terms</Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline underline-offset-4 hover:text-sauce-goldBright">privacy policy</Link>.
        </footer>
      </div>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.4 4 9.8 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.7 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.9 5.5l6.2 5.2C41.5 35.7 44 30.3 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
