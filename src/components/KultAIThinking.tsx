import { motion } from "framer-motion";

const dots = [0, 1, 2];

const KultAIThinking = ({ compact = false }: { compact?: boolean }) => (
  <div className="relative overflow-hidden rounded-2xl rounded-bl-md border border-[hsl(278_100%_70%/0.2)] bg-[linear-gradient(135deg,hsl(278_100%_70%/0.08),hsl(195_100%_50%/0.04),transparent)] px-4 py-3">
    <motion.div
      className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-[hsl(278_100%_82%/0.12)] to-transparent"
      animate={{ x: ["0%", "320%"] }}
      transition={{ duration: compact ? 2.8 : 3.4, ease: "linear", repeat: Infinity }}
    />
    <div className="relative flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        {dots.map((dot) => (
          <motion.div
            key={dot}
            className="h-1.5 w-1.5 rounded-full bg-[hsl(278_100%_82%)]"
            animate={{ opacity: [0.35, 1, 0.35], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.15 }}
          />
        ))}
      </div>
      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[hsl(278_100%_82%/0.72)]">
        Syncing 0G knowledge
      </span>
    </div>
  </div>
);

export default KultAIThinking;
