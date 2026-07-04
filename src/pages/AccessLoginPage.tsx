import { useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { useAccess } from "@/contexts/AccessContext";
import heroVideo from "@/assets/SC_1-3.mp4";
import kultLogo from "@/assets/Kult Logo.png";
import zeroGLogo from "@/assets/0G Logo.png";

const CARD_DOT_GRID =
  "radial-gradient(circle, rgba(0,0,0,0.045) 1px, transparent 1px)";

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

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!code.trim() || isSubmitting || code.length !== 6) return;
    setError("");
    setIsSubmitting(true);
    try {
      await verifyCode(code);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#f4f4f5] px-4 py-10 font-body">
      <video
        className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[0.12]"
        src={heroVideo}
        autoPlay
        muted
        loop
        preload="metadata"
        playsInline
        aria-hidden
      />

      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]"
        style={{
          backgroundImage: CARD_DOT_GRID,
          backgroundSize: "18px 18px",
        }}
      >
        <div className="relative px-7 pb-6 pt-5">
          <div className="px-2 pb-2 pt-4 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gray-900 shadow-sm">
              <img src={kultLogo} alt="Kult" className="h-8 w-8 object-contain brightness-110" />
            </div>

            <h1 className="text-[1.65rem] font-bold tracking-tight text-gray-900">
              Welcome to Kult Browser
            </h1>
            <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-gray-500">
              Enter your private access code to unlock games, AI arena, and the full Kult experience.
            </p>
          </div>

          <div className="mb-5 flex items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3">
            <img src={zeroGLogo} alt="0G" className="h-6 w-auto object-contain opacity-80" />
            <span className="h-5 w-px bg-gray-200" aria-hidden />
            <img src={kultLogo} alt="Kult Games" className="h-7 w-auto object-contain" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="sr-only" htmlFor="access-code">
              Access code
            </label>

            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1.5 pl-4 shadow-sm transition-all focus-within:border-gray-300 focus-within:shadow-md">
              <KeyRound className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                id="access-code"
                type={showCode ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete="new-password"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Access code"
                className="access-code-input h-11 min-w-0 flex-1 bg-transparent text-sm font-medium tracking-[0.22em] text-gray-900 outline-none placeholder:tracking-normal placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowCode((current) => !current)}
                aria-label={showCode ? "Hide code" : "Show code"}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="submit"
                disabled={code.length !== 6 || isSubmitting}
                aria-label="Enter"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #00FF94 0%, #00E0FF 100%)",
                  boxShadow: "0 4px 14px rgba(0, 224, 255, 0.35)",
                }}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                )}
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                {error}
              </div>
            ) : null}
          </form>

          <p className="mt-8 text-center text-[10px] text-gray-400">
            © Copyright 2026 — Kult Games — All Rights Reserved
          </p>
        </div>
      </div>
    </main>
  );
}
