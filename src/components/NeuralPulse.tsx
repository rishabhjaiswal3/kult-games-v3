import { motion } from "framer-motion";

interface NeuralPulseProps {
  className?: string;
}

const NeuralPulse = ({ className = "" }: NeuralPulseProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Large expanding cyan pulse ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          border: "1px solid hsl(195 100% 60% / 0.15)",
          boxShadow: "0 0 30px hsl(195 100% 60% / 0.08), inset 0 0 30px hsl(195 100% 60% / 0.05)",
        }}
        animate={{
          width: ["200px", "800px", "200px"],
          height: ["200px", "800px", "200px"],
          opacity: [0.4, 0, 0.4],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeOut" }}
      />

      {/* Pulsing neural rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 200 + i * 150,
            height: 200 + i * 150,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            border: `1px solid hsl(195 100% 60% / ${0.15 - i * 0.03})`,
            boxShadow: `0 0 ${20 - i * 5}px hsl(195 100% 60% / ${0.08 - i * 0.02})`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: 4 + i * 1.5,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Purple pulse ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          border: "1px solid hsl(270 80% 65% / 0.1)",
          boxShadow: "0 0 20px hsl(270 80% 65% / 0.06)",
        }}
        animate={{
          width: ["100px", "600px", "100px"],
          height: ["100px", "600px", "100px"],
          opacity: [0.3, 0, 0.3],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeOut", delay: 2 }}
      />

      {/* Data pulse dots traveling along rings */}
      {[0, 1].map((i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: "50%",
            top: "50%",
            background: "hsl(195 100% 60%)",
            boxShadow: "0 0 10px hsl(195 100% 60% / 0.8), 0 0 20px hsl(195 100% 60% / 0.4)",
          }}
          animate={{
            x: [0, 150, 0, -150, 0],
            y: [-150, 0, 150, 0, -150],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            delay: i * 3,
            ease: "linear",
          }}
        />
      ))}

      {/* Corner energy spark nodes */}
      {[
        { x: "10%", y: "15%" },
        { x: "85%", y: "25%" },
        { x: "20%", y: "80%" },
        { x: "90%", y: "75%" },
      ].map((pos, i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute w-[3px] h-[3px] rounded-full"
          style={{
            left: pos.x,
            top: pos.y,
            background: "hsl(195 100% 60%)",
            boxShadow: "0 0 10px hsl(195 100% 60% / 0.6), 0 0 20px hsl(195 100% 60% / 0.3)",
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 2, 0.5],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default NeuralPulse;
