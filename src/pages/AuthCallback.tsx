import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Wordmark } from "../components/Shell";

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function settle() {
      const { data, error } = await supabase.auth.getSession();
      if (cancelled) return;
      if (error) { setError(error.message); return; }
      if (data.session) {
        navigate("/dashboard", { replace: true });
        return;
      }
      // No session yet — wait for onAuthStateChange (SDK still parsing URL hash)
      const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
        if (next) {
          sub.subscription.unsubscribe();
          navigate("/dashboard", { replace: true });
        }
      });
      // Bail out after 8s with a clear error rather than spinning forever
      setTimeout(() => {
        sub.subscription.unsubscribe();
        if (!cancelled) setError("We couldn't read the sign-in link. Try again from the login page.");
      }, 8000);
    }

    settle();
    return () => { cancelled = true; };
  }, [navigate]);

  return (
    <main className="min-h-screen bg-sauce-black text-sauce-cream noise">
      <div className="mx-auto flex min-h-screen w-full max-w-[820px] flex-col items-center justify-center px-gutter text-center">
        <Wordmark size="sm" />
        <p className="mt-10 mono-folio text-sauce-creamMuted">
          {error ? error : "Signing you in…"}
        </p>
        {error && (
          <button onClick={() => navigate("/login", { replace: true })} className="btn-gold mt-8">
            Back to login
          </button>
        )}
      </div>
    </main>
  );
}
