import { motion } from "framer-motion";
import { Bot, ArrowRight, Sparkles, MessageSquare, GitCompare, Gamepad2 } from "lucide-react";

const prompts = [
  { icon: Sparkles, text: "Find my first game", description: "AI picks the best starting point for you" },
  { icon: MessageSquare, text: "Pick based on my vibe", description: "Tell us your mood, we'll match a game" },
  { icon: GitCompare, text: "Compare games for me", description: "Side-by-side AI analysis of any two titles" },
  { icon: Gamepad2, text: "What's trending on 0G?", description: "See what the community is playing now" },
];

const AIConcierge = () => {
  return (
    <section className="relative py-24 z-10">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-6 glow-border">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              KULT <span className="gradient-text">AI</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
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
            <div className="glass-panel rounded-2xl p-1.5 gradient-border">
              <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-muted/30">
                <Bot className="w-5 h-5 text-primary flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Ask anything — &quot;Which game fits a 10-minute break?&quot;"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none font-body"
                />
                <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display text-xs font-semibold tracking-wider hover:shadow-[0_0_20px_hsl(185_85%_55%/0.3)] transition-all">
                  ASK
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
                whileHover={{ scale: 1.02 }}
                className="group flex items-center gap-4 p-4 rounded-xl glass-panel hover:bg-muted/40 transition-all duration-300 text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
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
