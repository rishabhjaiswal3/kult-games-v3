import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAddress, isAddress } from "viem";
import { ExternalLink, RefreshCw } from "lucide-react";
import { aiWarzoneApi } from "@/api/aiWarzoneApi";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

function shortAddr(a: string) {
  if (a.length < 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function formatWhen(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

const WarzoneAgentTracker = () => {
  const { walletAddress } = useAuth();
  const [activeWallet, setActiveWallet] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress || !isAddress(walletAddress)) return;
    try {
      const checksummed = getAddress(walletAddress);
      setActiveWallet(checksummed);
    } catch {}
  }, [walletAddress]);

  const behaviorQ = useQuery({
    queryKey: ["aiWarzone", "behaviorStatus", activeWallet],
    queryFn: () => aiWarzoneApi.getBehaviorStatus(activeWallet!),
    enabled: !!activeWallet,
    staleTime: 30_000,
  });

  const zeroGQ = useQuery({
    queryKey: ["aiWarzone", "zeroGStatus", activeWallet],
    queryFn: () => aiWarzoneApi.getZeroGStatus(activeWallet!),
    enabled: !!activeWallet,
    staleTime: 30_000,
  });

  const backendQ = useQuery({
    queryKey: ["aiWarzone", "zeroGBackendWallet"],
    queryFn: () => aiWarzoneApi.getZeroGBackendWallet(),
    staleTime: 60_000,
  });

  const refetchAll = useCallback(() => {
    void behaviorQ.refetch();
    void zeroGQ.refetch();
    void backendQ.refetch();
  }, [behaviorQ, zeroGQ, backendQ]);

  const behavior = behaviorQ.data;
  const zg = zeroGQ.data;
  const backend = backendQ.data;

  const trainingPct = useMemo(() => {
    if (!behavior) return 0;
    const { sampleCount, samplesNeeded } = behavior;
    const denom = sampleCount + samplesNeeded;
    if (denom <= 0) return 0;
    return Math.min(100, Math.round((sampleCount / denom) * 100));
  }, [behavior]);

  const modelBadge = useMemo(() => {
    const s = behavior?.modelStatus ?? "none";
    if (s === "ready") return { label: "READY", className: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" };
    if (s === "training") return { label: "TRAINING", className: "border-amber-500/50 text-amber-300 bg-amber-500/10" };
    if (s === "error") return { label: "ERROR", className: "border-red-500/50 text-red-400 bg-red-500/10" };
    return { label: "IDLE", className: "border-border/60 text-muted-foreground bg-card/40" };
  }, [behavior]);

  const storageBadge = useMemo(() => {
    if (zg?.onZeroG) return { label: "ON 0G CHAIN", className: "border-sky-500/50 text-sky-300 bg-sky-500/10" };
    if (zg?.storageType === "local") return { label: "LOCAL", className: "border-violet-500/50 text-violet-300 bg-violet-500/10" };
    return { label: zg?.modelStatus?.toUpperCase() ?? "—", className: "border-border/60 text-muted-foreground bg-card/40" };
  }, [zg]);

  const apisOk = behaviorQ.isSuccess && zeroGQ.isSuccess;
  const loading = behaviorQ.isFetching || zeroGQ.isFetching;

  return (
    <section id="warzone-agent-tracker" className="relative scroll-mt-24 border-b border-white/[0.06] py-10 md:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(195 100% 50% / 0.05), transparent), radial-gradient(ellipse 50% 40% at 90% 30%, hsl(270 80% 65% / 0.04), transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 neural-grid opacity-[0.07]" aria-hidden />
      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/90">
              <span className="h-px w-8 bg-gradient-to-r from-neon-cyan/80 to-transparent" />
              Warzone AI
            </p>
            <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Autonomous{" "}
              <span className="gradient-text">agent tracker</span>
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Neural training, 0G storage, and ops wallet in one view.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
                apisOk ? "border-emerald-500/40 text-emerald-400" : "border-border/50 text-muted-foreground"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${apisOk ? "bg-emerald-400 shadow-[0_0_8px_hsl(150_80%_50%)]" : "bg-muted-foreground"}`} />
              {apisOk ? "ONLINE" : loading ? "SYNCING" : "IDLE"}
            </span>
          </div>
        </div>

        <div className="glass-panel mb-8 overflow-hidden rounded-[24px] p-5 sm:p-6">
          <p className="mb-3 text-[10px] font-mono uppercase tracking-[0.22em] text-neon-cyan/85">Session wallet</p>
          {activeWallet ? (
            <div className="rounded-2xl border border-neon-cyan/20 bg-neon-cyan/[0.06] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">Connected wallet</p>
                  <p className="mt-2 break-all font-mono text-sm text-foreground sm:text-base">{activeWallet}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-mono uppercase text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_hsl(150_80%_50%)]" />
                  Active
                </span>
              </div>
              <p className="mt-3 text-[11px] font-mono text-neon-cyan/90">Agent ID: {shortAddr(activeWallet)}</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-background/55 p-4 text-sm text-muted-foreground">
              Connect your wallet to view autonomous agent telemetry.
            </div>
          )}
        </div>

        {!activeWallet && (
          <p className="text-sm text-muted-foreground text-center py-8">Connect a wallet to see live agent status.</p>
        )}

        {activeWallet && (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 scrollbar-none touch-pan-x md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 md:touch-auto md:[&>div:last-child]:col-span-2">
            {/* Neural / training */}
            <div className="relative w-[min(100%,calc(100vw-2rem))] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-card/40 p-4 shadow-[0_12px_40px_hsl(220_60%_2%/0.2)] backdrop-blur-sm sm:p-5 md:w-auto md:min-w-0 md:snap-none">
              <span
                className={`absolute right-3 top-3 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase ${modelBadge.className}`}
              >
                {modelBadge.label}
              </span>
              <p className="mb-3 pr-24 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Neural training status</p>
              {behaviorQ.isLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-full max-w-xs" />
                  <Skeleton className="h-2 w-full" />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl col-span-2" />
                  </div>
                  <Skeleton className="h-14 rounded-lg" />
                </div>
              ) : behaviorQ.isError ? (
                <p className="text-sm text-red-400/90">Could not load behavior status.</p>
              ) : behavior ? (
                <>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Agent wallet</p>
                  <p className="text-xs font-mono text-foreground break-all mb-4">{behavior.wallet}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Training data</p>
                  <div className="flex items-center gap-3 mb-1">
                    <Progress value={trainingPct} className="h-2 flex-1 bg-border/40" />
                    <span className="text-[11px] font-mono text-neon-cyan/90 shrink-0">
                      {behavior.sampleCount} / {behavior.sampleCount + behavior.samplesNeeded} ({trainingPct}%)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[10px] uppercase">Samples collected</span>
                      <p className="font-mono text-foreground">{behavior.sampleCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-[10px] uppercase">Ready to train</span>
                      <p className="font-mono text-emerald-400">{behavior.readyToTrain ? "YES" : "NO"}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground text-[10px] uppercase">Trained at</span>
                      <p className="font-mono text-foreground">{formatWhen(behavior.trainedAt)}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                    <p className="text-[10px] uppercase text-muted-foreground mb-0.5">Model status</p>
                    <p className="text-sm font-semibold text-emerald-400 uppercase">{behavior.modelStatus}</p>
                    {behavior.errorMsg && <p className="text-[11px] text-red-400/90 mt-1">{behavior.errorMsg}</p>}
                  </div>
                </>
              ) : null}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => void behaviorQ.refetch()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neon-cyan/35 px-3 py-2 text-xs font-semibold text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* 0G storage */}
            <div className="relative w-[min(100%,calc(100vw-2rem))] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-card/40 p-4 shadow-[0_12px_40px_hsl(220_60%_2%/0.2)] backdrop-blur-sm sm:p-5 md:w-auto md:min-w-0 md:snap-none">
              <span
                className={`absolute right-3 top-3 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase ${storageBadge.className}`}
              >
                {storageBadge.label}
              </span>
              <p className="mb-3 pr-24 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Decentralized storage</p>
              {zeroGQ.isLoading ? (
                <div className="space-y-3 py-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
              ) : zeroGQ.isError ? (
                <p className="text-sm text-red-400/90">Could not load 0G status.</p>
              ) : zg ? (
                <>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Network</p>
                  <p className="text-xs font-mono text-foreground mb-3">{zg.network ?? "—"}</p>
                  <div className="mb-3 rounded-lg border border-neon-cyan/20 bg-neon-cyan/[0.06] px-3 py-2">
                    <p className="text-[10px] uppercase text-muted-foreground">Storage type</p>
                    <p className="text-sm font-semibold text-neon-cyan">{zg.storageType ?? zg.message ?? "—"}</p>
                  </div>
                  <p className="text-[10px] uppercase text-muted-foreground">On-chain verified</p>
                  <p className="text-sm font-mono text-emerald-400 mb-3">{zg.onZeroG ? "YES ✓" : "NO"}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Trained at</p>
                  <p className="text-xs font-mono mb-3">{formatWhen(zg.trainedAt)}</p>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">File hash (0G)</p>
                  <p className="text-[11px] font-mono break-all rounded-lg border border-border/50 bg-background/50 p-2">{zg.fileHash ?? "—"}</p>
                  {zg.localNote && <p className="text-[11px] text-muted-foreground mt-2">{zg.localNote}</p>}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {zg.explorerUrl && (
                      <a
                        href={zg.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[11px] text-neon-cyan hover:bg-neon-cyan/10"
                      >
                        <ExternalLink className="w-3 h-3" /> 0G Explorer
                      </a>
                    )}
                    {zg.downloadUrl && (
                      <a
                        href={zg.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[11px] text-neon-cyan hover:bg-neon-cyan/10"
                      >
                        <ExternalLink className="w-3 h-3" /> Download
                      </a>
                    )}
                    {zg.indexerCheckUrl && (
                      <a
                        href={zg.indexerCheckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[11px] text-neon-cyan hover:bg-neon-cyan/10"
                      >
                        <ExternalLink className="w-3 h-3" /> Indexer
                      </a>
                    )}
                    {behavior?.zeroGExplorer && !zg.explorerUrl && (
                      <a
                        href={behavior.zeroGExplorer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-3 py-1.5 text-[11px] text-neon-cyan hover:bg-neon-cyan/10"
                      >
                        <ExternalLink className="w-3 h-3" /> Verify on 0G
                      </a>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Server health */}
            <div className="w-[min(100%,calc(100vw-2rem))] shrink-0 snap-center rounded-2xl border border-white/10 bg-card/40 p-4 shadow-[0_12px_40px_hsl(220_60%_2%/0.2)] backdrop-blur-sm sm:p-5 md:w-auto md:min-w-0 md:snap-none">
              <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-3">Service health</p>
              <div
                className={`rounded-xl border px-4 py-3 mb-4 ${
                  apisOk ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-200" : "border-border/50 bg-card/40 text-muted-foreground"
                }`}
              >
                <p className="text-sm font-bold">{apisOk ? "All agent APIs reachable" : "Waiting for successful responses"}</p>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Behavior API</span>
                  <span className={behaviorQ.isSuccess ? "text-emerald-400" : behaviorQ.isError ? "text-red-400" : "text-muted-foreground"}>
                    {behaviorQ.isSuccess ? "OK" : behaviorQ.isError ? "FAIL" : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">0G status API</span>
                  <span className={zeroGQ.isSuccess ? "text-emerald-400" : zeroGQ.isError ? "text-red-400" : "text-muted-foreground"}>
                    {zeroGQ.isSuccess ? "OK" : zeroGQ.isError ? "FAIL" : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Backend wallet API</span>
                  <span className={backendQ.isSuccess ? "text-emerald-400" : backendQ.isError ? "text-red-400" : "text-muted-foreground"}>
                    {backendQ.isSuccess ? "OK" : backendQ.isError ? "FAIL" : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-2 pt-2 border-t border-border/30">
                  <span className="text-muted-foreground">Last data refresh</span>
                  <span className="text-foreground text-right">
                    {(() => {
                      const t = Math.max(behaviorQ.dataUpdatedAt, zeroGQ.dataUpdatedAt);
                      return t ? new Date(t).toLocaleString() : "—";
                    })()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={refetchAll}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border/50 text-xs text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh all
              </button>
            </div>
          </div>
        )}

        {activeWallet && (
          <p className="mt-2 text-center text-[10px] font-mono uppercase tracking-wider text-muted-foreground md:hidden">
            Swipe sideways for more panels
          </p>
        )}
      </div>
    </section>
  );
};

export default WarzoneAgentTracker;
