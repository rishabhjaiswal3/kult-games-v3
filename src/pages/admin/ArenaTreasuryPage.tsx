import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { arenaChainApi } from "@/api/arenaChainApi";

function formatArena(value?: string | null) {
  const num = value == null ? NaN : Number.parseFloat(value);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function StatCard({ label, value, accent = "text-neon-cyan" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="arena-panel p-4">
      <div className={`font-tech text-[10px] uppercase tracking-[0.18em] ${accent}`}>{label}</div>
      <div className="mt-2 font-display text-2xl font-black tabular-nums text-foreground">{value}</div>
    </div>
  );
}

export default function ArenaTreasuryPage() {
  const treasuryQ = useQuery({
    queryKey: ["arenaChain", "admin", "treasury"],
    queryFn: () => arenaChainApi.getTreasury(),
    retry: false,
  });

  const historyQ = useQuery({
    queryKey: ["arenaChain", "admin", "treasuryHistory"],
    queryFn: () => arenaChainApi.getTreasuryHistory(50),
    retry: false,
  });

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <div className="font-tech text-[10px] uppercase tracking-[0.24em] text-neon-purple">Admin · $ARENA Economy</div>
          <h1 className="mt-1 font-display text-3xl font-black uppercase tracking-tight text-foreground">
            Treasury Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live treasury state and historical snapshots for the $ARENA economy on 0G Chain.
          </p>
        </header>

        <section className="arena-panel p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="font-tech text-[10px] uppercase tracking-[0.18em] text-neon-cyan">Current Treasury</div>
            {treasuryQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-white/40" /> : null}
          </div>

          {treasuryQ.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl border border-white/8 bg-white/5" />
              ))}
            </div>
          ) : treasuryQ.isError ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90">
              Treasury data is not available right now (GET /v1/arena/treasury unreachable or not yet implemented).
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Balance" value={formatArena(treasuryQ.data?.balance)} accent="text-neon-cyan" />
              <StatCard label="Distributed" value={formatArena(treasuryQ.data?.distributed)} accent="text-neon-purple" />
              <StatCard label="Remaining" value={formatArena(treasuryQ.data?.remaining)} accent="text-emerald-300" />
              <StatCard label="Total Commissions" value={formatArena(treasuryQ.data?.totalCommissions)} accent="text-amber-300" />
              <StatCard label="Total Rewards Paid" value={formatArena(treasuryQ.data?.totalRewardsPaid)} accent="text-sky-300" />
            </div>
          )}
        </section>

        <section className="arena-panel p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="font-tech text-[10px] uppercase tracking-[0.18em] text-neon-purple">
              Treasury History
            </div>
            {historyQ.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-white/40" /> : null}
          </div>

          {historyQ.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl border border-white/8 bg-white/5" />
              ))}
            </div>
          ) : historyQ.isError ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-4 text-sm text-amber-100/90">
              Treasury history is not available right now (GET /v1/arena/explorer/treasury-history unreachable or not
              yet implemented).
            </div>
          ) : historyQ.data?.snapshots?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-tech uppercase tracking-[0.14em] text-white/45">
                    <th className="py-2 pr-4">Captured At</th>
                    <th className="py-2 pr-4">Balance</th>
                    <th className="py-2 pr-4">Distributed</th>
                    <th className="py-2 pr-4">Commissions</th>
                    <th className="py-2 pr-4">Rewards Paid</th>
                    <th className="py-2 pr-4">Circulating Supply</th>
                  </tr>
                </thead>
                <tbody>
                  {historyQ.data.snapshots.map((snap, i) => (
                    <tr key={`${snap.capturedAt}-${i}`} className="border-b border-white/5 text-foreground/90">
                      <td className="py-2 pr-4 font-mono text-xs text-white/60">{formatDate(snap.capturedAt)}</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">{formatArena(snap.balance)}</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">{formatArena(snap.totalDistributed)}</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">{formatArena(snap.totalCommissions)}</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">{formatArena(snap.totalRewardsPaid)}</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">{formatArena(snap.circulatingSupply)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-sm text-muted-foreground">
              No treasury snapshots recorded yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
