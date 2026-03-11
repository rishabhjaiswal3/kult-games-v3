import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlitchTextProps {
  children: ReactNode;
  className?: string;
}

const GlitchText = ({ children, className = "" }: GlitchTextProps) => {
  return (
    <motion.span
      className={`relative inline-block ${className}`}
      animate={{
        textShadow: [
          "0 0 0 transparent",
            "2px 0 hsl(195 100% 50% / 0.3), -2px 0 hsl(195 60% 70% / 0.3)",
            "0 0 0 transparent",
            "-1px 0 hsl(195 100% 50% / 0.2), 1px 0 hsl(195 60% 70% / 0.2)",
          "0 0 0 transparent",
        ],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "linear",
        times: [0, 0.1, 0.12, 0.9, 1],
      }}
    >
      {children}
    </motion.span>
  );
};

export default GlitchText;
