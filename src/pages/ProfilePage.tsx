import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bot,
  Copy,
  Crown,
  Flame,
  Gamepad2,
  Loader2,
  Save,
  Sparkles,
  Swords,
  Trophy,
  UserCircle,
  Wallet,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { aiWarzoneApi } from "@/api/aiWarzoneApi";
import { playerApi } from "@/api/playerApi";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

function initialsFromName(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const p = t.split(/\s+/).filter(Boolean);
  if (p.length >= 2) return `${p[0][0]}${p[1][0]}`.toUpperCase();
  return t.slice(0, 2).toUpperCase();
}

function shortAddr(a: string) {
  if (a.length < 14) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, walletAddress, refetchProfile } = useAuth();
  const [nameDraft, setNameDraft] = useState("");

  const {
    data: full,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["player", "full-profile"],
    queryFn: () => playerApi.getFullProfile(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const agentQuery = useQuery({
    queryKey: ["aiWarzone", "profileAgent", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      const res = await aiWarzoneApi.getAgentByWallet(walletAddress);
      return res.found ? res.agent : null;
    },
    enabled: isAuthenticated && !!walletAddress,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (full?.player?.name != null) setNameDraft(full.player.name);
  }, [full?.player?.name]);

  const saveName = useMutation({
    mutationFn: (name: string) => playerApi.updateName(name),
    onSuccess: async (name) => {
      toast.success("Display name updated");
      setNameDraft(name);
      await queryClient.invalidateQueries({ queryKey: ["player", "full-profile"] });
      await refetchProfile();
    },
    onError: () => {
      toast.error("Could not update name");
    },
  });

  const copyText = (label: string, text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div
          className="pointer-events-none fixed inset-0 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, hsl(195 100% 45% / 0.25), transparent),
              radial-gradient(ellipse 60% 40% at 100% 50%, hsl(278 100% 50% / 0.12), transparent),
              radial-gradient(ellipse 50% 30% at 0% 80%, hsl(195 90% 40% / 0.1), transparent)
            `,
          }}
        />
        <Navbar />
        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg flex-col items-center justify-center px-6 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full rounded-[28px] border border-white/10 bg-card/60 p-10 text-center shadow-[0_24px_80px_hsl(220_60%_2%/0.45)] backdrop-blur-xl"
          >
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, hsl(195 100% 50% / 0.2), hsl(278 100% 60% / 0.15))",
                boxShadow: "0 0 40px hsl(195 100% 50% / 0.2)",
              }}
            >
              <UserCircle className="h-10 w-10 text-neon-cyan" />
            </div>
            <h1 className="font-display text-2xl font-black uppercase tracking-tight text-foreground sm:text-3xl">
              Your command center
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Sign in with your wallet to see stats, your Warzone AI agent, and customize your display name.
            </p>
            <Button
              asChild
              className="mt-8 h-12 rounded-xl bg-gradient-to-r from-[hsl(195_100%_45%)] to-[hsl(278_85%_50%)] px-8 font-display text-xs font-bold tracking-[0.2em] text-white shadow-[0_0_28px_hsl(195_100%_50%/_0.35)] hover:opacity-95"
            >
              <Link to="/?login=1">Sign in</Link>
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = full?.player.name?.trim() || "Player";
  const agent = agentQuery.data;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.55]"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% -10%, hsl(195 100% 50% / 0.14), transparent 55%),
            radial-gradient(ellipse 70% 50% at 100% 20%, hsl(278 100% 55% / 0.1), transparent),
            radial-gradient(ellipse 50% 40% at 0% 100%, hsl(195 80% 45% / 0.08), transparent)
          `,
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(270 40% 40% / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(270 40% 40% / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <Navbar />

      <section className="relative pt-24 pb-20 md:pb-28">
        <div className="relative mx-auto max-w-6xl px-4 md:px-8">
          <motion.button
            type="button"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/50 px-4 py-2 text-[11px] font-mono tracking-[0.2em] text-muted-foreground backdrop-blur-md transition-colors hover:border-neon-cyan/35 hover:text-neon-cyan"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            BACK
          </motion.button>

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-10 overflow-hidden rounded-[32px] border border-white/[0.09] bg-gradient-to-br from-card/80 via-card/40 to-background/80 p-8 shadow-[0_32px_100px_hsl(220_60%_2%/0.5)] backdrop-blur-xl md:p-10"
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "hsl(195 100% 50% / 0.12)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full blur-3xl"
              style={{ background: "hsl(278 100% 55% / 0.1)" }}
            />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <div
                  className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-2xl font-black tracking-tight text-background sm:h-28 sm:w-28 sm:text-3xl"
                  style={{
                    background: "linear-gradient(145deg, hsl(195 100% 52%), hsl(278 95% 58%))",
                    boxShadow: "0 0 0 1px hsl(195 100% 70% / 0.35), 0 16px 48px hsl(195 100% 45% / 0.35)",
                  }}
                >
                  {initialsFromName(displayName)}
                  <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg border border-background bg-background text-neon-cyan shadow-lg">
                    <Crown className="h-4 w-4" />
                  </span>
                </div>
                <div className="text-center sm:text-left">
                  <p className="mb-1 text-[11px] font-mono uppercase tracking-[0.35em] text-neon-cyan/85">Kult identity</p>
                  <h1 className="font-display text-3xl font-black uppercase tracking-[-0.04em] text-foreground sm:text-4xl md:text-5xl">
                    {displayName}
                  </h1>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Player profile and autonomous AI agent — synced with the Kult backend.
                  </p>
                  {walletAddress ? (
                    <button
                      type="button"
                      onClick={() => copyText("Wallet", walletAddress)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-background/50 px-4 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-neon-cyan/30 hover:text-neon-cyan"
                    >
                      <Wallet className="h-3.5 w-3.5" />
                      {shortAddr(walletAddress)}
                      <Copy className="h-3.5 w-3.5 opacity-50" />
                    </button>
                  ) : null}
                </div>
              </div>
              {full && !isLoading ? (
                <div className="grid w-full max-w-sm grid-cols-2 gap-3 md:w-auto md:max-w-none">
                  <div className="rounded-2xl border border-white/10 bg-background/40 p-4 text-center backdrop-blur-sm">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Level</p>
                    <p className="mt-1 font-display text-3xl font-black text-neon-cyan tabular-nums">{full.level}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-background/40 p-4 text-center backdrop-blur-sm">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Rank</p>
                    <p className="mt-1 font-display text-3xl font-black tabular-nums text-foreground">
                      {full.rank != null ? `#${full.rank}` : "—"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>

          {isLoading && (
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-72 rounded-[28px]" />
              <Skeleton className="h-72 rounded-[28px]" />
            </div>
          )}

          {isError && (
            <div className="rounded-[28px] border border-red-500/25 bg-red-500/5 p-8 text-center text-sm text-muted-foreground">
              Could not load profile.{" "}
              <button type="button" className="font-medium text-neon-cyan underline underline-offset-4" onClick={() => refetch()}>
                Retry
              </button>
            </div>
          )}

          {full && !isLoading && (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Account + name */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="lg:col-span-5"
              >
                <div className="h-full rounded-[28px] border border-white/[0.08] bg-card/50 p-6 shadow-[0_20px_60px_hsl(220_60%_2%/0.35)] backdrop-blur-md md:p-8">
                  <div className="mb-6 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon-cyan/15 text-neon-cyan">
                      <UserCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">Account</h2>
                      <p className="text-xs text-muted-foreground">Display name &amp; wallet</p>
                    </div>
                  </div>
                  <label htmlFor="profile-name" className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    Display name
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      id="profile-name"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      maxLength={100}
                      className="h-12 flex-1 rounded-xl border-white/10 bg-background/70 text-base"
                    />
                    <Button
                      type="button"
                      disabled={saveName.isPending || !nameDraft.trim() || nameDraft.trim() === full.player.name}
                      onClick={() => saveName.mutate(nameDraft.trim())}
                      className="h-12 shrink-0 rounded-xl px-6 font-display text-xs font-bold tracking-wider"
                    >
                      {saveName.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                  {full.player.referral_code ? (
                    <div className="mt-6 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                      <p className="mb-1 text-[10px] font-mono uppercase tracking-wider text-violet-300/90">Referral code</p>
                      <p className="font-mono text-lg font-semibold tracking-wide text-foreground">{full.player.referral_code}</p>
                    </div>
                  ) : null}
                </div>
              </motion.div>

              {/* Stats stack */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="lg:col-span-7"
              >
                <div className="grid h-full gap-4 sm:grid-cols-2">
                  <div className="rounded-[28px] border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/[0.08] to-transparent p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-2 text-neon-cyan">
                      <Trophy className="h-5 w-5" />
                      <span className="text-xs font-mono uppercase tracking-[0.2em]">Arena stats</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Total score</p>
                        <p className="mt-1 font-display text-2xl font-black tabular-nums text-foreground">
                          {full.totalScore.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Games</p>
                        <p className="mt-1 font-display text-2xl font-black tabular-nums text-foreground">{full.totalGamesPlayed}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Quests</p>
                        <p className="mt-1 font-display text-xl font-black text-muted-foreground">{full.completedQuests}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Cache</p>
                        <p className="mt-1 text-sm text-muted-foreground">{full.cached ? "Server cache" : "Live"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between rounded-[28px] border border-white/[0.08] bg-card/40 p-6 backdrop-blur-md">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <Gamepad2 className="h-5 w-5 text-neon-cyan" />
                        <span className="text-xs font-mono uppercase tracking-[0.2em]">Session</span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        You’re signed in with Privy. Session and JWT are cleared when you log out from the header menu.
                      </p>
                    </div>
                    <Button variant="outline" asChild className="mt-4 rounded-xl border-white/15 bg-background/30 hover:bg-background/50">
                      <Link to="/ai-arena">Open AI Arena</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* AI Agent */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-12"
              >
                <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-card/60 via-card/30 to-background/80 p-1 shadow-[0_24px_80px_hsl(220_60%_2%/0.4)]">
                  <div className="rounded-[26px] border border-violet-500/15 bg-background/40 p-6 backdrop-blur-md md:p-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-neon-cyan/20 text-violet-200">
                          <Bot className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-violet-300/90">Warzone AI</p>
                          <h2 className="font-display text-xl font-black uppercase tracking-tight text-foreground md:text-2xl">
                            Your AI agent
                          </h2>
                        </div>
                      </div>
                      {agent ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "w-fit border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
                            agent.status?.toLowerCase() === "inactive" && "border-amber-500/40 bg-amber-500/10 text-amber-200",
                          )}
                        >
                          {agent.status || "Active"}
                        </Badge>
                      ) : null}
                    </div>

                    {agentQuery.isLoading ? (
                      <div className="flex items-center gap-3 py-12 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin text-neon-cyan" />
                        <span className="text-sm">Loading agent…</span>
                      </div>
                    ) : agentQuery.isError ? (
                      <p className="py-8 text-sm text-red-400/90">Could not reach AI Warzone service.</p>
                    ) : !agent ? (
                      <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-background/30 py-12 text-center">
                        <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/50" />
                        <p className="max-w-md text-sm text-muted-foreground">
                          No agent linked to this wallet yet. Create one from the header menu or visit AI Arena to get started.
                        </p>
                        <Button asChild className="mt-6 rounded-xl font-display text-xs font-bold tracking-wider">
                          <Link to="/ai-arena">Go to AI Arena</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,280px)]">
                        <div>
                          <h3 className="font-display text-lg font-bold text-foreground">{agent.name}</h3>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{agent.description}</p>
                          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div className="rounded-xl border border-white/10 bg-background/50 p-3">
                              <p className="text-[10px] font-mono uppercase text-muted-foreground">Elo</p>
                              <p className="mt-1 font-display text-xl font-black tabular-nums text-neon-cyan">{agent.elo}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/50 p-3">
                              <p className="text-[10px] font-mono uppercase text-muted-foreground">Balance</p>
                              <p className="mt-1 font-display text-xl font-black tabular-nums text-foreground">{agent.currency} G</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/50 p-3">
                              <p className="text-[10px] font-mono uppercase text-muted-foreground">Record</p>
                              <p className="mt-1 flex items-center gap-1 font-mono text-sm">
                                <span className="text-emerald-400">{agent.wins}W</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-red-400/90">{agent.losses}L</span>
                              </p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-background/50 p-3">
                              <p className="text-[10px] font-mono uppercase text-muted-foreground">Matches</p>
                              <p className="mt-1 font-display text-xl font-black tabular-nums">{agent.totalMatches}</p>
                            </div>
                          </div>
                          <div className="mt-4 space-y-2">
                            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Hot wallet</p>
                            <button
                              type="button"
                              onClick={() => copyText("Hot wallet", agent.hotWalletAddress)}
                              className="flex w-full max-w-xl items-center justify-between gap-2 rounded-xl border border-white/10 bg-background/60 px-3 py-2.5 text-left font-mono text-xs text-foreground transition-colors hover:border-neon-cyan/30"
                            >
                              <span className="truncate">{agent.hotWalletAddress}</span>
                              <Copy className="h-4 w-4 shrink-0 opacity-50" />
                            </button>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">On-chain ID</p>
                            <p className="truncate rounded-xl border border-white/5 bg-background/40 px-3 py-2 font-mono text-[11px] text-muted-foreground">
                              {agent.onChainId}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-orange-500/20 bg-gradient-to-b from-orange-500/[0.07] to-transparent p-5">
                          <div>
                            <div className="mb-2 flex items-center gap-2 text-orange-300/90">
                              <Flame className="h-5 w-5" />
                              <span className="text-xs font-mono uppercase tracking-wider">Combat ready</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Fund your agent from the header menu to keep it stocked for arena matches and in-game actions.
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button asChild variant="secondary" className="rounded-xl border border-white/10 bg-background/60">
                              <Link to="/ai-arena">
                                <Swords className="mr-2 h-4 w-4" />
                                Arena &amp; training
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {full && full.gameScoresList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-8 overflow-hidden rounded-[28px] border border-white/[0.08] bg-card/40 shadow-[0_20px_60px_hsl(220_60%_2%/0.35)] backdrop-blur-md"
            >
              <div className="border-b border-white/10 bg-gradient-to-r from-neon-cyan/10 via-transparent to-violet-500/10 px-6 py-4 md:px-8">
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">Scores by game</h2>
                <p className="text-xs text-muted-foreground">Weighted leaderboard contributions per title</p>
              </div>
              <div className="overflow-x-auto px-2 pb-2 md:px-4">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">Game</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Weight</th>
                      <th className="px-4 py-3">Weighted</th>
                      <th className="px-4 py-3">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {full.gameScoresList.map((row, i) => (
                      <tr
                        key={row.identification}
                        className={cn(
                          "border-t border-white/[0.05] transition-colors hover:bg-white/[0.03]",
                          i % 2 === 1 && "bg-white/[0.02]",
                        )}
                      >
                        <td className="px-4 py-3.5 font-mono text-xs font-medium text-foreground">{row.identification}</td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{row.score.toLocaleString()}</td>
                        <td className="px-4 py-3.5 tabular-nums text-muted-foreground">{row.weight}</td>
                        <td className="px-4 py-3.5 tabular-nums text-neon-cyan/90">
                          {row.weightedScore.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums font-medium text-foreground">
                          {row.rank != null ? `#${row.rank}` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProfilePage;
