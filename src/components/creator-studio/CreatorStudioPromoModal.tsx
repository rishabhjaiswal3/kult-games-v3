import { X } from "lucide-react";

import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import backgroundCreatorModel from "@/assets/background_Creator_model.png";
import { cn } from "@/lib/utils";

const promoGradient =
  "linear-gradient(to top, #06050b 0%, #0e0c16 38%, #181528 72%, #6d668f 100%)";

export function CreatorStudioPromoModal({
  open,
  onOpenChange,
  onPrimaryAction,
  primaryLabel = "Create Now",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrimaryAction: () => void;
  primaryLabel?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        overlayClassName="bg-black/85 backdrop-blur-[2px]"
        className={cn(
          "fixed left-1/2 top-1/2 z-[200] w-[min(98vw,440px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[28px] border border-white/15 bg-transparent p-0 shadow-[0_24px_90px_rgba(0,0,0,0.72)]",
        )}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: promoGradient }}
          aria-hidden
        />

        <div className="relative overflow-hidden pb-2 pt-5">
          <img
            src={backgroundCreatorModel}
            alt=""
            aria-hidden="true"
            className="relative z-10 left-1/2 mx-auto block h-auto w-[112%] max-w-none -translate-x-[calc(50%+4px)] select-none object-contain object-center drop-shadow-[0_18px_40px_rgba(124,58,237,0.35)]"
            draggable={false}
          />

          <DialogClose
            aria-label="Close"
            className="absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full border border-white/15 bg-black/30 text-white/85 shadow-[0_0_22px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-black/45 hover:text-white active:scale-95"
          >
            <X className="size-4" />
          </DialogClose>
        </div>

        <div className="relative z-10 px-6 pb-6 pt-4 text-center">
          <div className="font-tech text-[28px] font-black leading-[1.02] tracking-[0.06em] text-white">
            CREATOR STUDIO
          </div>
          <div className="mt-1 font-tech text-[28px] font-black leading-[1.02] tracking-[0.06em]">
            <span className="bg-[linear-gradient(90deg,#d946ef,#7c3aed,#22d3ee)] bg-clip-text text-transparent">
              IS NOW LIVE!
            </span>
          </div>

          <p className="mt-3 text-sm font-semibold text-white/80">
            Create your own game with <span className="text-fuchsia-200">AI</span>.
          </p>
          <p className="mt-1 text-xs font-semibold text-white/65">Tap Creator Studio below</p>

          <button
            type="button"
            onClick={onPrimaryAction}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl border border-fuchsia-300/30 bg-[linear-gradient(90deg,#d946ef,#7c3aed)] px-5 font-tech text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_10px_26px_rgba(168,85,247,0.45),0_0_30px_rgba(217,70,239,0.25)] transition hover:brightness-110 active:scale-[0.99]"
          >
            {primaryLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
