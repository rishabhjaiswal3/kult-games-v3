import { useEffect, useRef, useState } from "react";
import kultLogo from "@/assets/kult-logo.png";

/** Minimum splash time, keep short so the app feels immediate. */
const MIN_DURATION = 700;
/** Hard cap so a slow network never blocks the app for long. */
const MAX_DURATION = 1400;

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [show, setShow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasExitedRef = useRef(false);

  useEffect(() => {
    const startedAt = performance.now();

    const finish = () => {
      if (hasExitedRef.current) return;
      hasExitedRef.current = true;
      onComplete();

      const node = containerRef.current;
      if (!node) {
        setShow(false);
        return;
      }

      node.classList.add("kult-splash-exit");
      const onEnd = () => setShow(false);
      node.addEventListener("animationend", onEnd, { once: true });
      window.setTimeout(onEnd, 500);
    };

    const scheduleFinish = () => {
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_DURATION - elapsed);
      window.setTimeout(finish, remaining);
    };

    if (document.readyState === "complete") {
      scheduleFinish();
      return;
    }

    const maxTimer = window.setTimeout(finish, MAX_DURATION);
    const onReady = () => {
      window.clearTimeout(maxTimer);
      scheduleFinish();
    };

    window.addEventListener("load", onReady, { once: true });
    return () => {
      window.clearTimeout(maxTimer);
      window.removeEventListener("load", onReady);
    };
  }, [onComplete]);

  if (!show) return null;

  return (
    <div
      ref={containerRef}
      className="kult-splash fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "hsl(220 50% 4%)" }}
    >
      <div className="kult-splash-ambient absolute inset-0 pointer-events-none" />
      <div className="absolute top-[12%] left-1/2 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-[hsl(278_100%_70%/0.12)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[14%] h-[220px] w-[220px] rounded-full bg-[hsl(195_100%_60%/0.08)] blur-[110px] pointer-events-none" />

      <div className="relative z-10 flex w-full max-w-[540px] flex-col items-center gap-7 px-6">
        <div className="kult-splash-logo relative flex flex-col items-center">
          <div className="kult-splash-ring absolute inset-[-18px] rounded-[32px] border border-[hsl(278_100%_75%/0.16)]" />
          <div className="relative rounded-[24px] border border-[hsl(278_100%_75%/0.18)] bg-[linear-gradient(135deg,hsl(265_90%_18%/0.72),hsl(220_45%_10%/0.35))] px-8 py-6 backdrop-blur-xl shadow-[0_0_40px_hsl(270_82%_58%/0.18)]">
            <img src={kultLogo} alt="Kult Games" className="h-12 w-auto md:h-14" width={168} height={56} decoding="async" />
          </div>
        </div>

        <div className="kult-splash-copy text-center">
          <div className="kult-splash-title font-display text-3xl md:text-5xl font-black tracking-[0.22em] text-foreground">
            KULT GAMES
          </div>
          <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.48em] text-[hsl(278_100%_82%/0.72)]">
            AI-Native On-Chain Play
          </p>
        </div>

        <div
          className="h-[1px] w-[240px] kult-splash-divider"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(278 100% 78% / 0.4), transparent)",
          }}
        />

        <div className="w-full max-w-[280px]">
          <div className="mb-2 flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.35em] text-muted-foreground/70">
            <span>Initializing</span>
            <span>0G Sync</span>
          </div>
          <div className="relative h-[6px] overflow-hidden rounded-full border border-[hsl(278_100%_75%/0.14)] bg-white/5 p-[1px]">
            <div className="kult-splash-progress-shimmer absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="kult-splash-progress h-full w-full rounded-full" />
          </div>
        </div>

        <span className="kult-splash-status text-[8px] font-mono text-[hsl(278_100%_82%/0.52)] tracking-[0.5em] uppercase -mt-2">
          ENTERING THE VOID
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;
