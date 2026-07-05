import { useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2, LockKeyhole } from "lucide-react";
import { useAccess } from "@/contexts/AccessContext";
import heroVideo from "@/assets/SC_1-3.mp4";
import kultLogo from "@/assets/Kult Logo.png";
import zeroGLogo from "@/assets/0G Logo.png";

function errorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error) return error.message;
  return "Could not verify the access code";
}

export default function AccessLoginPage() {
  const { verifyCode } = useAccess();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim() || isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    try {
      await verifyCode(code);
      // Land on home — the only page that does not require a tier feature.
      window.history.replaceState(null, "", "/");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh overflow-hidden bg-[#03070d] text-white">

      <style>{`
        @keyframes flowR {
          0%   { transform: translateX(-60%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(60%); opacity: 0; }
        }
        @keyframes flowL {
          0%   { transform: translateX(60%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(-60%); opacity: 0; }
        }
        @keyframes flowR2 {
          0%   { transform: translateX(-40%); opacity: 0; }
          20%  { opacity: 0.7; }
          80%  { opacity: 0.7; }
          100% { transform: translateX(40%); opacity: 0; }
        }

        /* Entrance animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleFade {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes letterSpread {
          from { opacity: 0; letter-spacing: 0.4em; transform: translateY(16px); }
          to   { opacity: 1; letter-spacing: 0.08em; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(154,53,255,0.45); }
          50%       { box-shadow: 0 0 48px rgba(154,53,255,0.75), 0 0 80px rgba(154,53,255,0.3); }
        }

        .anim-logo    { animation: fadeDown 0.7s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.2s; }
        .anim-title   { animation: letterSpread 0.9s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.5s; }
        .anim-sub     { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.85s; }
        .anim-input   { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 1.05s; }
        .anim-btn     { animation: scaleFade 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 1.25s; }
        .btn-glow-pulse { animation: pulseGlow 2.8s ease-in-out infinite; animation-delay: 1.8s; }
      `}</style>

      {/* Video background */}
      <video
        className="fixed inset-0 h-dvh w-screen object-cover"
        src={heroVideo}
        autoPlay
        muted
        loop
        preload="metadata"
        playsInline
        aria-hidden
      />

      {/* Fog layer — wide horizontal bands flowing like air */}
      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {/* Layer 1 — thick base fog, flows right, slowest */}
        <div
          className="absolute bottom-[10%] left-0 h-32 w-[200%] rounded-full bg-white/30 blur-[80px]"
          style={{ animation: "flowR 18s linear infinite" }}
        />
        {/* Layer 2 — flows left, slightly higher */}
        <div
          className="absolute bottom-[18%] left-0 h-24 w-[200%] rounded-full bg-white/20 blur-[70px]"
          style={{ animation: "flowL 22s linear infinite 4s" }}
        />
        {/* Layer 3 — thinner wisp, fast, flows right */}
        <div
          className="absolute bottom-[28%] left-0 h-16 w-[200%] rounded-full bg-white/15 blur-[60px]"
          style={{ animation: "flowR2 14s linear infinite 2s" }}
        />
        {/* Layer 4 — faint purple tint, flows left, tall band */}
        <div
          className="absolute bottom-[6%] left-0 h-40 w-[200%] rounded-full bg-purple-100/20 blur-[90px]"
          style={{ animation: "flowL 26s linear infinite 7s" }}
        />
        {/* Layer 5 — very faint top wisp */}
        <div
          className="absolute bottom-[35%] left-0 h-12 w-[200%] rounded-full bg-white/10 blur-[50px]"
          style={{ animation: "flowR 16s linear infinite 9s" }}
        />
      </div>

      {/* Bottom scrim so text stays readable over fog */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[2] h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content */}
      <section className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-end px-5 pb-28 text-center">

        {/* Logo bar */}
        <div className="anim-logo mb-6 flex items-center gap-4 rounded-xl border border-white/10 bg-black/40 px-5 py-2.5 backdrop-blur-md">
          <img src={zeroGLogo} alt="0G" className="h-7 w-auto object-contain" />
          <span className="h-6 w-px bg-white/20" aria-hidden />
          <img src={kultLogo} alt="Kult Games" className="h-8 w-auto object-contain" />
        </div>

        <h1
          className="anim-title w-full whitespace-nowrap font-tech font-black uppercase leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]"
          style={{ fontSize: "clamp(1.6rem, 8vw, 4.5rem)", letterSpacing: "0.08em" }}
        >
          Kult Browser
        </h1>
        <p className="anim-sub mt-2 text-[11px] font-bold uppercase tracking-[0.34em] text-white/50">
          Private access gateway
        </p>

        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-sm">
          <label className="sr-only" htmlFor="access-code">Access code</label>

          {/* Input wrapper — glows white when focused */}
          <div
            className="anim-input flex items-center gap-3 rounded-xl border bg-black/50 px-4 py-1 backdrop-blur-xl transition-all duration-300"
            style={{
              borderColor: focused ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
              boxShadow: focused ? "0 0 0 1px rgba(255,255,255,0.1), 0 0 24px rgba(255,255,255,0.12), 0 0 60px rgba(255,255,255,0.06)" : "none",
            }}
          >
            <KeyRound className="h-4 w-4 shrink-0 text-white/50" />
            <input
              id="access-code"
              type={showCode ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="new-password"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter access code"
              className="access-code-input h-12 min-w-0 flex-1 border-0 bg-transparent font-tech text-sm font-bold tracking-[0.18em] text-white outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => setShowCode((c) => !c)}
              aria-label={showCode ? "Hide code" : "Show code"}
              className="text-white/40 transition hover:text-white/80"
            >
              {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error ? (
            <div className="mt-3 rounded-lg border border-red-400/20 bg-red-950/40 px-4 py-2.5 text-xs font-semibold text-red-200 backdrop-blur-sm">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={code.length !== 6 || isSubmitting}
            className="anim-btn btn-glow-pulse mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#9a35ff] font-tech text-sm font-black uppercase tracking-[0.14em] text-white transition-all duration-300 hover:bg-[#8525eb] hover:shadow-[0_0_40px_rgba(154,53,255,0.7)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
            Enter
          </button>
        </form>
      </section>
    </main>
  );
}
