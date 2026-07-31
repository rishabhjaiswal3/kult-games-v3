import { CreatorStudioPromoContent } from "@/components/creator-studio/CreatorStudioPromoContent";
import { cn } from "@/lib/utils";

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
        "relative overflow-hidden rounded-2xl border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
    >
      <CreatorStudioPromoContent onPrimaryAction={onPrimaryAction} />
    </section>
  );
}
