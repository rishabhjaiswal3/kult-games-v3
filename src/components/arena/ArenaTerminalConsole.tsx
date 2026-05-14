import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Terminal } from "lucide-react";
import { aiArenaGatewayApi } from "@/api/aiArenaGatewayApi";
import { useMyArenaAgents } from "@/hooks/useMyArenaAgents";
import { useAiArenaGatewaySession } from "@/hooks/useAiArenaGatewaySession";
import { ArenaTerminalSkeleton } from "@/components/skeleton";
import { cn } from "@/lib/utils";

type LogLine = { id: string; ts: string; level: "info" | "ok" | "warn" | "battle"; text: string };

function formatTs(d = new Date()) {
  return d.toISOString().replace("T", " ").slice(11, 19);
}

function levelClass(level: LogLine["level"]) {
  if (level === "ok") return "text-neon-green";
  if (level === "warn") return "text-amber-300";
  if (level === "battle") return "text-neon-cyan";
  return "text-muted-foreground";
}

type ArenaTerminalConsoleProps = {
  battleId?: string | null;
  className?: string;
};

export function ArenaTerminalConsole({ battleId, className }: ArenaTerminalConsoleProps) {
  const { isAiArenaReady } = useAiArenaGatewaySession();
  const myAgentsQ = useMyArenaAgents(1, 10);
  const primaryAgentId = myAgentsQ.data?.agents?.[0]?.id ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [localLines, setLocalLines] = useState<LogLine[]>([
    { id: "boot", ts: formatTs(), level: "info", text: "AI Arena terminal — streaming gateway activity" },
  ]);

  const txQ = useQuery({
    queryKey: ["aiArenaGateway", "terminalTx", primaryAgentId],
    queryFn: () => aiArenaGatewayApi.getAgentTransactions(primaryAgentId!, 1, 25),
    enabled: isAiArenaReady && !!primaryAgentId,
    refetchInterval: 15_000,
    retry: 1,
  });

  const battleQ = useQuery({
    queryKey: ["aiArenaGateway", "terminalBattle", battleId],
    queryFn: () => aiArenaGatewayApi.getBattle(battleId!),
    enabled: isAiArenaReady && !!battleId,
    refetchInterval: battleId ? 4_000 : false,
    retry: 1,
  });

  const replayQ = useQuery({
    queryKey: ["aiArenaGateway", "terminalReplay", battleId],
    queryFn: () => aiArenaGatewayApi.getReplay(battleId!),
    enabled: isAiArenaReady && !!battleId && battleQ.data?.battle?.status === "COMPLETED",
    retry: 1,
  });

  const mergedLines = useMemo(() => {
    const lines: LogLine[] = [...localLines];

    for (const tx of txQ.data?.transactions ?? []) {
      const id = tx.id ?? `${tx.type}-${tx.createdAt}`;
      lines.push({
        id: `tx-${id}`,
        ts: tx.createdAt ? formatTs(new Date(tx.createdAt)) : formatTs(),
        level: tx.status === "FAILED" ? "warn" : "ok",
        text: `[wallet] ${tx.type ?? "TX"} ${tx.amount ?? "?"} ${tx.currency ?? "ARENA"} — ${tx.status ?? "ok"}`,
      });
    }

    const battle = battleQ.data?.battle;
    if (battle) {
      lines.push({
        id: `battle-status-${battle.id}`,
        ts: formatTs(),
        level: "battle",
        text: `[battle] ${battle.id.slice(0, 8)}… status=${battle.status}`,
      });
      const resultLog = battle.result?.log;
      if (Array.isArray(resultLog)) {
        resultLog.slice(-12).forEach((row, i) => {
          lines.push({
            id: `blog-${battle.id}-${i}`,
            ts: formatTs(),
            level: "battle",
            text: typeof row === "string" ? row : JSON.stringify(row),
          });
        });
      }
    }

    const actions = replayQ.data?.replay?.actionLog ?? [];
    actions.slice(-16).forEach((row, i) => {
      lines.push({
        id: `replay-${battleId}-${i}`,
        ts: formatTs(),
        level: "battle",
        text: `[tick ${row.tick ?? "?"}] ${row.agentId?.slice(0, 8) ?? "?"} → ${typeof row.action === "string" ? row.action : JSON.stringify(row.action ?? {})}`,
      });
    });

    return lines.slice(-80);
  }, [localLines, txQ.data, battleQ.data, replayQ.data, battleId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [mergedLines.length]);

  useEffect(() => {
    if (!battleId) return;
    setLocalLines((prev) => [
      ...prev,
      { id: `match-${battleId}`, ts: formatTs(), level: "ok", text: `[matchmaking] Battle linked — ${battleId.slice(0, 12)}…` },
    ]);
  }, [battleId]);

  if (isAiArenaReady && myAgentsQ.isLoading && !myAgentsQ.data?.agents?.length) {
    return (
      <section className={cn("scroll-mt-24", className)}>
        <ArenaTerminalSkeleton />
      </section>
    );
  }

  return (
    <section className={cn("scroll-mt-24", className)}>
      <div className="overflow-hidden rounded-2xl border border-neon-green/20 bg-[hsl(150_20%_4%/0.95)] shadow-[inset_0_0_60px_hsl(150_60%_20%/0.06)]">
        <div className="flex items-center gap-2 border-b border-neon-green/15 bg-[hsl(150_25%_6%)] px-4 py-2.5">
          <Terminal className="h-4 w-4 text-neon-green" />
          <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-neon-green">ARENA_TERMINAL</span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-neon-green" />
            <span className="font-mono text-[9px] text-neon-green/80">LIVE</span>
          </span>
        </div>
        <div
          ref={scrollRef}
          className="max-h-[320px] overflow-y-auto p-4 font-mono text-[11px] leading-relaxed sm:max-h-[380px] sm:text-xs [scrollbar-width:thin]"
        >
          {mergedLines.map((line) => (
            <div key={line.id} className="mb-1 flex gap-2">
              <span className="shrink-0 text-neon-green/50">{line.ts}</span>
              <span className={levelClass(line.level)}>{line.text}</span>
            </div>
          ))}
          {!isAiArenaReady ? (
            <p className="text-amber-300/90">Connect wallet & exchange AI Arena session to stream logs.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
