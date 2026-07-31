import { ArrowUpRight } from "lucide-react";

import backgroundCreatorModel from "@/assets/background_Creator_model.png";
import { cn } from "@/lib/utils";

const promoGradient =
  "linear-gradient(to top, #06050b 0%, #0e0c16 38%, #181528 72%, #6d668f 100%)";

export function CreatorStudioPromoCard({
  onPrimaryAction,
  className,
}: {
  onPrimaryAction: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/15 p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: promoGradient }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="relative z-10 w-full overflow-hidden pt-3">
        <img
          src={backgroundCreatorModel}
          alt=""
          aria-hidden="true"
          className="relative left-1/2 mx-auto block h-auto w-[112%] max-w-none -translate-x-[calc(50%+4px)] select-none object-contain object-center drop-shadow-[0_18px_40px_rgba(124,58,237,0.35)]"
          draggable={false}
        />
      </div>

      <div className="relative z-10 px-5 pb-5 pt-2 text-center">
        <h2 className="font-tech text-[1.35rem] font-black leading-[1.02] tracking-[0.06em] text-white sm:text-[1.5rem]">
          CREATOR STUDIO
        </h2>
        <p className="mt-1 font-tech text-[1.35rem] font-black leading-[1.02] tracking-[0.06em] sm:text-[1.5rem]">
          <span className="bg-[linear-gradient(90deg,#d946ef,#7c3aed,#22d3ee)] bg-clip-text text-transparent">
            IS NOW LIVE
          </span>
        </p>

        <p className="mx-auto mt-3 max-w-[22rem] text-sm font-semibold leading-relaxed text-white/85">
          Describe your game idea — our AI builds it for you. Pick Hybrid for speed, Pro for polish, or Ultra for
          premium quality.
        </p>
        <p className="mt-2 text-xs font-medium text-white/60">
          Publish, share, and climb the leaderboard with games only you could make.
        </p>

        <button
          type="button"
          onClick={onPrimaryAction}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-300/30 bg-[linear-gradient(90deg,#d946ef,#7c3aed)] px-5 font-tech text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_10px_26px_rgba(168,85,247,0.45),0_0_30px_rgba(217,70,239,0.25)] transition hover:brightness-110 active:scale-[0.99]"
        >
          Open Creator Studio
          <ArrowUpRight className="size-4 shrink-0" aria-hidden />
        </button>
      </div>
    </section>
  );
}
