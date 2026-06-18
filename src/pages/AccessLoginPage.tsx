import { useState } from "react";
import { KeyRound, Loader2, LockKeyhole } from "lucide-react";
import { useAccess } from "@/contexts/AccessContext";
import heroVideo from "@/assets/hero-video.mp4";
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim() || isSubmitting) return;

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
    <main className="relative flex min-h-dvh overflow-hidden bg-[#03070d] text-white">
      <video
        className="fixed inset-0 h-dvh w-screen object-cover opacity-55"
        src={heroVideo}
        autoPlay
        muted
        loop
        playsInline
        aria-hidden
      />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(142,63,255,0.28),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(34,211,238,0.12),transparent_34%),linear-gradient(180deg,rgba(3,7,13,0.18),rgba(3,7,13,0.74)_56%,rgba(3,7,13,0.97))]" />
      <div className="fixed inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(26,8,82,0.58)_38%,rgba(3,7,13,0.98))]" />

      <section className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center px-5 py-8 text-center">
        <div className="mb-9 flex items-center gap-4 rounded-md border border-white/10 bg-black/18 px-5 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-md">
          <img src={zeroGLogo} alt="0G" className="h-8 w-auto object-contain drop-shadow-[0_0_16px_rgba(34,211,238,0.38)]" />
          <span className="h-7 w-px bg-white/22" aria-hidden />
          <img src={kultLogo} alt="Kult Games" className="h-9 w-auto object-contain drop-shadow-[0_0_18px_rgba(168,85,247,0.42)]" />
        </div>

        <h1 className="max-w-[12ch] font-tech text-5xl font-black uppercase leading-[0.92] tracking-[0.16em] text-white drop-shadow-[0_0_34px_rgba(154,53,255,0.32)] sm:max-w-none sm:text-7xl lg:text-8xl">
          Kult Browser
        </h1>
        <p className="mt-5 max-w-xl text-xs font-bold uppercase tracking-[0.32em] text-cyan-100/76 sm:text-sm">
          Private access gateway
        </p>

        <form onSubmit={handleSubmit} className="mt-11 w-full max-w-xl">
          <label className="sr-only" htmlFor="access-code">Access code</label>
          <div className="flex min-h-[62px] items-center gap-3 rounded-md border border-cyan-200/28 bg-[#041048]/76 px-4 shadow-[0_0_34px_rgba(37,99,235,0.26),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition focus-within:border-cyan-100/55 focus-within:shadow-[0_0_46px_rgba(34,211,238,0.28),inset_0_1px_0_rgba(255,255,255,0.12)]">
            <KeyRound className="h-5 w-5 shrink-0 text-cyan-200" />
            <input
              id="access-code"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="off"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Access code"
              className="h-14 min-w-0 flex-1 bg-transparent font-tech text-sm font-bold tracking-[0.18em] text-white outline-none placeholder:text-cyan-100/42"
            />
          </div>

          {error ? (
            <div className="mt-3 rounded-md border border-red-400/25 bg-red-950/45 px-4 py-3 text-sm font-semibold text-red-100">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={code.length !== 6 || isSubmitting}
            className="mt-6 inline-flex min-h-[52px] min-w-48 items-center justify-center gap-2 rounded-md border border-white/50 bg-gradient-to-b from-white via-zinc-200 to-zinc-500 px-9 font-tech text-base font-black uppercase tracking-[0.16em] text-zinc-800 shadow-[inset_0_2px_0_rgba(255,255,255,0.9),0_18px_34px_rgba(0,0,0,0.38),0_0_24px_rgba(255,255,255,0.12)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
            Enter
          </button>
        </form>
      </section>
    </main>
  );
}
