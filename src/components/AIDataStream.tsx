import { motion } from "framer-motion";

const AIDataStream = () => {
  const columns = 12;
  const chars = "01アイウエオカキクケコ∞∆Ω≈√∫";
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04] z-0">
      {Array.from({ length: columns }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-0 font-mono text-[10px] text-primary leading-tight whitespace-pre"
          style={{ left: `${(i / columns) * 100}%` }}
          initial={{ y: "-100%" }}
          animate={{ y: "100vh" }}
          transition={{
            duration: 8 + Math.random() * 12,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        >
          {Array.from({ length: 40 }).map((_, j) => (
            <div key={j} style={{ opacity: Math.random() * 0.8 + 0.2 }}>
              {chars[Math.floor(Math.random() * chars.length)]}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export default AIDataStream;
