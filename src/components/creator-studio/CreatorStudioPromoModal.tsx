import { CreatorStudioPromoContent } from "@/components/creator-studio/CreatorStudioPromoContent";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function CreatorStudioPromoModal({
  open,
  onOpenChange,
  onPrimaryAction,
  primaryLabel = "Open Creator Studio",
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
          "fixed left-1/2 top-1/2 z-[200] w-[min(98vw,440px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-transparent p-0 shadow-[0_24px_90px_rgba(0,0,0,0.72)]",
        )}
      >
        <CreatorStudioPromoContent
          onPrimaryAction={onPrimaryAction}
          primaryLabel={primaryLabel}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
