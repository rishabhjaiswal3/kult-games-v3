import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, MessageSquare, GitCompare, Gamepad2, Send, X, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const KultAIIcon = ({ size = 16, color = "hsl(278,100%,82%)" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L22.5 7.5V18.5L13 24L3.5 18.5V7.5L13 2Z" stroke={color} strokeWidth="1.2" strokeOpacity="0.7" fill="none"/>
    <line x1="13" y1="2" x2="13" y2="6" stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
    <line x1="13" y1="20" x2="13" y2="24" stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
    <line x1="3.5" y1="7.5" x2="7" y2="9.5" stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
    <line x1="22.5" y1="7.5" x2="19" y2="9.5" stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
    <line x1="3.5" y1="18.5" x2="7" y2="16.5" stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
    <line x1="22.5" y1="18.5" x2="19" y2="16.5" stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
    <path d="M13 8.5L14.5 12H18L15 14.2L16 17.5L13 15.5L10 17.5L11 14.2L8 12H11.5L13 8.5Z" fill={color} fillOpacity="0.95"/>
  </svg>
);
import AIScanLine from "@/components/AIScanLine";
import AutoPlayVideo from "@/components/AutoPlayVideo";
import KultAIMessageContent from "@/components/KultAIMessageContent";
import { useKultAIChat } from "@/hooks/useKultAIChat";

const prompts = [
  { icon: Sparkles, text: "Find my first game", description: "AI picks the best starting point for you" },
  { icon: MessageSquare, text: "Pick based on my vibe", description: "Tell us your mood, we'll match a game" },
  { icon: GitCompare, text: "Compare games for me", description: "Side-by-side AI analysis of any two titles" },
  { icon: Gamepad2, text: "What's trending on 0G?", description: "See what the community is playing now" },
];

const AIConcierge = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { clearMessages, error, input, isStreaming, isWaitingForFirstChunk, messages, sendMessage, setInput } = useKultAIChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatOpen) {
      setChatOpen(true);
    }
    void sendMessage();
  };

  const handlePromptClick = (text: string) => {
    if (!chatOpen) {
      setChatOpen(true);
    }
    void sendMessage(text);
  };

  return (
    <section className="relative py-24 z-10 overflow-hidden">
      {/* Background video like leaderboard */}
      <AutoPlayVideo src="/videos/SC_10.mp4" loop className="absolute inset-0 w-full h-full object-cover opacity-[0.08]" />
      <div className="absolute inset-0 bg-background/85" />
      <AIScanLine />

      {/* Ambient glows — leaderboard style */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-neon-purple/3 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <motion.div
                className="w-2 h-2 rounded-full bg-[hsl(278_100%_82%)]"
                animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(278 100% 82%)", "0 0 15px hsl(278 100% 82%)", "0 0 4px hsl(278 100% 82%)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-mono text-[hsl(278_100%_82%)] tracking-[0.2em] uppercase flex items-center gap-1">
                <KultAIIcon size={12} /> AI Concierge
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4 flex items-center justify-center gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[hsl(278_100%_70%/0.22)] to-[hsl(270_82%_52%/0.14)] border border-[hsl(278_100%_75%/0.22)]" style={{ boxShadow: "0 0 24px hsl(270 82% 58% / 0.22), inset 0 1px 0 hsl(278 100% 82% / 0.12)" }}>
                <KultAIIcon size={28} />
              </span>
              <span className="text-white" style={{ textShadow: "0 0 30px hsl(278 100% 82% / 0.2)" }}>KULT</span>
              <span className="text-[hsl(278_100%_82%)]" style={{ textShadow: "0 0 30px hsl(278 100% 82% / 0.5), 0 0 60px hsl(270 82% 58% / 0.25)" }}>AI</span>
            </h2>
            <p className="text-[hsl(278_100%_82%/0.5)] max-w-lg mx-auto text-sm">
              Your game-night co-pilot — find the right match, compare titles, and jump in fast.
            </p>
          </div>

          {/* Chat Area */}
          <AnimatePresence>
            {chatOpen && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="rounded-xl border border-[hsl(278_100%_70%/0.2)] bg-card/50 backdrop-blur-sm overflow-hidden" style={{ boxShadow: "0 0 30px hsl(270 82% 58% / 0.08), inset 0 1px 0 hsl(278 100% 82% / 0.06)" }}>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[hsl(278_100%_70%/0.15)] bg-[hsl(278_100%_70%/0.06)]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[hsl(278_100%_82%)] animate-pulse" style={{ boxShadow: "0 0 6px hsl(278 100% 82%)" }} />
                      <KultAIIcon size={12} />
                      <span className="text-[10px] font-mono text-[hsl(278_100%_82%/0.7)] tracking-wider">KULT AI — ONLINE</span>
                    </div>
                    <button
                      onClick={() => {
                        setChatOpen(false);
                        clearMessages(true);
                      }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-[400px] overflow-y-auto scrollbar-none">
                    <div className="p-5 space-y-4">
                      {messages.map((msg, i) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.role === "ai" && (
                            <div className="w-8 h-8 rounded-lg bg-[hsl(278_100%_70%/0.14)] flex items-center justify-center flex-shrink-0 mt-1 border border-[hsl(278_100%_75%/0.18)]">
                              <KultAIIcon size={16} />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words ${
                              msg.role === "user"
                                ? "btn-eye text-white rounded-br-md whitespace-pre-wrap shadow-[0_2px_15px_hsl(270_82%_58%/0.25)]"
                                : "bg-muted/30 text-foreground border border-[hsl(278_100%_70%/0.2)] rounded-bl-md"
                            }`}
                          >
                            {msg.role === "ai" ? <KultAIMessageContent text={msg.text} /> : msg.text}
                          </div>
                          {msg.role === "user" && (
                            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-1 border border-border/30">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {isWaitingForFirstChunk && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[hsl(278_100%_70%/0.14)] flex items-center justify-center flex-shrink-0 border border-[hsl(278_100%_75%/0.18)]">
                            <KultAIIcon size={16} />
                          </div>
                          <div className="bg-muted/30 border border-[hsl(278_100%_70%/0.2)] rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                            <motion.div className="w-2 h-2 rounded-full bg-[hsl(278_100%_82%/0.7)]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                            <motion.div className="w-2 h-2 rounded-full bg-[hsl(278_100%_82%/0.7)]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                            <motion.div className="w-2 h-2 rounded-full bg-[hsl(278_100%_82%/0.7)]" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search bar — leaderboard-matched card style */}
          <div className="relative mb-10">
            <form onSubmit={handleSubmit}>
              <div className="rounded-xl border border-[hsl(278_100%_70%/0.2)] bg-card/50 backdrop-blur-sm p-1.5 relative overflow-hidden" style={{ boxShadow: "0 0 30px hsl(270 82% 58% / 0.08)" }}>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(278_100%_70%/0.06)] to-transparent pointer-events-none"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
                <div className="flex items-center gap-3 px-5 py-4 rounded-lg bg-muted/20 relative">
                  <KultAIIcon size={20} />
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => !chatOpen && setChatOpen(true)}
                    placeholder='Ask anything — "Which game fits a 10-minute break?"'
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none font-body"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isStreaming}
                    className="px-5 py-2.5 font-display text-xs font-semibold tracking-wider btn-eye transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isStreaming ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="relative z-10">ASK KULT AI</span>
                  </button>
                </div>
              </div>
            </form>
            {error && (
              <p className="mt-2 px-4 text-xs text-destructive/80">
                {error}
              </p>
            )}
          </div>

          {/* Prompt suggestions — leaderboard row style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prompts.map((prompt) => (
              <button
                type="button"
                key={prompt.text}
                onClick={() => handlePromptClick(prompt.text)}
                className="group flex w-full items-center gap-4 rounded-[16px] border border-border/50 bg-card/50 p-4 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[hsl(278_100%_70%/0.3)] hover:bg-[hsl(278_100%_70%/0.05)]"
              >
                <div className="w-10 h-10 rounded-[16px] bg-[hsl(278_100%_70%/0.12)] flex items-center justify-center flex-shrink-0 group-hover:bg-[hsl(278_100%_70%/0.18)] transition-all">
                  <prompt.icon className="w-4 h-4 text-[hsl(278_100%_82%)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block group-hover:text-[hsl(278_100%_82%)] transition-colors">{prompt.text}</span>
                  <span className="text-xs text-muted-foreground">{prompt.description}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(278_100%_82%)] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIConcierge;
