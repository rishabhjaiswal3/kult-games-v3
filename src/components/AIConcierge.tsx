import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  GitCompare,
  Gamepad2,
  Send,
  X,
  User,
  Loader2,
  Brain,
  Zap,
  Trophy,
  Swords,
  Clock,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import { KultAiBotAvatar } from "@/components/KultAiBotAvatar";
import KultAIMessageContent from "@/components/KultAIMessageContent";
import { useKultAIChat } from "@/hooks/useKultAIChat";
import flowAiBattle from "@/assets/flow-ai-battle.jpg";
import flowTrashTalk from "@/assets/flow-trash-talk.jpg";
import flowAgentSpawn from "@/assets/flow-agent-spawn.jpg";
import { cn } from "@/lib/utils";

const prompts = [
  { icon: Sparkles, text: "Find my first game", description: "AI picks the best starting point for you" },
  { icon: MessageSquare, text: "Pick based on my vibe", description: "Tell us your mood, we'll match a game" },
  { icon: GitCompare, text: "Compare games for me", description: "Side-by-side AI analysis of any two titles" },
  { icon: Gamepad2, text: "What's trending on 0G?", description: "See what the community is playing now" },
];

const capabilities = [
  { icon: Gamepad2, label: "Game discovery", detail: "Match by time, skill & mood" },
  { icon: Swords, label: "Arena advisor", detail: "Archetypes, loadouts & meta" },
  { icon: Trophy, label: "Rankings intel", detail: "Who's climbing the boards" },
  { icon: Zap, label: "Instant jump-in", detail: "Deep links to play or create" },
];

const previewThread = [
  {
    role: "user" as const,
    text: "First night on 0G — I want something sociable I can actually learn in one session, not get steamrolled in ranked.",
  },
  {
    role: "ai" as const,
    text: "**Neon Lobby** is built for first sessions: squads, on-screen cues, gentler matchmaking. Prefer solo sprints? **Pulse Drift** is ~3-minute rounds. Ask me to *compare any two titles* and I'll weigh skill curve, session length, and what's live in queue.",
  },
];

const consolePanels = [
  { src: flowAiBattle, label: "Battle intel", caption: "Reads your play style" },
  { src: flowTrashTalk, label: "Arena banter", caption: "Trash talk & rival picks" },
  { src: flowAgentSpawn, label: "Agent spawn", caption: "Create & fund in one flow" },
];

const stats = [
  { value: "24/7", label: "Concierge online" },
  { value: "6+", label: "Archetype guides" },
  { value: "<3s", label: "Typical first reply" },
];

const AIConcierge = () => {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [panelIndex, setPanelIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { clearMessages, error, input, isStreaming, isWaitingForFirstChunk, messages, sendMessage, setInput } =
    useKultAIChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPanelIndex((i) => (i + 1) % consolePanels.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatOpen) setChatOpen(true);
    void sendMessage();
  };

  const handlePromptClick = (text: string) => {
    if (!chatOpen) setChatOpen(true);
    void sendMessage(text);
  };

  const activePanel = consolePanels[panelIndex];

  return (
    <section className="relative z-10 overflow-hidden py-16 md:py-24">
      <AutoPlayVideo src="/videos/SC_10.mp4" loop className="absolute inset-0 h-full w-full object-cover opacity-[0.08]" />
      <div className="absolute inset-0 bg-background/90" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(278 100% 70% / 0.45) 1px, transparent 1px),
            linear-gradient(90deg, hsl(278 100% 70% / 0.45) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <div className="mb-5 flex items-center justify-center gap-2">
            <span className="live-dot h-2 w-2 rounded-full bg-[hsl(278_100%_82%)]" />
            <span className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[hsl(278_100%_82%)] uppercase">
              <KultAiBotAvatar className="h-4 w-4 sm:h-5 sm:w-5" alt="" /> AI Concierge
            </span>
          </div>
          <h2 className="mb-3 flex items-center justify-center gap-3 font-display text-3xl font-black tracking-tight md:gap-4 md:text-5xl">
            <KultAiBotAvatar className="h-11 w-11 shrink-0 md:h-14 md:w-14" alt="" />
            <span className="text-white">KULT</span>
            <span className="text-[hsl(278_100%_82%)]">AI</span>
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
            Your game-night co-pilot — find the right match, compare titles, and jump in fast.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Left — chat console (taller default; inner content scrolls when needed) */}
          <div className="glass-panel flex max-h-[min(860px,calc(100svh-9rem))] min-h-[640px] flex-col overflow-hidden rounded-2xl border border-[hsl(278_100%_70%/0.18)] p-4 shadow-[0_0_40px_hsl(278_100%_70%/0.06)] sm:min-h-[680px] sm:p-5">
            <div className="flex min-h-0 flex-1 flex-col">
              <AnimatePresence>
                {chatOpen && messages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4 flex min-h-0 flex-1 flex-col overflow-hidden"
                  >
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[hsl(278_100%_70%/0.2)] bg-card/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between border-b border-[hsl(278_100%_70%/0.15)] bg-[hsl(278_100%_70%/0.06)] px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="live-dot h-2 w-2 rounded-full bg-[hsl(278_100%_82%)]" />
                          <KultAiBotAvatar className="h-4 w-4 sm:h-5 sm:w-5" alt="" />
                          <span className="font-mono text-[10px] tracking-wider text-[hsl(278_100%_82%/0.7)]">
                            KULT AI — ONLINE
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setChatOpen(false);
                            clearMessages(true);
                          }}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain">
                        <div className="space-y-3 p-4">
                          {messages.map((msg, i) => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {msg.role === "ai" && (
                                <div className="mt-1 flex shrink-0 items-center">
                                  <KultAiBotAvatar className="h-7 w-7" alt="" />
                                </div>
                              )}
                              <div
                                className={cn(
                                  "max-w-[82%] break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                                  msg.role === "user"
                                    ? "btn-eye rounded-br-md whitespace-pre-wrap text-white"
                                    : "rounded-bl-md border border-[hsl(278_100%_70%/0.2)] bg-muted/30 text-foreground"
                                )}
                              >
                                {msg.role === "ai" ? <KultAIMessageContent text={msg.text} /> : msg.text}
                              </div>
                              {msg.role === "user" && (
                                <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-border/30 bg-muted/50">
                                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {isWaitingForFirstChunk && (
                            <div className="flex gap-2.5">
                              <div className="flex shrink-0 items-center">
                                <KultAiBotAvatar className="h-7 w-7" alt="" />
                              </div>
                              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[hsl(278_100%_70%/0.2)] bg-muted/30 px-3.5 py-2.5">
                                {[0, 0.2, 0.4].map((delay) => (
                                  <motion.div
                                    key={delay}
                                    className="h-1.5 w-1.5 rounded-full bg-[hsl(278_100%_82%/0.7)]"
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {messages.length === 0 && (
                <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain sm:gap-6">
                  <div className="flex min-h-[14rem] flex-1 flex-col justify-center rounded-xl border border-white/[0.08] bg-background/25 p-4 sm:min-h-[16rem] sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <Brain className="h-3.5 w-3.5 text-neon-purple" />
                      <span className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                        SAMPLE SESSION
                      </span>
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                      {previewThread.map((line, i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded-lg px-3 py-2.5 text-[11px] leading-relaxed sm:text-xs",
                            line.role === "user"
                              ? "ml-2 border border-neon-purple/20 bg-neon-purple/10 text-foreground sm:ml-6"
                              : "mr-2 border border-white/[0.08] bg-background/50 text-muted-foreground sm:mr-4"
                          )}
                        >
                          {line.role === "ai" ? <KultAIMessageContent text={line.text} /> : line.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 space-y-3">
                    <p className="font-display text-[10px] tracking-[0.18em] text-muted-foreground">
                      OR PICK A STARTER
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {prompts.map((prompt) => (
                        <button
                          type="button"
                          key={prompt.text}
                          onClick={() => handlePromptClick(prompt.text)}
                          className="group flex min-h-[76px] items-start gap-2.5 rounded-xl border border-white/[0.08] bg-background/30 px-3 py-3.5 text-left transition-all hover:border-[hsl(278_100%_70%/0.35)] hover:bg-[hsl(278_100%_70%/0.08)]"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(278_100%_70%/0.12)] group-hover:bg-[hsl(278_100%_70%/0.18)]">
                            <prompt.icon className="h-3.5 w-3.5 text-[hsl(278_100%_82%)]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold leading-snug text-foreground group-hover:text-[hsl(278_100%_82%)]">
                              {prompt.text}
                            </p>
                            <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                              {prompt.description}
                            </p>
                          </div>
                          <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-[hsl(278_100%_82%)]" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 shrink-0">
              <div className="relative overflow-hidden rounded-xl border border-[hsl(278_100%_70%/0.2)] bg-card/50 p-1.5 backdrop-blur-sm">
                <div className="relative flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2.5 sm:px-4 sm:py-3">
                  <KultAiBotAvatar className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" alt="" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => !chatOpen && setChatOpen(true)}
                    placeholder='Ask anything — "Which game fits a 10-minute break?"'
                    className="font-body min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="btn-eye flex shrink-0 items-center gap-2 px-3 py-2 font-display text-xs font-semibold tracking-wider disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
                  >
                    {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="relative z-10 hidden sm:inline">ASK KULT AI</span>
                  </button>
                </div>
              </div>
              {error ? <p className="mt-2 px-1 text-xs text-destructive/80">{error}</p> : null}
            </form>

            <div className="mt-3 grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
              {capabilities.map((cap) => (
                <div key={cap.label} className="rounded-lg border border-white/[0.06] bg-background/35 px-2 py-2">
                  <div className="flex items-center gap-1.5">
                    <cap.icon className="h-3 w-3 shrink-0 text-neon-cyan" />
                    <p className="min-w-0 truncate font-display text-[8px] font-bold leading-tight tracking-wide text-foreground sm:text-[9px]">
                      {cap.label}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-[8px] text-muted-foreground">{cap.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — live console (same min/max height as left; taller hero image strip) */}
          <aside className="flex max-h-[min(860px,calc(100svh-9rem))] min-h-[640px] flex-col overflow-hidden sm:min-h-[680px]">
            <div className="glass-panel flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[hsl(278_100%_70%/0.18)] shadow-[0_0_40px_hsl(278_100%_70%/0.06)]">
              <div className="relative flex min-h-[min(320px,42svh)] flex-1 flex-col bg-[hsl(268_32%_8%/0.6)]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activePanel.src}
                    src={activePanel.src}
                    alt={activePanel.label}
                    className="absolute inset-0 m-auto max-h-full max-w-full object-contain p-5 sm:p-8"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                  />
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(268_32%_8%/0.92)] via-transparent to-[hsl(268_32%_10%/0.25)]" />
                <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full border border-neon-green/30 bg-neon-green/10 px-3 py-1 backdrop-blur-sm">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-neon-green" />
                  <span className="font-mono text-[9px] tracking-widest text-neon-green">LIVE CONSOLE</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[hsl(268_32%_8%)] to-transparent px-4 pb-4 pt-12">
                  <p className="font-display text-[10px] tracking-[0.28em] text-neon-cyan uppercase">
                    {activePanel.label}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/90">{activePanel.caption}</p>
                  <div className="mt-3 flex gap-1.5">
                    {consolePanels.map((panel, i) => (
                      <button
                        key={panel.label}
                        type="button"
                        onClick={() => setPanelIndex(i)}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all",
                          i === panelIndex ? "bg-neon-cyan" : "bg-white/15 hover:bg-white/25"
                        )}
                        aria-label={`Show ${panel.label}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid shrink-0 grid-cols-3 border-t border-white/[0.06]">
                {stats.map((s) => (
                  <div key={s.label} className="border-r border-white/[0.06] px-2 py-3 text-center last:border-r-0 sm:px-3 sm:py-4">
                    <p className="font-display text-base font-black text-neon-cyan sm:text-lg">{s.value}</p>
                    <p className="mt-0.5 text-[9px] leading-snug text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex shrink-0 flex-col border-t border-white/[0.06] p-3 sm:p-4">
                <p className="mb-3 font-display text-[10px] tracking-[0.22em] text-muted-foreground">QUICK JUMP</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => navigate("/games")}
                    className="btn-eye-outline flex items-center justify-center gap-2 rounded-xl px-3 py-3 font-display text-[10px] font-bold tracking-wider"
                  >
                    <Gamepad2 className="h-4 w-4 shrink-0 text-neon-cyan" />
                    <span>GAMES</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/ai-arena")}
                    className="btn-eye-outline flex items-center justify-center gap-2 rounded-xl px-3 py-3 font-display text-[10px] font-bold tracking-wider"
                  >
                    <Swords className="h-4 w-4 shrink-0 text-neon-purple" />
                    <span>ARENA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/leaderboard")}
                    className="btn-eye-outline flex items-center justify-center gap-2 rounded-xl px-3 py-3 font-display text-[10px] font-bold tracking-wider"
                  >
                    <Trophy className="h-4 w-4 shrink-0 text-[hsl(40_85%_62%)]" />
                    <span>RANKS</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <p className="mx-auto mt-4 flex max-w-6xl items-center justify-center gap-1.5 text-center text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>Powered by 0G inference — live game &amp; arena context</span>
        </p>
      </div>
    </section>
  );
};

export default AIConcierge;
