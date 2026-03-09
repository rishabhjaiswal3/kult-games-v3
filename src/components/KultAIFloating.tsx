import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, User, Loader2, Brain, Sparkles, MessageSquare, GitCompare, Gamepad2, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_hsl(269_62%_52%/0.4)] hover:shadow-[0_0_40px_hsl(269_62%_52%/0.6)] transition-shadow"
          >
            <Brain className="w-6 h-6 text-primary-foreground" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/50"
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
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl overflow-hidden glass-panel border border-primary/20 shadow-[0_0_40px_hsl(269_62%_52%/0.15)] flex flex-col"
            style={{ maxHeight: "min(600px, calc(100vh - 6rem))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-display font-bold text-foreground tracking-wide">KULT AI</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-muted-foreground">Powered by 0G Compute</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">Hey there! 👋</p>
                    <p className="text-xs text-muted-foreground mb-4">Ask me anything about KULT games</p>
                    <div className="space-y-2">
                      {quickPrompts.map((p) => (
                        <button
                          key={p.text}
                          onClick={() => sendMessage(p.text)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-primary/20 transition-all text-left group"
                        >
                          <p.icon className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-xs text-foreground">{p.text}</span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary ml-auto transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "ai" && (
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted/50 text-foreground border border-border/30 rounded-bl-sm"
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
                      <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center flex-shrink-0 mt-1 border border-border/30">
                        <User className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                    <div className="bg-muted/50 border border-border/30 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1">
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-primary/60" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-primary/60" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-primary/60" animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-border/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask KULT AI..."
                  className="flex-1 bg-muted/30 rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/50 border border-border/30"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:shadow-[0_0_15px_hsl(269_62%_52%/0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
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
