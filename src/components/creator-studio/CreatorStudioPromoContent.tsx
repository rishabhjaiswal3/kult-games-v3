import { ArrowUpRight, X } from "lucide-react";

import backgroundCreatorModel from "@/assets/background_Creator_model.png";
import { cn } from "@/lib/utils";

export const creatorStudioPromoGradient =
  "linear-gradient(to top, #06050b 0%, #0e0c16 38%, #181528 72%, #6d668f 100%)";

export function CreatorStudioPromoContent({
  onPrimaryAction,
  primaryLabel = "Open Creator Studio",
  className,
  onClose,
}: {
  onPrimaryAction: () => void;
  primaryLabel?: string;
  className?: string;
  onClose?: () => void;
}) {
  return (
    <div className={cn("relative overflow-hidden p-0", className)}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: creatorStudioPromoGradient }}
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

        {onClose ? (
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-3 top-2 z-20 grid size-9 place-items-center rounded-full border border-white/15 bg-black/30 text-white/85 shadow-[0_0_22px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-black/45 hover:text-white active:scale-95"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="relative z-10 pl-5 pr-[18px] pb-5 pt-2 text-center">
        <h2 className="font-tech text-[1.35rem] font-black leading-[1.02] tracking-[0.06em] text-white sm:text-[1.5rem]">
          CREATOR STUDIO
        </h2>
        <p className="mt-1 font-tech text-[1.35rem] font-black leading-[1.02] tracking-[0.06em] sm:text-[1.5rem]">
          <span className="bg-[linear-gradient(90deg,#d946ef,#7c3aed,#22d3ee)] bg-clip-text text-transparent">
            IS NOW LIVE
          </span>
        </p>

        <p className="mx-auto mt-3 max-w-[22rem] text-sm font-semibold leading-relaxed text-white/85">
          Turn your idea into a playable game in minutes.
        </p>
        <p className="mx-auto mt-2 max-w-[22rem] text-sm font-semibold leading-relaxed text-white/85">
          Describe what you want to create and let Kult AI build it — no coding required.
        </p>
        <p className="mt-2 text-xs font-medium text-white/60">
          Publish it. Share it. Let the world play.
        </p>

        <button
          type="button"
          onClick={onPrimaryAction}
          className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-fuchsia-300/30 bg-[linear-gradient(90deg,#d946ef,#7c3aed)] px-5 font-tech text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_10px_26px_rgba(168,85,247,0.45),0_0_30px_rgba(217,70,239,0.25)] transition hover:brightness-110 active:scale-[0.99]"
        >
          {primaryLabel}
          <ArrowUpRight className="size-4 shrink-0" aria-hidden />
        </button>
      </div>
    </div>
  );
}
