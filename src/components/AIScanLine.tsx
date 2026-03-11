import { motion } from "framer-motion";

interface AIScanLineProps {
  className?: string;
}

const AIScanLine = ({ className = "" }: AIScanLineProps) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        className="absolute left-0 right-0 h-[1px]"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(195 100% 50% / 0.5), hsl(195 60% 70% / 0.3), transparent)",
          boxShadow: "0 0 20px 4px hsl(195 100% 50% / 0.15)",
        }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
};

export default AIScanLine;
