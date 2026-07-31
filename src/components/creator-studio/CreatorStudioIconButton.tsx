import { Gamepad2 } from "lucide-react";

import { useAccess } from "@/contexts/AccessContext";
import { useCreatorStudioLaunch } from "@/hooks/useCreatorStudioLaunch";
import { cn } from "@/lib/utils";

export function CreatorStudioIconButton({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { canUse } = useAccess();
  const { launch, launching } = useCreatorStudioLaunch();

  if (!canUse("creator_studio")) return null;

  return (
    <button
      type="button"
      onClick={() => void launch()}
      disabled={launching}
      aria-label="Open Creator Studio"
      title="Creator Studio"
      data-tour="creator-studio-shortcut"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-fuchsia-400/25 bg-[#160b2e] font-tech text-[10px] font-black uppercase tracking-[0.12em] text-fuchsia-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_10px_rgba(88,28,135,0.35)] transition hover:border-fuchsia-300/50 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-70",
        showLabel ? "h-8 px-2.5" : "grid size-9 place-items-center",
        className,
      )}
    >
      <Gamepad2 className={cn("shrink-0 text-fuchsia-200", showLabel ? "size-3.5" : "size-4")} />
      {showLabel ? <span className="hidden min-[430px]:inline">Studio</span> : null}
    </button>
  );
}
