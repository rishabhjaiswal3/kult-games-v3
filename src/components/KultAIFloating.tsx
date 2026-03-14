import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, User, Loader2, Sparkles, MessageSquare, GitCompare, Gamepad2, ArrowRight, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import KultAIMessageContent from "@/components/KultAIMessageContent";
import KultAIThinking from "@/components/KultAIThinking";
import { useKultAIChat } from "@/hooks/useKultAIChat";

const quickPrompts = [
  { icon: Sparkles, text: "Find my first game" },
  { icon: MessageSquare, text: "Pick based on my vibe" },
  { icon: GitCompare, text: "Compare games for me" },
  { icon: Gamepad2, text: "What's trending on 0G?" },
];

const KultAIFloating = () => {
  const [open, setOpen] = useState(false);
  const { error, input, isStreaming, isWaitingForFirstChunk, messages, sendMessage, setInput } = useKultAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const visibleMessages = messages.filter(
    (message) => message.role === "user" || message.text.trim().length > 0 || message.state !== "streaming",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 btn-eye flex items-center justify-center transition-shadow"
          >
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer hexagon ring */}
                <path d="M13 2L22.5 7.5V18.5L13 24L3.5 18.5V7.5L13 2Z" stroke="white" strokeWidth="1.2" strokeOpacity="0.6" fill="none"/>
                {/* Inner circuit lines */}
                <line x1="13" y1="2" x2="13" y2="6" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
                <line x1="13" y1="20" x2="13" y2="24" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
                <line x1="3.5" y1="7.5" x2="7" y2="9.5" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
                <line x1="22.5" y1="7.5" x2="19" y2="9.5" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
                <line x1="3.5" y1="18.5" x2="7" y2="16.5" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
                <line x1="22.5" y1="18.5" x2="19" y2="16.5" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
                {/* Center spark / AI symbol */}
                <path d="M13 8.5L14.5 12H18L15 14.2L16 17.5L13 15.5L10 17.5L11 14.2L8 12H11.5L13 8.5Z" fill="white" fillOpacity="0.95"/>
              </svg>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[hsl(278_100%_82%/0.35)]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden border border-primary/20 flex flex-col"
            style={{
              maxHeight: "min(620px, calc(100vh - 6rem))",
              background: "linear-gradient(180deg, hsl(265 48% 10%) 0%, hsl(220 45% 8%) 100%)",
              boxShadow: "0 25px 60px -12px hsl(270 82% 25% / 0.38), 0 0 0 1px hsl(278 100% 75% / 0.12), 0 0 40px hsl(270 82% 58% / 0.12), inset 0 1px 0 0 hsl(278 100% 82% / 0.08)",
            }}
          >
            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-border/40 flex-shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(278_100%_70%/0.12)] via-[hsl(270_82%_52%/0.08)] to-transparent" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(278_100%_70%/0.22)] to-[hsl(270_82%_52%/0.14)] flex items-center justify-center border border-[hsl(278_100%_75%/0.18)]" style={{ boxShadow: "0 0 15px hsl(270 82% 58% / 0.18)" }}>
                  <svg width="20" height="20" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 2L22.5 7.5V18.5L13 24L3.5 18.5V7.5L13 2Z" stroke="hsl(278,100%,82%)" strokeWidth="1.2" strokeOpacity="0.7" fill="none"/>
                      <line x1="13" y1="2" x2="13" y2="6" stroke="hsl(278,100%,82%)" strokeWidth="1" strokeOpacity="0.4"/>
                      <line x1="13" y1="20" x2="13" y2="24" stroke="hsl(278,100%,82%)" strokeWidth="1" strokeOpacity="0.4"/>
                      <line x1="3.5" y1="7.5" x2="7" y2="9.5" stroke="hsl(278,100%,82%)" strokeWidth="1" strokeOpacity="0.4"/>
                      <line x1="22.5" y1="7.5" x2="19" y2="9.5" stroke="hsl(278,100%,82%)" strokeWidth="1" strokeOpacity="0.4"/>
                      <line x1="3.5" y1="18.5" x2="7" y2="16.5" stroke="hsl(278,100%,82%)" strokeWidth="1" strokeOpacity="0.4"/>
                      <line x1="22.5" y1="18.5" x2="19" y2="16.5" stroke="hsl(278,100%,82%)" strokeWidth="1" strokeOpacity="0.4"/>
                      <path d="M13 8.5L14.5 12H18L15 14.2L16 17.5L13 15.5L10 17.5L11 14.2L8 12H11.5L13 8.5Z" fill="hsl(278,100%,82%)" fillOpacity="0.95"/>
                    </svg>
                </div>
                <div>
                  <span className="text-sm font-display font-bold text-foreground tracking-wide block" style={{ textShadow: "0 0 18px hsl(270 82% 58% / 0.3)" }}>KULT AI</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[hsl(278_100%_82%)]" style={{ boxShadow: "0 0 6px hsl(278 100% 82%)" }} />
                    <span className="text-[10px] text-muted-foreground">Powered by 0G Compute</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="relative z-10 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted/50">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none">
              <div className="p-5 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(278_100%_70%/0.2)] to-[hsl(270_82%_52%/0.12)] flex items-center justify-center mx-auto mb-4 border border-[hsl(278_100%_75%/0.16)]"
                      style={{ boxShadow: "0 0 20px hsl(270 82% 58% / 0.15)" }}
                    >
                      <Sparkles className="w-7 h-7 text-[hsl(278_100%_82%)]" />
                    </motion.div>
                    <p className="text-base font-display font-bold text-foreground mb-1">Hey there! 👋</p>
                    <p className="text-xs text-muted-foreground mb-6">Ask me anything about KULT games</p>
                    <div className="space-y-2.5">
                      {quickPrompts.map((p, i) => (
                        <motion.button
                          key={p.text}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.05 }}
                          onClick={() => {
                            void sendMessage(p.text);
                          }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-[16px] bg-muted/20 hover:bg-[hsl(278_100%_70%/0.08)] border border-border/30 hover:border-[hsl(278_100%_70%/0.28)] hover:shadow-[0_0_10px_hsl(270_82%_58%/0.12)] transition-all text-left group"
                      >
                          <div className="w-8 h-8 rounded-[16px] bg-[hsl(278_100%_70%/0.12)] flex items-center justify-center group-hover:bg-[hsl(278_100%_70%/0.18)] transition-colors flex-shrink-0">
                            <p.icon className="w-4 h-4 text-[hsl(278_100%_82%)]" />
                          </div>
                          <span className="text-xs text-foreground font-medium">{p.text}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[hsl(278_100%_82%)] ml-auto transition-colors group-hover:translate-x-0.5 transform" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {visibleMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "ai" && (
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(278_100%_70%/0.22)] to-[hsl(270_82%_52%/0.14)] flex items-center justify-center flex-shrink-0 mt-0.5 border border-[hsl(278_100%_75%/0.16)]">
                        <Bot className="w-3.5 h-3.5 text-[hsl(278_100%_82%)]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "btn-eye text-white rounded-br-md shadow-[0_2px_15px_hsl(270_82%_58%/0.25)]"
                          : msg.state === "error"
                            ? "bg-[hsl(0_72%_50%/0.08)] text-foreground border border-[hsl(0_80%_60%/0.2)] rounded-bl-md"
                            : "bg-muted/40 text-foreground border border-border/30 rounded-bl-md"
                      }`}
                    >
                      {msg.role === "ai" ? <KultAIMessageContent text={msg.text} /> : msg.text}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-border/30">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isWaitingForFirstChunk && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[hsl(278_100%_70%/0.22)] to-[hsl(270_82%_52%/0.14)] flex items-center justify-center flex-shrink-0 border border-[hsl(278_100%_75%/0.16)]">
                      <Bot className="w-3.5 h-3.5 text-[hsl(278_100%_82%)]" />
                    </div>
                    <KultAIThinking compact />
                  </motion.div>
                )}
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-[hsl(0_80%_60%/0.16)] bg-[hsl(0_72%_50%/0.06)] px-3 py-2 text-[11px] text-[hsl(0_100%_88%)]">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border/40 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask KULT AI..."
                  className="flex-1 bg-muted/30 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:shadow-[0_0_10px_hsl(195_100%_50%/0.1)] border border-border/30 focus:border-primary/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="w-10 h-10 btn-eye flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KultAIFloating;
