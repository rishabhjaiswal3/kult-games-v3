import { motion } from "framer-motion";

interface NeuralPulseProps {
  className?: string;
}

const NeuralPulse = ({ className = "" }: NeuralPulseProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Pulsing neural rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-primary/10"
          style={{
            width: 200 + i * 150,
            height: 200 + i * 150,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
            borderColor: [
              "hsl(269 62% 52% / 0.1)",
              "hsl(269 62% 52% / 0.3)",
              "hsl(269 62% 52% / 0.1)",
            ],
          }}
          transition={{
            duration: 4 + i * 1.5,
            repeat: Infinity,
            delay: i * 1.2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Data pulse dots traveling along rings */}
      {[0, 1].map((i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-2 h-2 rounded-full bg-primary/60"
          style={{
            left: "50%",
            top: "50%",
            boxShadow: "0 0 8px hsl(269 44% 40% / 0.6)",
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
    </div>
  );
};

export default NeuralPulse;
