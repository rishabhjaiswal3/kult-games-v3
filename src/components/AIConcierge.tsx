import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowRight, Sparkles, MessageSquare, GitCompare, Gamepad2, Brain, Send, X, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import AIScanLine from "@/components/AIScanLine";

const prompts = [
  { icon: Sparkles, text: "Find my first game", description: "AI picks the best starting point for you" },
  { icon: MessageSquare, text: "Pick based on my vibe", description: "Tell us your mood, we'll match a game" },
  { icon: GitCompare, text: "Compare games for me", description: "Side-by-side AI analysis of any two titles" },
  { icon: Gamepad2, text: "What's trending on 0G?", description: "See what the community is playing now" },
];

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
}

const mockResponses: Record<string, string> = {
  "find my first game": "🎮 Based on new player data, I'd recommend **Spell Conquest** — it's our most beginner-friendly title with a 94% retention rate among first-time players. The tutorial is seamless, and you'll be casting spells within 2 minutes. Want me to launch it for you?",
  "pick based on my vibe": "🎭 Tell me more about your mood! Are you feeling:\n\n• **Competitive** → Try Arena Clash\n• **Chill & exploratory** → Mystic Realms is perfect\n• **Strategic & cerebral** → Hex Dominion awaits\n• **Social & party** → Guild Wars Lite\n\nJust type your vibe and I'll narrow it down!",
  "compare games for me": "⚔️ Sure! Here's a quick comparison of our top 2 titles:\n\n**Spell Conquest** vs **Arena Clash**\n\n| Feature | Spell Conquest | Arena Clash |\n|---------|---------------|-------------|\n| Genre | RPG/Strategy | PvP Fighter |\n| Avg Session | 25 min | 10 min |\n| Difficulty | Medium | Hard |\n| Rating | 4.8⭐ | 4.6⭐ |\n\nSpell Conquest is better for story lovers, Arena Clash for quick competitive rounds.",
  "what's trending on 0g?": "🔥 **Trending on 0G right now:**\n\n1. **Hex Dominion** — 12.4K active players (+34% this week)\n2. **Spell Conquest** — 9.8K active (new expansion dropped!)\n3. **Arena Clash** — 8.2K active (tournament season)\n4. **Mystic Realms** — 6.1K active\n5. **Shadow Protocol** — 5.7K active (just launched!)\n\nHex Dominion is surging thanks to the new ranked mode. Want details on any of these?",
};

const fallbackResponses = [
  "🤔 Interesting question! Based on our game catalog, I'd suggest checking out **Spell Conquest** for an immersive RPG experience or **Arena Clash** if you prefer fast-paced PvP action. Want more specific recommendations?",
  "🎯 Great question! Our AI analysis suggests you might enjoy **Mystic Realms** — it's got a unique blend of exploration and puzzle-solving that 87% of players rated as 'addictive'. Shall I tell you more?",
  "⚡ I've analyzed your query against our game database. Here's what I found:\n\n• **Best for solo play**: Spell Conquest\n• **Best multiplayer**: Guild Wars Lite\n• **Most innovative**: Shadow Protocol\n\nWant me to dive deeper into any of these?",
  "🧠 Processing your request through 0G Compute... Based on community sentiment analysis, **Hex Dominion** has the highest satisfaction score this month (4.9/5). It combines strategy with real-time elements. Would you like a gameplay preview?",
];

let fallbackIndex = 0;

const getAIResponse = (input: string): string => {
  const lower = input.toLowerCase().trim();
  for (const [key, value] of Object.entries(mockResponses)) {
    if (lower.includes(key) || key.includes(lower)) {
      return value;
    }
  }
  const response = fallbackResponses[fallbackIndex % fallbackResponses.length];
  fallbackIndex++;
  return response;
};

const AIConcierge = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiText = getAIResponse(text);
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handlePromptClick = (text: string) => {
    if (!chatOpen) setChatOpen(true);
    setTimeout(() => sendMessage(text), 100);
  };

  return (
    <section className="relative py-24 z-10 overflow-hidden">
      {/* Background video like leaderboard */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-[0.06]">
        <source src="/videos/SC_12-4.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/85" />
      <AIScanLine />

      {/* Ambient glows — leaderboard style */}
      <div className="absolute top-40 left-1/4 w-[500px] h-[400px] rounded-full bg-neon-cyan/4 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[300px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-neon-purple/3 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <motion.div
                className="w-2 h-2 rounded-full bg-neon-cyan"
                animate={{ opacity: [1, 0.3, 1], boxShadow: ["0 0 4px hsl(195 100% 60%)", "0 0 15px hsl(195 100% 60%)", "0 0 4px hsl(195 100% 60%)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-mono text-neon-cyan tracking-[0.2em] uppercase">
                <Brain className="w-3 h-3 inline mr-1" /> AI Concierge
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              KULT <span className="gradient-text glow-text">AI</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Your AI-native game concierge. Discover, compare, and decide — powered by 0G Compute.
            </p>
          </motion.div>

          {/* Chat Area */}
          <AnimatePresence>
            {chatOpen && messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="rounded-xl border border-neon-cyan/20 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" style={{ boxShadow: "0 0 6px hsl(150 100% 50%)" }} />
                      <span className="text-[10px] font-mono text-muted-foreground tracking-wider">KULT AI — ONLINE</span>
                    </div>
                    <button
                      onClick={() => { setChatOpen(false); setMessages([]); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <ScrollArea className="h-[400px]">
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
                            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0 mt-1">
                              <Bot className="w-4 h-4 text-neon-cyan" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                              msg.role === "user"
                                ? "bg-neon-cyan text-background rounded-br-md shadow-[0_2px_15px_hsl(195_100%_60%/0.2)]"
                                : "bg-muted/30 text-foreground border border-border/30 rounded-bl-md"
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
                            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-1 border border-border/30">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {isTyping && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-neon-cyan" />
                          </div>
                          <div className="bg-muted/30 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                            <motion.div className="w-2 h-2 rounded-full bg-neon-cyan/60" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                            <motion.div className="w-2 h-2 rounded-full bg-neon-cyan/60" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                            <motion.div className="w-2 h-2 rounded-full bg-neon-cyan/60" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search bar — leaderboard-matched card style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative mb-10"
          >
            <form onSubmit={handleSubmit}>
              <div className="rounded-xl border border-neon-cyan/20 bg-card/50 backdrop-blur-sm p-1.5 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan/6 to-transparent pointer-events-none"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
                <div className="flex items-center gap-3 px-5 py-4 rounded-lg bg-muted/20 relative">
                  <Bot className="w-5 h-5 text-neon-cyan flex-shrink-0" />
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
                    disabled={!input.trim() || isTyping}
                    className="px-5 py-2.5 rounded-lg bg-neon-cyan text-background font-display text-xs font-semibold tracking-wider hover:shadow-[0_0_20px_hsl(195_100%_60%/0.3)] transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isTyping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span className="relative z-10">ASK KULT AI</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Prompt suggestions — leaderboard row style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prompts.map((prompt, i) => (
              <motion.button
                key={prompt.text}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileHover={{ scale: 1.02, y: -2 }}
                onClick={() => handlePromptClick(prompt.text)}
                className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-neon-cyan/30 hover:bg-neon-cyan/3 transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 flex items-center justify-center flex-shrink-0 group-hover:bg-neon-cyan/20 transition-all">
                  <prompt.icon className="w-4 h-4 text-neon-cyan" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block group-hover:text-neon-cyan transition-colors">{prompt.text}</span>
                  <span className="text-xs text-muted-foreground">{prompt.description}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIConcierge;
