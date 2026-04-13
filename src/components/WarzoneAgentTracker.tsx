import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAddress, isAddress } from "viem";
import { ExternalLink, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { aiWarzoneApi } from "@/api/aiWarzoneApi";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

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
  const [draft, setDraft] = useState("");
  const [activeWallet, setActiveWallet] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress || !isAddress(walletAddress)) return;
    try {
      const checksummed = getAddress(walletAddress);
      setDraft(checksummed);
      setActiveWallet(checksummed);
    } catch {
      setDraft(walletAddress);
    }
  }, [walletAddress]);

  const scan = useCallback(() => {
    const raw = draft.trim();
    if (!raw) {
      toast.error("Enter a wallet address");
      return;
    }
    if (!isAddress(raw)) {
      toast.error("Invalid Ethereum address");
      return;
    }
    try {
      setActiveWallet(getAddress(raw));
    } catch {
      toast.error("Invalid Ethereum address");
    }
  }, [draft]);

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
    <section className="relative py-8 md:py-10 border-b border-border/30">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-mono tracking-[0.28em] text-sky-400/90 uppercase">Warzone AI</p>
            <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-foreground mt-1">
              Autonomous agent tracker
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                apisOk ? "border-emerald-500/40 text-emerald-400" : "border-border/50 text-muted-foreground"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${apisOk ? "bg-emerald-400 shadow-[0_0_8px_hsl(150_80%_50%)]" : "bg-muted-foreground"}`} />
              {apisOk ? "ONLINE" : loading ? "SYNCING" : "IDLE"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-500/20 bg-card p-4 sm:p-5 mb-6">
          <p className="text-[10px] font-mono tracking-[0.2em] text-sky-400/80 uppercase mb-3">Agent lookup</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && scan()}
              placeholder="0x…"
              className="flex-1 min-w-0 rounded-xl border border-border/50 bg-background/60 px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              spellCheck={false}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={scan}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm tracking-wide text-background bg-sky-500 hover:bg-sky-400 transition-colors shrink-0"
            >
              <Search className="w-4 h-4" />
              Scan agent
            </button>
          </div>
          {walletAddress && isAddress(walletAddress) && (
            <p className="mt-2 text-[11px] font-mono text-emerald-500/90">
              Auto-detected from session: {shortAddr(getAddress(walletAddress))}
            </p>
          )}
        </div>

        {!activeWallet && (
          <p className="text-sm text-muted-foreground text-center py-8">Connect a wallet or enter an address and scan.</p>
        )}

        {activeWallet && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Neural / training */}
            <div className="rounded-2xl border border-border/40 bg-card/30 p-4 sm:p-5 relative overflow-hidden">
              <span
                className={`absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase ${modelBadge.className}`}
              >
                {modelBadge.label}
              </span>
              <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-3 pr-24">Neural training status</p>
              {behaviorQ.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-6">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
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
                    <span className="text-[11px] font-mono text-sky-300 shrink-0">
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
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-sky-500/40 text-sky-300 text-xs font-semibold hover:bg-sky-500/10"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* 0G storage */}
            <div className="rounded-2xl border border-border/40 bg-card/30 p-4 sm:p-5 relative overflow-hidden">
              <span
                className={`absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase ${storageBadge.className}`}
              >
                {storageBadge.label}
              </span>
              <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mb-3 pr-24">Decentralized storage</p>
              {zeroGQ.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-6">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : zeroGQ.isError ? (
                <p className="text-sm text-red-400/90">Could not load 0G status.</p>
              ) : zg ? (
                <>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Network</p>
                  <p className="text-xs font-mono text-foreground mb-3">{zg.network ?? "—"}</p>
                  <div className="rounded-lg border border-sky-500/25 bg-sky-500/5 px-3 py-2 mb-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Storage type</p>
                    <p className="text-sm font-semibold text-sky-300">{zg.storageType ?? zg.message ?? "—"}</p>
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/50 text-[11px] text-sky-300 hover:bg-sky-500/10"
                      >
                        <ExternalLink className="w-3 h-3" /> 0G Explorer
                      </a>
                    )}
                    {zg.downloadUrl && (
                      <a
                        href={zg.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/50 text-[11px] text-sky-300 hover:bg-sky-500/10"
                      >
                        <ExternalLink className="w-3 h-3" /> Download
                      </a>
                    )}
                    {zg.indexerCheckUrl && (
                      <a
                        href={zg.indexerCheckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/50 text-[11px] text-sky-300 hover:bg-sky-500/10"
                      >
                        <ExternalLink className="w-3 h-3" /> Indexer
                      </a>
                    )}
                    {behavior?.zeroGExplorer && !zg.explorerUrl && (
                      <a
                        href={behavior.zeroGExplorer}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/50 text-[11px] text-sky-300 hover:bg-sky-500/10"
                      >
                        <ExternalLink className="w-3 h-3" /> Verify on 0G
                      </a>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Backend wallet */}
            <div className="rounded-2xl border border-border/40 bg-card/30 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase">Backend 0G wallet</p>
                {backend && (
                  <span
                    className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase ${
                      backend.funded
                        ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                        : "border-amber-500/50 text-amber-300 bg-amber-500/10"
                    }`}
                  >
                    {backend.funded ? "FUNDED" : "LOW"}
                  </span>
                )}
              </div>
              {backendQ.isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-6">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : backendQ.isError ? (
                <p className="text-sm text-red-400/90">Could not load backend wallet.</p>
              ) : backend ? (
                <>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Wallet address</p>
                  <p className="text-xs font-mono break-all mb-3">{backend.address}</p>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">A0GI balance</p>
                  <p className="text-lg font-mono text-emerald-400 mb-3">{backend.balanceEth} A0GI</p>
                  <p className="text-[10px] uppercase text-muted-foreground mb-1">Network</p>
                  <p className="text-xs font-mono mb-3">{backend.network}</p>
                  <div
                    className={`rounded-lg border px-3 py-2 text-xs ${backend.funded ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-200/90" : "border-amber-500/30 bg-amber-500/5 text-amber-200/90"}`}
                  >
                    {backend.tip}
                  </div>
                </>
              ) : null}
            </div>

            {/* Server health */}
            <div className="rounded-2xl border border-border/40 bg-card/30 p-4 sm:p-5">
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
      </div>
    </section>
  );
};

export default WarzoneAgentTracker;
