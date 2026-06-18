import { useState } from "react";
import { KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useAccess } from "@/contexts/AccessContext";
import heroVideo from "@/assets/hero-video.mp4";
import kultLogo from "@/assets/Kult Logo.png";
import zeroGLogo from "@/assets/0G Logo.png";
import dashboardCrest from "@/assets/dashboard-crest.png";

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
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(134,44,255,0.18),transparent_34%),linear-gradient(180deg,rgba(3,7,13,0.26),rgba(3,7,13,0.84)_58%,rgba(3,7,13,0.98))]" />
      <div className="fixed inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(24,9,80,0.54)_38%,rgba(3,7,13,0.98))]" />

      <section className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center px-5 py-8 text-center">
        <div className="mb-8 flex items-center gap-3">
          <img src={zeroGLogo} alt="0G" className="h-7 w-auto object-contain drop-shadow-[0_0_16px_rgba(34,211,238,0.4)]" />
          <span className="h-6 w-px bg-white/20" aria-hidden />
          <img src={kultLogo} alt="Kult Games" className="h-8 w-auto object-contain drop-shadow-[0_0_18px_rgba(168,85,247,0.45)]" />
        </div>

        <img
          src={dashboardCrest}
          alt=""
          className="mb-4 h-24 w-24 object-contain opacity-95 drop-shadow-[0_0_30px_rgba(154,53,255,0.42)]"
          aria-hidden
        />

        <h1 className="font-tech text-4xl font-black uppercase tracking-[0.14em] text-white sm:text-6xl">
          Kult Browser
        </h1>
        <p className="mt-3 max-w-xl text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/78">
          Private access gateway
        </p>

        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-xl">
          <label className="sr-only" htmlFor="access-code">Access code</label>
          <div className="flex min-h-[58px] items-center gap-3 rounded-md border border-cyan-300/25 bg-[#02135c]/82 px-4 shadow-[0_0_34px_rgba(37,99,235,0.34)] backdrop-blur-md">
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
              className="h-14 min-w-0 flex-1 bg-transparent font-tech text-sm font-bold uppercase tracking-[0.18em] text-white outline-none placeholder:text-cyan-100/38"
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
            className="mt-5 inline-flex min-h-[50px] min-w-44 items-center justify-center gap-2 rounded-md border border-white/45 bg-gradient-to-b from-white to-zinc-400 px-8 font-tech text-base font-black uppercase tracking-[0.14em] text-zinc-800 shadow-[inset_0_2px_0_rgba(255,255,255,0.9),0_12px_26px_rgba(0,0,0,0.34)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
            Enter
          </button>
        </form>

        <div className="mt-9 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/72">
          <ShieldCheck className="h-4 w-4 text-cyan-200" />
          Invite-only feature access
        </div>
      </section>
    </main>
  );
}
