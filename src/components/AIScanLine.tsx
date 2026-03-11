import { motion } from "framer-motion";

interface AIScanLineProps {
  className?: string;
}

const AIScanLine = ({ className = "" }: AIScanLineProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Primary cyan scan line — bright & visible */}
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(195 100% 60% / 0.7), hsl(195 100% 80% / 0.9), hsl(195 100% 60% / 0.7), transparent)",
          boxShadow: "0 0 15px hsl(195 100% 60% / 0.5), 0 0 30px hsl(195 100% 60% / 0.25), 0 0 60px hsl(195 100% 60% / 0.1)",
        }}
        animate={{ top: ["-2px", "100%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      {/* Secondary purple scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(270 80% 65% / 0.4), transparent)",
          boxShadow: "0 0 10px hsl(270 80% 65% / 0.3)",
        }}
        animate={{ top: ["100%", "-1px"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 3 }}
      />
      {/* Fast flicker line */}
      <motion.div
        className="absolute left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent 20%, hsl(195 100% 70% / 0.5) 50%, transparent 80%)",
        }}
        animate={{
          top: ["30%", "70%", "30%"],
          opacity: [0, 0.8, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
};

export default AIScanLine;
