import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { gamesApi } from "@/api/gamesApi";
import type { Game } from "@/types/api";
import { Link } from "react-router-dom";
import {
  Wallet,
  Bot,
  ShoppingCart,
  Swords,
  BrainCircuit,
  Zap,
  MessageSquareWarning,
  Shield,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react";

/* ─── AI features per game (slug / identification → features) ─── */
type AIFeature = {
  icon: React.ElementType;
  label: string;
  color: string;
  description: string;
};

const AI_FEATURE_DEFS: Record<string, AIFeature> = {
  "ai-agent": { icon: Bot, label: "AI Agent", color: "hsl(195 100% 60%)", description: "Autonomous decision unit" },
  "ai-training": { icon: Dumbbell, label: "AI Training", color: "hsl(270 82% 68%)", description: "Learns from matches" },
  "ai-arena": { icon: Swords, label: "AI Arena", color: "hsl(0 85% 62%)", description: "Competitive AI duels" },
  "trash-talk": { icon: MessageSquareWarning, label: "Trash Talk", color: "hsl(40 85% 65%)", description: "Context-aware taunts" },
  "hot-wallet": { icon: Wallet, label: "Hot Wallet", color: "hsl(150 100% 50%)", description: "Live autonomous funding" },
  "ai-purchases": { icon: ShoppingCart, label: "AI Purchases", color: "hsl(195 80% 55%)", description: "Smart in-game buys" },
  "agent-fight": { icon: Swords, label: "Agent Fight", color: "hsl(310 100% 60%)", description: "Agent-vs-agent combat" },
  "ai-recommendation": { icon: Sparkles, label: "AI Recommendation", color: "hsl(278 100% 72%)", description: "Personalized suggestions" },
};

const GAME_AI_FEATURES: Record<string, string[]> = {
  "warzone-warriors": ["ai-training", "ai-arena", "trash-talk", "hot-wallet", "ai-purchases"],
  "highway-hustle": ["hot-wallet", "ai-training", "agent-fight"],
  "guess-the-ai": ["trash-talk", "ai-recommendation"],
  "robo-wars": ["ai-training", "trash-talk"],
  "zero-dash": ["ai-agent", "hot-wallet", "ai-purchases"],
  "zero-g-pool": ["hot-wallet", "ai-agent", "agent-fight"],
};

function resolveGameKey(game: Game): string | null {
  const slug = game.slug ?? game.identification ?? "";
  const name = typeof game.name === "string" ? game.name : game.name?.en ?? "";
  const norm = (s: string) => s.toLowerCase().replace(/[\s_]+/g, "-");
  const slugNorm = norm(slug);
  const nameNorm = norm(name);
  for (const key of Object.keys(GAME_AI_FEATURES)) {
    if (slugNorm.includes(key) || nameNorm.includes(key)) return key;
  }
  return null;
}

function getGameName(name: Game["name"]): string {
  if (typeof name === "string") return name;
  return name?.en ?? Object.values(name)[0] ?? "";
}

function getGameImage(game: Game): string {
  return (
    game.thumbnail?.horizontal?.url ??
    game.thumbnail?.vertical?.url ??
    game.image_url ??
    game.images?.[0]?.url ??
    ""
  );
}

function getGameDescription(desc: Game["description"]): string {
  if (!desc) return "";
  if (typeof desc === "string") return desc;
  return desc?.en ?? Object.values(desc)[0] ?? "";
}

/* ─── Timeline flow steps ─── */
interface FlowStep {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  visual: string;
  badge?: { icon: React.ElementType; text: string; color: string };
  color: "purple" | "cyan" | "amber";
}

const FLOW_STEPS: FlowStep[] = [
  {
    icon: Wallet,
    label: "User Wallet",
    sublabel: "You create your wallet to enter the Kult arena",
    visual: "wallet-init",
    color: "purple",
  },
  {
    icon: Bot,
    label: "AI Agent Spawns",
    sublabel: "An AI agent is automatically generated for you",
    visual: "agent-spawn",
    badge: { icon: Zap, text: "Auto-Generated", color: "hsl(40 85% 65%)" },
    color: "cyan",
  },
  {
    icon: Wallet,
    label: "Hot Wallet",
    sublabel: "Your agent gets its own wallet — fund it and it acts autonomously",
    visual: "hot-wallet",
    badge: { icon: Shield, text: "Fund & Activate", color: "hsl(150 100% 50%)" },
    color: "amber",
  },
  {
    icon: ShoppingCart,
    label: "AI Purchases",
    sublabel: "Your agent auto-buys the best assets, skins and power-ups",
    visual: "ai-purchases",
    color: "cyan",
  },
  {
    icon: Swords,
    label: "AI Battle",
    sublabel: "Agents duel each other — your AI fights with strategy",
    visual: "ai-arena",
    color: "purple",
  },
  {
    icon: MessageSquareWarning,
    label: "Trash Talk",
    sublabel: "Your AI roasts opponents during battles — ruthless and hilarious",
    visual: "ai-trash-talk",
    color: "amber",
  },
];

const FLOW_VISUAL_BACKGROUNDS: Record<string, string> = {
  "wallet-init":
    "linear-gradient(135deg, hsl(270 82% 35% / 0.95), hsl(260 70% 25% / 0.9), hsl(195 100% 25% / 0.85))",
  "agent-spawn":
    "radial-gradient(circle at 25% 20%, hsl(195 100% 55% / 0.45), transparent 45%), linear-gradient(130deg, hsl(200 75% 18% / 0.95), hsl(270 82% 26% / 0.95), hsl(290 70% 22% / 0.9))",
  "hot-wallet":
    "radial-gradient(circle at 80% 15%, hsl(40 95% 60% / 0.35), transparent 40%), linear-gradient(120deg, hsl(35 80% 24% / 0.95), hsl(20 85% 20% / 0.92), hsl(195 90% 22% / 0.85))",
  "ai-purchases":
    "linear-gradient(120deg, hsl(195 90% 22% / 0.95), hsl(220 70% 24% / 0.92), hsl(270 78% 26% / 0.9))",
  "ai-arena":
    "radial-gradient(circle at 50% 10%, hsl(310 100% 62% / 0.22), transparent 38%), linear-gradient(120deg, hsl(315 65% 20% / 0.95), hsl(260 78% 20% / 0.9), hsl(195 95% 20% / 0.85))",
  "ai-trash-talk":
    "radial-gradient(circle at 15% 22%, hsl(40 95% 60% / 0.3), transparent 44%), linear-gradient(120deg, hsl(40 80% 23% / 0.95), hsl(275 70% 22% / 0.92), hsl(220 65% 19% / 0.88))",
};

const FLOW_VISUAL_IMAGES: Record<string, string> = {
  "wallet-init": "/ai-flow/wallet-init.svg",
  "agent-spawn": "/ai-flow/agent-spawn.svg",
  "hot-wallet": "/ai-flow/hot-wallet.svg",
  "ai-purchases": "/ai-flow/ai-purchases.svg",
  "ai-arena": "/ai-flow/ai-arena.svg",
  "ai-trash-talk": "/ai-flow/ai-trash-talk.svg",
};

const HERO_PROTOCOLS = [
  { icon: BrainCircuit, label: "Neural Core" },
  { icon: Wallet, label: "Hot Wallet Mesh" },
  { icon: Swords, label: "Arena Combat AI" },
  { icon: MessageSquareWarning, label: "Voice + Banter" },
];

const STACK_MODULES = [
  { icon: Bot, label: "Auto Agent", sub: "Self-operating core", tone: "hsl(195 100% 60%)" },
  { icon: BrainCircuit, label: "Strategy Layer", sub: "Adaptive planning mesh", tone: "hsl(278 100% 72%)" },
  { icon: MessageSquareWarning, label: "Arena Voice", sub: "Realtime banter engine", tone: "hsl(40 85% 65%)" },
];

const COLOR_MAP = {
  purple: {
    bg: "hsl(270 82% 52% / 0.16)",
    border: "hsl(278 100% 75% / 0.3)",
    glow: "hsl(270 82% 58% / 0.25)",
    text: "hsl(278 100% 82%)",
    icon: "hsl(278 100% 82%)",
    line: "hsl(270 82% 58%)",
  },
  cyan: {
    bg: "hsl(195 100% 50% / 0.1)",
    border: "hsl(195 100% 60% / 0.3)",
    glow: "hsl(195 100% 50% / 0.25)",
    text: "hsl(195 100% 70%)",
    icon: "hsl(195 100% 65%)",
    line: "hsl(195 100% 55%)",
  },
  amber: {
    bg: "hsl(40 85% 58% / 0.1)",
    border: "hsl(40 85% 58% / 0.3)",
    glow: "hsl(40 85% 58% / 0.25)",
    text: "hsl(40 85% 70%)",
    icon: "hsl(40 85% 65%)",
    line: "hsl(40 85% 58%)",
  },
};

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
const AIArena = () => {
  /* ── Games carousel ── */
  const { data } = useQuery({
    queryKey: ["games", "all"],
    queryFn: () => gamesApi.getAll(1, 20),
    staleTime: 5 * 60_000,
  });

  const gamesWithFeatures = useMemo(() => {
    if (!data?.games) return [];
    return data.games
      .map((g) => ({ game: g, key: resolveGameKey(g) }))
      .filter((g): g is { game: Game; key: string } => g.key !== null);
  }, [data]);

  const [carouselIdx, setCarouselIdx] = useState(0);
  const activeGame = gamesWithFeatures[carouselIdx] ?? null;

  const prevGame = useCallback(() => {
    setCarouselIdx((i) => (i === 0 ? gamesWithFeatures.length - 1 : i - 1));
  }, [gamesWithFeatures.length]);

  const nextGame = useCallback(() => {
    setCarouselIdx((i) => (i === gamesWithFeatures.length - 1 ? 0 : i + 1));
  }, [gamesWithFeatures.length]);

  useEffect(() => {
    if (gamesWithFeatures.length <= 1) return;
    const timer = window.setInterval(nextGame, 5000);
    return () => window.clearInterval(timer);
  }, [gamesWithFeatures.length, nextGame]);

  /* ── Section scroll progress for the line-draw effect ── */
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineContainerRef,
    offset: ["start 0.85", "end 0.55"],
  });

  const [drawProgress, setDrawProgress] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setDrawProgress(v));
  const completionPercent = Math.round(drawProgress * 100);
  const cappedFlowPercent = Math.min(92, Math.max(2, completionPercent));

  /* how many steps to reveal */
  const revealedSteps = Math.min(
    FLOW_STEPS.length,
    Math.floor(drawProgress * (FLOW_STEPS.length + 1))
  );
  const activeStepIndex = Math.min(FLOW_STEPS.length - 1, Math.max(0, revealedSteps - 1));

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(270 82% 58% / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(270 82% 58% / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glows */}
      <div className="fixed top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-neon-purple/3 blur-[200px] pointer-events-none" />
      <div className="fixed bottom-20 right-1/3 w-[500px] h-[500px] rounded-full bg-neon-cyan/3 blur-[180px] pointer-events-none" />

      {/* ──────────────────  HERO HEADER  ────────────────── */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 overflow-hidden">
        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-[1px] pointer-events-none z-10"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(278 100% 82% / 0.15), transparent)",
            boxShadow: "0 0 20px hsl(278 100% 82% / 0.1)",
          }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-5xl mx-auto rounded-[28px] border border-neon-purple/20 bg-card/35 backdrop-blur-xl px-5 md:px-10 py-10 md:py-12 shadow-[0_0_80px_hsl(270_82%_58%_/_0.12)] relative overflow-hidden">
            <div className="absolute -top-28 -left-20 w-64 h-64 rounded-full bg-neon-purple/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-neon-cyan/10 blur-3xl pointer-events-none" />
          {/* Label */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-neon-cyan"
              animate={{
                opacity: [1, 0.3, 1],
                boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase flex items-center gap-1.5">
              <BrainCircuit className="w-3 h-3" /> AI ARENA
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <span className="text-white" style={{ textShadow: "0 0 30px hsl(195 100% 60% / 0.12)" }}>
              YOUR AI{" "}
            </span>
            <span
              style={{
                color: "hsl(195 100% 65%)",
                textShadow: "0 0 20px hsl(195 100% 60% / 0.6), 0 0 50px hsl(195 100% 60% / 0.3)",
              }}
            >
              AGENT
            </span>
          </motion.h1>

          <motion.p
            className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed mb-6"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            Create your wallet. Spawn an AI agent with its own hot wallet. Fund it, and let your AI fight, trade, and
            trash-talk on your behalf.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mb-7"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Link
              to="/games"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/20 transition-all"
            >
              Start Building Agent <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#ai-game-map"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 bg-card/40 text-muted-foreground text-sm font-semibold hover:text-foreground hover:border-neon-purple/40 transition-all"
            >
              Explore AI Games
            </a>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {HERO_PROTOCOLS.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border/45 bg-card/45 text-[11px] md:text-xs text-muted-foreground"
              >
                <item.icon className="w-3.5 h-3.5 text-neon-purple" />
                <span>{item.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Decorative line */}
          <motion.div
            className="mx-auto w-16 h-[2px] rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, hsl(195 100% 60%), transparent)",
              boxShadow: "0 0 14px hsl(195 100% 60% / 0.5)",
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
          </div>
        </div>
      </section>

      {/* ──────────────────  AI ORCHESTRATION FLOW  ────────────────── */}
      <section ref={timelineContainerRef} className="relative py-10 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto md:grid md:grid-cols-[minmax(0,1fr)_480px] gap-6 lg:gap-10 items-start">
            <div className="md:sticky md:top-16">
              <div className="relative pr-10 pl-2 py-2 rounded-3xl border border-neon-cyan/25 bg-card/35 backdrop-blur-xl overflow-hidden shadow-[0_0_90px_hsl(195_100%_55%_/_0.16)]">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, hsl(270 82% 58% / 0.08) 0%, transparent 35%, transparent 70%, hsl(195 100% 55% / 0.08) 100%)",
                  }}
                />
                <div className="absolute -top-20 -left-10 w-52 h-52 rounded-full bg-neon-purple/12 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -right-12 w-56 h-56 rounded-full bg-neon-cyan/12 blur-3xl pointer-events-none" />
                <div className="absolute right-4 top-4 bottom-4 w-[2px] rounded-full bg-border/35" />
                <motion.div
                  className="absolute right-4 top-4 w-[2px] rounded-full origin-top"
                  style={{
                    height: "calc(100% - 32px)",
                    scaleY: drawProgress,
                    background: "linear-gradient(180deg, hsl(270 82% 58%), hsl(195 100% 55%), hsl(40 85% 58%))",
                    boxShadow: "0 0 14px hsl(195 100% 55% / 0.45)",
                  }}
                />
                <motion.div
                  className="absolute right-2.5 w-4 h-4 rounded-full border border-neon-cyan/60 bg-background/90"
                  style={{
                    top: `calc(${cappedFlowPercent}% - 8px)`,
                    boxShadow: "0 0 12px hsl(195 100% 60% / 0.65)",
                  }}
                />

                <div className="space-y-4 relative z-10">
                  {FLOW_STEPS.map((step, idx) => {
                    const c = COLOR_MAP[step.color];
                    const isRevealed = idx < revealedSteps;
                    const visualBg = FLOW_VISUAL_BACKGROUNDS[step.visual] ?? FLOW_VISUAL_BACKGROUNDS["agent-spawn"];
                    const visualImage = FLOW_VISUAL_IMAGES[step.visual];

                    return (
                      <motion.div
                        key={step.label}
                        className="relative mr-5 rounded-[20px] border p-4 md:p-5 text-right overflow-hidden"
                        animate={
                          isRevealed
                            ? { opacity: 1, x: 0, y: 0, scale: 1 }
                            : { opacity: 0.35, x: 10, y: 8, scale: 0.985 }
                        }
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        whileHover={{ y: -2, scale: 1.01 }}
                        style={{
                          borderColor: isRevealed ? c.border : "hsl(var(--border) / 0.55)",
                          background: isRevealed
                            ? `linear-gradient(145deg, hsl(var(--card) / 0.78), hsl(var(--card) / 0.56))`
                            : "hsl(var(--card) / 0.38)",
                          boxShadow: isRevealed
                            ? `0 0 30px ${c.glow}, 0 0 60px ${c.glow}, inset 0 1px 0 hsl(210 20% 100% / 0.08)`
                            : "inset 0 1px 0 hsl(210 20% 100% / 0.04)",
                        }}
                      >
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at 85% 10%, ${c.glow}, transparent 52%)`,
                            opacity: isRevealed ? 0.75 : 0.2,
                          }}
                        />
                        <div
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full border border-background"
                          style={{
                            background: isRevealed ? c.icon : "hsl(var(--muted-foreground))",
                            boxShadow: isRevealed ? `0 0 14px ${c.icon}` : "none",
                          }}
                        />
                        <div
                          className="absolute top-2.5 right-2.5 h-[2px] w-16 rounded-full"
                          style={{
                            background: isRevealed ? `linear-gradient(90deg, transparent, ${c.icon})` : "transparent",
                            boxShadow: isRevealed ? `0 0 12px ${c.icon}` : "none",
                          }}
                        />
                        <div className="mb-3 rounded-xl overflow-hidden border border-border/40 bg-black/30">
                          <div className="relative aspect-[16/7]">
                            {visualImage ? (
                              <img src={visualImage} alt={step.label} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full" style={{ background: visualBg }} />
                            )}
                            <div
                              className="absolute inset-0 opacity-30"
                              style={{
                                backgroundImage:
                                  "linear-gradient(hsl(0 0% 100% / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.08) 1px, transparent 1px)",
                                backgroundSize: "20px 20px",
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/60 border border-white/10 text-[10px] font-mono tracking-wide text-white/90">
                              {step.label.toUpperCase()}
                            </div>
                            <div className="absolute top-2 left-2 px-2 py-1 rounded-md border border-white/20 bg-black/40 text-[9px] font-mono tracking-widest text-white/75">
                              NODE {idx + 1}
                            </div>
                            <div
                              className="absolute top-2 right-2 px-2 py-1 rounded-md text-[9px] font-mono tracking-widest border"
                              style={{
                                color: isRevealed ? c.text : "hsl(var(--muted-foreground))",
                                borderColor: isRevealed ? c.border : "hsl(var(--border) / 0.45)",
                                background: isRevealed ? c.bg : "hsl(var(--muted) / 0.25)",
                              }}
                            >
                              {isRevealed ? "ACTIVE" : "QUEUED"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start justify-end gap-3">
                          <div>
                            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mb-1">
                              Step {idx + 1}
                            </p>
                            <p className="font-display text-base md:text-lg font-bold tracking-wide uppercase" style={{ color: c.text }}>
                              {step.label}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                              {step.sublabel}
                            </p>
                            {step.badge && (
                              <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-mono tracking-wider uppercase" style={{ color: step.badge.color }}>
                                <step.badge.icon className="w-3 h-3" />
                                {step.badge.text}
                              </span>
                            )}
                          </div>
                          <div className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0" style={{ borderColor: c.border, background: c.bg }}>
                            <step.icon style={{ width: 20, height: 20, color: c.icon }} />
                          </div>
                        </div>
                        <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-border/35">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${c.line}, ${c.icon})` }}
                            animate={isRevealed ? { width: "100%" } : { width: "18%" }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mb-8 md:mb-0 md:sticky md:top-16 self-start">
              <motion.div
                className="relative rounded-3xl border border-neon-purple/30 bg-card/50 backdrop-blur-xl p-5 md:p-6 overflow-hidden"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ boxShadow: "0 0 110px hsl(270 82% 58% / 0.2), 0 0 40px hsl(195 100% 55% / 0.12), inset 0 1px 0 hsl(210 20% 100% / 0.07)" }}
              >
                <div
                  className="absolute -top-24 -right-24 w-56 h-56 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, hsl(195 100% 55% / 0.28), transparent 70%)" }}
                />
                <div
                  className="absolute -bottom-20 -left-20 w-52 h-52 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(circle, hsl(270 82% 58% / 0.32), transparent 70%)" }}
                />
                <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "linear-gradient(130deg, transparent 30%, hsl(195 100% 55% / 0.12) 50%, transparent 72%)" }} />
                <p className="text-[10px] md:text-xs font-mono tracking-[0.2em] uppercase text-neon-cyan mb-2 relative z-10">
                  AI Flow Console
                </p>
                <h3 className="font-display text-xl md:text-3xl font-black text-foreground mb-2 relative z-10">
                  Scroll to Run Agent Lifecycle
                </h3>
                <p className="text-sm md:text-[15px] text-muted-foreground max-w-xl leading-relaxed mb-4 relative z-10">
                  The step cards are now on the left and reveal progressively as the flow signal moves downward.
                  Monitor live progression here while you scroll.
                </p>
                <div className="h-2.5 rounded-full bg-border/30 overflow-hidden mb-4 relative z-10">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      width: `${completionPercent}%`,
                      background:
                        "linear-gradient(90deg, hsl(270 82% 58%), hsl(195 100% 55%), hsl(40 85% 58%))",
                      boxShadow: "0 0 20px hsl(195 100% 55% / 0.45)",
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5 relative z-10">
                  <div className="rounded-xl border border-neon-purple/35 bg-neon-purple/12 px-3 py-2 shadow-[0_0_24px_hsl(270_82%_58%_/_0.2)]">
                    <p className="text-[10px] uppercase tracking-widest text-neon-purple font-mono">Session Sync</p>
                    <p className="text-base md:text-lg font-bold text-foreground">{completionPercent}%</p>
                  </div>
                  <div className="rounded-xl border border-neon-cyan/35 bg-neon-cyan/12 px-3 py-2 shadow-[0_0_24px_hsl(195_100%_55%_/_0.2)]">
                    <p className="text-[10px] uppercase tracking-widest text-neon-cyan font-mono">Active Step</p>
                    <p className="text-base md:text-lg font-bold text-foreground">{activeStepIndex + 1} / {FLOW_STEPS.length}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-border/45 bg-card/40 p-3 relative z-10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan font-mono mb-2">Active AI Node</p>
                  <div className="rounded-xl overflow-hidden border border-border/50">
                    <div className="relative aspect-[16/7]">
                      <img
                        src={FLOW_VISUAL_IMAGES[FLOW_STEPS[activeStepIndex]?.visual]}
                        alt={FLOW_STEPS[activeStepIndex]?.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                      <p className="absolute bottom-2 left-2 text-[11px] font-semibold text-white/90">
                        {FLOW_STEPS[activeStepIndex]?.label}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 relative z-10">
                  {[
                    { icon: Shield, label: "Secure Runtime", tone: "hsl(150 100% 50%)" },
                    { icon: Zap, label: "Real-time Decisions", tone: "hsl(195 100% 60%)" },
                    { icon: Sparkles, label: "Adaptive Strategy", tone: "hsl(278 100% 75%)" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border px-3 py-2 bg-card/40"
                      style={{ borderColor: `${item.tone}55` }}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" style={{ color: item.tone }} />
                        <p className="text-[11px] font-semibold tracking-wide" style={{ color: item.tone }}>
                          {item.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────  GAMES CAROUSEL  ────────────────── */}
      <section id="ai-game-map" className="relative py-16 md:py-24 overflow-hidden">
        {/* Top separator */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent"
          style={{ boxShadow: "0 0 20px hsl(195 100% 60% / 0.15)" }}
        />

        <div className="container mx-auto px-6 relative z-10">
          {/* Section heading */}
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <motion.div
                className="w-2 h-2 rounded-full"
                style={{ background: "hsl(278 100% 82%)" }}
                animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(278 100% 82%)", "0 0 14px hsl(278 100% 82%)", "0 0 4px hsl(278 100% 82%)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-mono tracking-[0.2em] uppercase" style={{ color: "hsl(278 100% 82%)" }}>
                AI-Powered Games
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-black tracking-tight text-foreground">
              Every Game, <span className="gradient-text glow-text">AI Enhanced</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
              Discover which AI features power each game in the Kult ecosystem
            </p>
          </motion.div>

          {/* Carousel */}
          {gamesWithFeatures.length > 0 && activeGame && (
            <div className="max-w-5xl mx-auto">
              <div className="relative">
                {/* Nav arrows */}
                <button
                  onClick={prevGame}
                  className="absolute -left-4 md:-left-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-all"
                  aria-label="Previous game"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextGame}
                  className="absolute -right-4 md:-right-14 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full border border-border/50 bg-card/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-neon-cyan hover:border-neon-cyan/40 transition-all"
                  aria-label="Next game"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Card */}
                <motion.div
                  key={activeGame.key}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 28 }}
                  className="rounded-3xl border border-border/45 bg-card/50 backdrop-blur-md overflow-hidden"
                  style={{
                    boxShadow: "0 0 60px hsl(270 82% 58% / 0.1), inset 0 1px 0 hsl(210 20% 100% / 0.05)",
                  }}
                >
                  {/* Game image */}
                  <div className="relative aspect-[16/7] overflow-hidden">
                    <img
                      src={getGameImage(activeGame.game)}
                      alt={getGameName(activeGame.game.name)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />

                    {/* Game info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                      <div className="flex items-center gap-2 mb-1">
                        {activeGame.game.rating != null && activeGame.game.rating > 0 && (
                          <span className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />
                            <span className="text-foreground font-semibold">{activeGame.game.rating}</span>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-neon-cyan/80 tracking-wider uppercase">
                          {activeGame.game.category}
                        </span>
                      </div>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-wide">
                        {getGameName(activeGame.game.name)}
                      </h3>
                    </div>

                    {/* Pagination indicator */}
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-card/70 backdrop-blur-sm border border-border/40">
                      <span className="text-xs font-mono text-muted-foreground">
                        {carouselIdx + 1} / {gamesWithFeatures.length}
                      </span>
                    </div>
                  </div>

                  {/* AI features */}
                  <div className="p-6 md:p-7">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
                        AI Features
                      </p>
                      <span className="text-[10px] md:text-xs text-neon-cyan font-mono tracking-wider uppercase">
                        Agent Profile Ready
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {GAME_AI_FEATURES[activeGame.key]?.map((fKey, fi) => {
                        const feat = AI_FEATURE_DEFS[fKey];
                        if (!feat) return null;
                        return (
                          <motion.div
                            key={fKey}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: fi * 0.06 }}
                            className="group flex items-center gap-3 px-3.5 py-3 rounded-xl border bg-card/45 backdrop-blur-sm cursor-default transition-all duration-200"
                            style={{
                              borderColor: `${feat.color}30`,
                            }}
                            whileHover={{
                              borderColor: feat.color,
                              boxShadow: `0 0 16px ${feat.color}22`,
                              y: -2,
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${feat.color}18` }}
                            >
                              <feat.icon style={{ width: 15, height: 15, color: feat.color }} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold tracking-wide leading-none" style={{ color: feat.color }}>
                                {feat.label}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1 truncate">
                                {feat.description}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Description */}
                    {getGameDescription(activeGame.game.description) && (
                      <p className="text-xs text-muted-foreground mt-4 leading-relaxed line-clamp-2">
                        {getGameDescription(activeGame.game.description)}
                      </p>
                    )}

                    <div className="mt-5 pt-4 border-t border-border/40">
                      <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2.5">
                        AI-ready stack
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {STACK_MODULES.map((stack) => (
                          <div
                            key={stack.label}
                            className="rounded-xl border p-2.5 bg-card/45 hover:-translate-y-0.5 transition-transform"
                            style={{ borderColor: `${stack.tone}45` }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <stack.icon className="w-3.5 h-3.5" style={{ color: stack.tone }} />
                              <p className="text-[11px] font-semibold" style={{ color: stack.tone }}>
                                {stack.label}
                              </p>
                            </div>
                            <p className="text-[10px] text-muted-foreground">{stack.sub}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  {gamesWithFeatures.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIdx(i)}
                      className="relative w-2 h-2 rounded-full transition-all duration-300"
                      style={{
                        background: i === carouselIdx ? "hsl(195 100% 60%)" : "hsl(220 30% 25%)",
                        boxShadow: i === carouselIdx ? "0 0 8px hsl(195 100% 60% / 0.6)" : "none",
                        transform: i === carouselIdx ? "scale(1.4)" : "scale(1)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!data && (
            <div className="max-w-3xl mx-auto rounded-2xl border border-border/40 bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading AI-powered games...</p>
            </div>
          )}

          {data && gamesWithFeatures.length === 0 && (
            <div className="max-w-3xl mx-auto rounded-2xl border border-border/40 bg-card/40 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No mapped AI games yet. Add matching slugs/identification to show AI features here.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AIArena;
