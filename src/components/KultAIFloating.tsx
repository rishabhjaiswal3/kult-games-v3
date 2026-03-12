import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, User, Loader2, Sparkles, MessageSquare, GitCompare, Gamepad2, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
}

const quickPrompts = [
  { icon: Sparkles, text: "Find my first game" },
  { icon: MessageSquare, text: "Pick based on my vibe" },
  { icon: GitCompare, text: "Compare games for me" },
  { icon: Gamepad2, text: "What's trending on 0G?" },
];

const mockResponses: Record<string, string> = {
  "find my first game": "🎮 Based on new player data, I'd recommend **Spell Conquest** — it's our most beginner-friendly title with a 94% retention rate. Want me to launch it for you?",
  "pick based on my vibe": "🎭 Tell me your mood!\n\n• **Competitive** → Arena Clash\n• **Chill** → Mystic Realms\n• **Strategic** → Hex Dominion\n• **Social** → Guild Wars Lite",
  "compare games for me": "⚔️ **Spell Conquest** vs **Arena Clash**\n\n• Genre: RPG vs PvP Fighter\n• Avg Session: 25 min vs 10 min\n• Rating: 4.8⭐ vs 4.6⭐\n\nSpell Conquest for story, Arena Clash for competition.",
  "what's trending on 0g?": "🔥 **Trending now:**\n\n1. **Hex Dominion** — 12.4K players (+34%)\n2. **Spell Conquest** — 9.8K (new expansion!)\n3. **Arena Clash** — 8.2K (tournament season)\n4. **Shadow Protocol** — 5.7K (just launched!)",
};

const fallbackResponses = [
  "🤔 I'd suggest **Spell Conquest** for RPG or **Arena Clash** for PvP. Want more details?",
  "🎯 Our AI suggests **Mystic Realms** — 87% of players call it 'addictive'. Shall I tell you more?",
  "⚡ Best picks:\n• **Solo**: Spell Conquest\n• **Multiplayer**: Guild Wars Lite\n• **Innovative**: Shadow Protocol",
  "🧠 **Hex Dominion** has the highest satisfaction this month (4.9/5). Want a preview?",
  "🌟 Top 3 picks:\n1. **Shadow Protocol** — stealth + strategy\n2. **Hex Dominion** — tactical depth\n3. **Arena Clash** — adrenaline battles",
  "🎮 Players with similar questions love **Mystic Realms** (78% match). 200+ hours of content!",
  "💡 Analytics:\n• Most played: Hex Dominion\n• Highest rated: Spell Conquest (4.8⭐)\n• Fastest growing: Shadow Protocol (+156%)",
  "🔮 High narrative picks:\n1. **Spell Conquest** — Epic fantasy\n2. **Mystic Realms** — Mystery exploration\n3. **Shadow Protocol** — Cyberpunk thriller",
  "⚔️ By time:\n**10 min** → Arena Clash\n**30 min** → Hex Dominion\n**1 hour+** → Spell Conquest",
  "🏆 Hot now:\n• Tournament: Arena Clash Championship (5000 $KULT)\n• New: Shadow Protocol v2.0\n• Community Pick: Hex Dominion #1",
  "🎲 Tell me: Solo or multiplayer? Competitive or casual? Story or gameplay? I'll find your match!",
  "🌌 **Mystic Realms** new zone 'Ethereal Depths' — 4.9⭐ from 2.3K players. Want me to set you up?",
  "🛡️ Pro tip: **Guild Wars Lite** is a 'sampler platter' combining RPG, PvP, and strategy elements!",
  "📊 Engagement scores:\n1. Spell Conquest — 94/100\n2. Hex Dominion — 91/100\n3. Shadow Protocol — 89/100",
  "🎪 **Like Fortnite?** → Arena Clash\n**Like Civilization?** → Hex Dominion\n**Like Skyrim?** → Spell Conquest",
  "⚡ All KULT games support cross-platform play! Start on desktop, continue on mobile.",
];

let fallbackIndex = 0;

const getAIResponse = (input: string): string => {
  const lower = input.toLowerCase().trim();
  for (const [key, value] of Object.entries(mockResponses)) {
    if (lower.includes(key) || key.includes(lower)) return value;
  }
  return fallbackResponses[fallbackIndex++ % fallbackResponses.length];
};

const KultAIFloating = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: text.trim() }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: getAIResponse(text) }]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
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
                          onClick={() => sendMessage(p.text)}
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
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "btn-eye text-white rounded-br-md shadow-[0_2px_15px_hsl(270_82%_58%/0.25)]"
                          : "bg-muted/40 text-foreground border border-border/30 rounded-bl-md"
                      }`}
                    >
                      {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5 border border-border/30">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isTyping && (
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
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 btn-eye flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
