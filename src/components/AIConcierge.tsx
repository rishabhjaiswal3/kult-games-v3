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
import KultAIMessageContent from "@/components/KultAIMessageContent";
import { useKultAIChat } from "@/hooks/useKultAIChat";
import flowAiBattle from "@/assets/flow-ai-battle.jpg";
import flowTrashTalk from "@/assets/flow-trash-talk.jpg";
import flowAgentSpawn from "@/assets/flow-agent-spawn.jpg";
import { cn } from "@/lib/utils";

const KultAIIcon = ({ size = 16, color = "hsl(278,100%,82%)" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L22.5 7.5V18.5L13 24L3.5 18.5V7.5L13 2Z" stroke={color} strokeWidth="1.2" strokeOpacity="0.7" fill="none" />
    <line x1="13" y1="2" x2="13" y2="6" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="13" y1="20" x2="13" y2="24" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="3.5" y1="7.5" x2="7" y2="9.5" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="22.5" y1="7.5" x2="19" y2="9.5" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="3.5" y1="18.5" x2="7" y2="16.5" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <line x1="22.5" y1="18.5" x2="19" y2="16.5" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <path
      d="M13 8.5L14.5 12H18L15 14.2L16 17.5L13 15.5L10 17.5L11 14.2L8 12H11.5L13 8.5Z"
      fill={color}
      fillOpacity="0.95"
    />
  </svg>
);

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
  { role: "user" as const, text: "I've got 10 minutes — something fast and competitive?" },
  {
    role: "ai" as const,
    text: "Try **Robo Wars** quick queue (~6 min) or **Pulse Drift** for 3-min runs.",
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
            <span className="flex items-center gap-1.5 font-mono text-xs tracking-[0.2em] text-[hsl(278_100%_82%)] uppercase">
              <KultAIIcon size={12} /> AI Concierge
            </span>
          </div>
          <h2 className="mb-3 flex items-center justify-center gap-3 font-display text-3xl font-black tracking-tight md:gap-4 md:text-5xl">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsl(278_100%_75%/0.22)] bg-gradient-to-br from-[hsl(278_100%_70%/0.22)] to-[hsl(270_82%_52%/0.14)] md:h-14 md:w-14">
              <KultAIIcon size={28} />
            </span>
            <span className="text-white">KULT</span>
            <span className="text-[hsl(278_100%_82%)]">AI</span>
          </h2>
          <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
            Your game-night co-pilot — find the right match, compare titles, and jump in fast.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-5 lg:grid-cols-2 lg:gap-6">
          {/* Left — chat console */}
          <div className="glass-panel flex min-h-[520px] flex-col rounded-2xl border border-[hsl(278_100%_70%/0.18)] p-4 sm:min-h-[560px] sm:p-5">
            <AnimatePresence>
              {chatOpen && messages.length > 0 && (
                <div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="overflow-hidden rounded-xl border border-[hsl(278_100%_70%/0.2)] bg-card/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between border-b border-[hsl(278_100%_70%/0.15)] bg-[hsl(278_100%_70%/0.06)] px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="live-dot h-2 w-2 rounded-full bg-[hsl(278_100%_82%)]" />
                        <KultAIIcon size={12} />
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
                    <div className="scrollbar-none max-h-[min(42vh,360px)] overflow-y-auto">
                      <div className="space-y-3 p-4">
                        {messages.map((msg, i) => (
                          <div
                            key={msg.id}
                            initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            {msg.role === "ai" && (
                              <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[hsl(278_100%_75%/0.18)] bg-[hsl(278_100%_70%/0.14)]">
                                <KultAIIcon size={14} />
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
                          </div>
                        ))}
                        {isWaitingForFirstChunk && (
                          <div className="flex gap-2.5">
                            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-[hsl(278_100%_75%/0.18)] bg-[hsl(278_100%_70%/0.14)]">
                              <KultAIIcon size={14} />
                            </div>
                            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[hsl(278_100%_70%/0.2)] bg-muted/30 px-3.5 py-2.5">
                              {[0, 0.2, 0.4].map((delay) => (
                                <div
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
                </div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="mb-4 shrink-0">
              <div className="relative overflow-hidden rounded-xl border border-[hsl(278_100%_70%/0.2)] bg-card/50 p-1.5 backdrop-blur-sm">
                <div className="relative flex items-center gap-2 rounded-lg bg-muted/20 px-3 py-2.5 sm:px-4 sm:py-3">
                  <KultAIIcon size={18} />
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

            <div className="mb-4 grid flex-1 auto-rows-fr grid-cols-1 gap-2 sm:grid-cols-2">
              {prompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt.text}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="group flex h-full min-h-[72px] w-full items-start gap-2.5 rounded-xl border border-border/50 bg-card/40 p-3 text-left backdrop-blur-sm transition-all hover:border-[hsl(278_100%_70%/0.35)] hover:bg-[hsl(278_100%_70%/0.06)]"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(278_100%_70%/0.12)] group-hover:bg-[hsl(278_100%_70%/0.18)]">
                    <prompt.icon className="h-4 w-4 text-[hsl(278_100%_82%)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold leading-snug text-foreground group-hover:text-[hsl(278_100%_82%)]">
                      {prompt.text}
                    </span>
                    <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                      {prompt.description}
                    </span>
                  </div>
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-[hsl(278_100%_82%)]" />
                </button>
              ))}
            </div>

            <div className="mt-auto grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
              {capabilities.map((cap) => (
                <div
                  key={cap.label}
                  className="flex min-h-[64px] flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-background/40 px-2 py-2 text-center"
                >
                  <cap.icon className="mb-1 h-3.5 w-3.5 text-neon-cyan" />
                  <p className="font-display text-[9px] font-bold leading-tight tracking-wide text-foreground">
                    {cap.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — live console (equal height) */}
          <aside className="flex min-h-[520px] flex-col sm:min-h-[560px]">
            <div className="glass-panel flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[hsl(278_100%_70%/0.18)]">
              <div className="relative flex min-h-[200px] flex-1 flex-col bg-[hsl(268_32%_8%/0.6)] sm:min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activePanel.src}
                    src={activePanel.src}
                    alt={activePanel.label}
                    className="absolute inset-0 m-auto max-h-full max-w-full object-contain p-4 sm:p-6"
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
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[hsl(268_32%_8%)] to-transparent px-4 pb-4 pt-10">
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
                <div className="mb-2 flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-neon-purple" />
                  <span className="font-display text-[10px] tracking-[0.22em] text-muted-foreground">
                    SAMPLE SESSION
                  </span>
                </div>
                <div className="space-y-2">
                  {previewThread.map((line, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg px-3 py-2 text-[11px] leading-relaxed",
                        line.role === "user"
                          ? "ml-4 border border-neon-purple/20 bg-neon-purple/10 text-foreground sm:ml-8"
                          : "mr-2 border border-white/[0.08] bg-background/50 text-muted-foreground sm:mr-6"
                      )}
                    >
                      {line.role === "ai" ? <KultAIMessageContent text={line.text} /> : line.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-1.5 border-t border-white/[0.06] p-2.5">
                <button
                  type="button"
                  onClick={() => navigate("/games")}
                  className="btn-eye-outline flex flex-1 items-center justify-center gap-1 px-2.5 py-2 font-display text-[9px] font-bold tracking-wider"
                >
                  <Gamepad2 className="h-3.5 w-3.5" /> GAMES
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/ai-arena")}
                  className="btn-eye-outline flex flex-1 items-center justify-center gap-1 px-2.5 py-2 font-display text-[9px] font-bold tracking-wider"
                >
                  <Swords className="h-3.5 w-3.5" /> ARENA
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/leaderboard")}
                  className="btn-eye-outline flex flex-1 items-center justify-center gap-1 px-2.5 py-2 font-display text-[9px] font-bold tracking-wider"
                >
                  <Trophy className="h-3.5 w-3.5" /> RANKS
                </button>
              </div>
            </div>

            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[9px] text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span>Powered by 0G inference — live game & arena context</span>
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default AIConcierge;
