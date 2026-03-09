import { motion } from "framer-motion";
import { Bot, ArrowRight, Sparkles, MessageSquare, GitCompare, Gamepad2, Brain } from "lucide-react";

const prompts = [
  { icon: Sparkles, text: "Find my first game", description: "AI picks the best starting point for you" },
  { icon: MessageSquare, text: "Pick based on my vibe", description: "Tell us your mood, we'll match a game" },
  { icon: GitCompare, text: "Compare games for me", description: "Side-by-side AI analysis of any two titles" },
  { icon: Gamepad2, text: "What's trending on 0G?", description: "See what the community is playing now" },
];

const AIConcierge = () => {
  return (
    <section className="relative py-24 z-10">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/25 mb-6 relative"
              whileHover={{ scale: 1.1 }}
            >
              <Brain className="w-8 h-8 text-primary" />
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{ boxShadow: "0 0 20px hsl(269 62% 52% / 0.2)" }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <h2 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
              KULT <span className="gradient-text">AI</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              Your AI-native game concierge. Discover, compare, and decide — powered by 0G Compute.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative mb-10"
          >
            <div className="glass-panel rounded-2xl p-1.5 gradient-border relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent pointer-events-none"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-muted/30 relative">
                <Bot className="w-5 h-5 text-primary flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Ask anything — &quot;Which game fits a 10-minute break?&quot;"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none font-body"
                />
                <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-display text-xs font-semibold tracking-wider hover:shadow-[0_0_20px_hsl(269_62%_52%/0.3)] transition-all relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/10 to-transparent"
                    animate={{ x: ["-200%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative z-10">ASK KULT AI</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Prompt suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prompts.map((prompt, i) => (
              <motion.button
                key={prompt.text}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="group flex items-center gap-4 p-4 rounded-xl glass-panel hover:bg-muted/40 hover:border-primary/20 transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/15 to-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:from-primary/25 group-hover:to-secondary/15 transition-all">
                  <prompt.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground block">{prompt.text}</span>
                  <span className="text-xs text-muted-foreground">{prompt.description}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIConcierge;
