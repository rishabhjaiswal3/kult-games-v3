/** Compact “Powered by 0G” mark for hub sidebar footer. */
export function ZeroGBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-neon-cyan/25 bg-neon-cyan/5 px-3 py-3 ${className}`}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-neon-cyan/40 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/15 font-display text-sm font-black tracking-tight text-neon-cyan"
        aria-hidden
      >
        0G
      </div>
      <div className="min-w-0">
        <p className="font-display text-[11px] font-bold tracking-wide text-foreground">Powered by 0G</p>
        <p className="text-[10px] text-muted-foreground">AI Infrastructure</p>
      </div>
    </div>
  );
}
