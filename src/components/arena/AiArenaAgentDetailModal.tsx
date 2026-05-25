import { useQuery } from "@tanstack/react-query";
import { Copy, Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import type { AiArenaAgent, AiArenaLeaderboardEntry } from "@/types/aiArenaGateway";
import { Dialog } from "@/components/ui/dialog";
import {
  ArenaDialogBody,
  ArenaDialogContent,
  ArenaDialogDescription,
  ArenaDialogHeader,
  ArenaDialogTitle,
} from "@/components/ui/arena-dialog";
import { Button } from "@/components/ui/button";

export type AiArenaAgentDetailSeed = Partial<AiArenaAgent> & {
  rank?: number;
};

export type AiArenaAgentDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string | null;
  seed?: AiArenaAgentDetailSeed | AiArenaLeaderboardEntry | null;
};

function isAxiosLike(e: unknown): e is { response?: { status?: number; data?: { error?: string } } } {
  return typeof e === "object" && e !== null;
}

export function AiArenaAgentDetailModal({ open, onOpenChange, agentId, seed }: AiArenaAgentDetailModalProps) {
  const enabled = Boolean(open && agentId);

  const agentQ = useQuery({
    queryKey: ["aiArenaGateway", "agentDetail", agentId],
    queryFn: () => aiArenaGatewayApi.getAgentById(agentId!),
    enabled,
    retry: false,
  });

  const walletQ = useQuery({
    queryKey: ["aiArenaGateway", "agentDetailWallet", agentId],
    queryFn: () => aiArenaGatewayApi.getAgentWalletBalance(agentId!),
    enabled,
    retry: false,
  });

  const evolutionQ = useQuery({
    queryKey: ["aiArenaGateway", "agentDetailEvolution", agentId],
    queryFn: () => aiArenaGatewayApi.getAgentEvolution(agentId!),
    enabled,
    retry: false,
  });

  const rankQ = useQuery({
    queryKey: ["aiArenaGateway", "agentDetailRank", agentId],
    queryFn: () => aiArenaGatewayApi.getLeaderboardRankForAgent(agentId!),
    enabled,
    retry: false,
  });

  const profile = agentQ.data;
  const seedObj = seed as AiArenaLeaderboardEntry | AiArenaAgentDetailSeed | null | undefined;

  const displayName =
    profile?.name ??
    ("name" in (seedObj ?? {}) ? (seedObj as AiArenaLeaderboardEntry).name : undefined) ??
    (seedObj && "name" in seedObj ? (seedObj as AiArenaAgent).name : undefined) ??
    "Agent";

  const displayClan =
    profile?.clan ??
    ("clan" in (seedObj ?? {}) ? (seedObj as AiArenaLeaderboardEntry).clan : undefined) ??
    (seedObj && "clan" in seedObj ? (seedObj as AiArenaAgent).clan : undefined) ??
    "—";

  const displayElo =
    profile?.eloRating ??
    ("eloRating" in (seedObj ?? {}) ? (seedObj as AiArenaLeaderboardEntry).eloRating : undefined) ??
    (seedObj && "eloRating" in seedObj ? (seedObj as AiArenaAgent).eloRating : undefined);

  const displayWins =
    profile?.wins ??
    ("wins" in (seedObj ?? {}) ? (seedObj as AiArenaLeaderboardEntry).wins : undefined) ??
    (seedObj && "wins" in seedObj ? (seedObj as AiArenaAgent).wins : undefined);

  const displayRank =
    rankQ.data?.rank ??
    ("rank" in (seedObj ?? {}) ? (seedObj as AiArenaLeaderboardEntry).rank : undefined) ??
    (seedObj && "rank" in seedObj ? (seedObj as AiArenaAgentDetailSeed).rank : undefined);

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Could not copy");
    }
  };

  const walletErr =
    walletQ.isError && isAxiosLike(walletQ.error)
      ? String(walletQ.error.response?.data?.error ?? walletQ.error)
      : walletQ.isError
        ? "Wallet unavailable"
        : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ArenaDialogContent size="lg">
        <ArenaDialogHeader>
          <ArenaDialogTitle className="font-display text-left text-xl sm:text-2xl">{displayName}</ArenaDialogTitle>
          <ArenaDialogDescription className="text-left text-xs sm:text-sm">
            Agent ID: <span className="font-mono text-neon-cyan/90">{agentId ?? "—"}</span>
          </ArenaDialogDescription>
        </ArenaDialogHeader>

        <ArenaDialogBody>
          <div className="space-y-5 pr-1">
            {agentQ.isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading agent profile…
              </div>
            )}

            {agentQ.isError && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
                We could not load the full profile right now. Showing the summary we have below.
              </p>
            )}

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Rank" value={displayRank != null ? `#${displayRank}` : "—"} />
              <Stat label="ELO" value={displayElo != null ? String(displayElo) : "—"} />
              <Stat label="Wins" value={displayWins != null ? String(displayWins) : "—"} />
              <Stat label="Clan" value={String(displayClan)} />
            </section>

            {profile && (
              <section className="space-y-2 rounded-xl border border-white/10 bg-background/40 p-4 text-sm">
                <DetailRow label="Archetype" value={profile.archetype ?? "—"} />
                <DetailRow label="Stage" value={profile.evolutionStage ?? "—"} />
                <DetailRow label="Losses" value={profile.losses != null ? String(profile.losses) : "—"} />
                <DetailRow label="Arena NFT" value={profile.inftTokenId ?? "Pending mint"} />
                {profile.createdAt ? (
                  <DetailRow label="Created" value={new Date(profile.createdAt).toLocaleString()} />
                ) : null}
              </section>
            )}

            {profile?.traits && (
              <section className="rounded-xl border border-white/10 bg-background/40 p-4">
                <h4 className="mb-2 font-display text-xs font-bold tracking-wider text-neon-purple">Traits</h4>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                  {Object.entries(profile.traits).map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-2 font-mono text-[11px] text-muted-foreground">
                      <span className="truncate capitalize">{k}</span>
                      <span className="text-foreground">{v}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {evolutionQ.isSuccess && (
              <section className="rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-4 text-xs">
                <h4 className="mb-2 font-display text-[11px] font-bold tracking-wider text-neon-cyan">Evolution</h4>
                <p className="text-muted-foreground">
                  Stage <span className="text-foreground">{evolutionQ.data.currentStage}</span>. Total battles:{" "}
                  <span className="text-foreground">{evolutionQ.data.totalBattles}</span>. ELO:{" "}
                  <span className="text-foreground">{evolutionQ.data.eloRating}</span>. Eligible:{" "}
                  {evolutionQ.data.eligibleForEvolution ? "yes" : "no"}
                </p>
              </section>
            )}

            {profile && (() => {
              const meta = profile.metadata as Record<string, unknown> | null | undefined;
              const metadataHash = (profile.metadataRootHash ?? meta?.metadataRootHash) as string | null | undefined;
              const avatarHash = (profile.avatarRootHash ?? meta?.avatarRootHash) as string | null | undefined;
              if (!metadataHash && !avatarHash) return null;
              return (
                <section className="rounded-xl border border-[#9a35ff]/25 bg-[#9a35ff]/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-[#9a35ff]" />
                    <h4 className="font-display text-[11px] font-bold tracking-wider text-[#9a35ff]">0G Storage</h4>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    {metadataHash && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="shrink-0 text-white/40">Metadata root hash</span>
                        <button
                          type="button"
                          className="flex items-center gap-1 font-mono text-neon-cyan/80 hover:text-neon-cyan transition"
                          onClick={() => void copyText("Metadata root hash", metadataHash)}
                          title="Click to copy"
                        >
                          <span className="break-all">{metadataHash.slice(0, 20)}…</span>
                          <Copy className="h-2.5 w-2.5 shrink-0" />
                        </button>
                        <a
                          href={`https://storagescan.0g.ai/tx/${metadataHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#9a35ff]/60 hover:text-[#9a35ff] transition underline"
                        >
                          view on 0G scan
                        </a>
                      </div>
                    )}
                    {avatarHash && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="shrink-0 text-white/40">Avatar root hash</span>
                        <button
                          type="button"
                          className="flex items-center gap-1 font-mono text-neon-cyan/80 hover:text-neon-cyan transition"
                          onClick={() => void copyText("Avatar root hash", avatarHash)}
                          title="Click to copy"
                        >
                          <span className="break-all">{avatarHash.slice(0, 20)}…</span>
                          <Copy className="h-2.5 w-2.5 shrink-0" />
                        </button>
                        <a
                          href={`https://storagescan.0g.ai/tx/${avatarHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#9a35ff]/60 hover:text-[#9a35ff] transition underline"
                        >
                          view on 0G scan
                        </a>
                      </div>
                    )}
                    <p className="mt-1 text-[10px] text-white/30">
                      Agent metadata and avatar are permanently stored on 0G Storage Network.
                    </p>
                  </div>
                </section>
              );
            })()}

            <section className="rounded-xl border border-white/10 bg-background/40 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="font-display text-xs font-bold tracking-wider text-neon-cyan">Custodial wallet</h4>
                {walletQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
              </div>
              {walletQ.isSuccess ? (
                <div className="space-y-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-all font-mono text-[11px] text-foreground">
                      {walletQ.data.wallet.solanaAddress}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 shrink-0 gap-1 px-2 text-[10px]"
                      onClick={() => void copyText("Solana address", walletQ.data.wallet.solanaAddress)}
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <Stat label="$ARENA" value={String(walletQ.data.wallet.balanceArena ?? 0)} />
                    <Stat label="SOL" value={String(walletQ.data.wallet.balanceSol ?? 0)} />
                    <Stat label="Frozen" value={walletQ.data.wallet.isFrozen ? "Yes" : "No"} />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    This wallet powers deposits, rewards, and withdrawals for the agent.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {walletErr ?? "Wallet details appear once your session has access to this agent."}
                </p>
              )}
            </section>
          </div>
        </ArenaDialogBody>
      </ArenaDialogContent>
    </Dialog>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-background/30 px-3 py-2">
      <div className="text-[9px] font-display tracking-widest text-muted-foreground">{label}</div>
      <div className="truncate font-mono text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-white/5 py-1 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
