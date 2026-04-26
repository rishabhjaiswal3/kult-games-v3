import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, User, Loader2, Sparkles, MessageSquare, GitCompare, Gamepad2, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import KultAIMessageContent from "@/components/KultAIMessageContent";
import { useKultAIChat } from "@/hooks/useKultAIChat";
import roboLogo from "@/assets/roboLogo.png";

const quickPrompts = [
  { icon: Sparkles, text: "Find my first game" },
  { icon: MessageSquare, text: "Pick based on my vibe" },
  { icon: GitCompare, text: "Compare games for me" },
  { icon: Gamepad2, text: "What's trending on 0G?" },
];

const KultAIFloating = () => {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { error, input, isStreaming, isWaitingForFirstChunk, messages, sendMessage, setInput } = useKultAIChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage();
  };

  return (
    <>
      {/* Floating Button — glass hexagonal style */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center group"
            style={{
              background: "linear-gradient(145deg, hsl(265 48% 12%), hsl(220 45% 8%))",
              border: "1px solid hsl(270 80% 60% / 0.35)",
              borderRadius: "18px",
              boxShadow:
                "0 8px 32px hsl(270 82% 20% / 0.4), 0 0 20px hsl(270 82% 58% / 0.15), inset 0 1px 0 hsl(278 100% 82% / 0.1)",
            }}
          >
            {/* Pulsing ring */}
            <motion.div
              className="absolute inset-0"
              style={{ borderRadius: "18px", border: "1.5px solid hsl(270 80% 65% / 0.3)" }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            {/* Inner glow */}
            <div
              className="absolute inset-[3px]"
              style={{
                borderRadius: "15px",
                background: "radial-gradient(circle at 50% 30%, hsl(270 82% 58% / 0.2), transparent 70%)",
              }}
            />
            <img src={roboLogo} alt="KULT AI" className="relative z-10 h-8 w-8 object-contain drop-shadow-[0_0_14px_hsl(195_100%_60%/0.35)]" />
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
                  <img src={roboLogo} alt="KULT AI" className="h-6 w-6 object-contain" />
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
                          onClick={() => void sendMessage(p.text)}
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

                {messages.map((msg) => (
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
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words ${
                        msg.role === "user"
                          ? "btn-eye text-white rounded-br-md whitespace-pre-wrap shadow-[0_2px_15px_hsl(270_82%_58%/0.25)]"
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
                    <div className="bg-muted/40 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-[hsl(278_100%_82%/0.7)]" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-[hsl(278_100%_82%/0.7)]" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-[hsl(278_100%_82%/0.7)]" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border/40 flex-shrink-0">
              {error && (
                <p className="mb-3 text-xs text-destructive/80">
                  {error}
                </p>
              )}
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
