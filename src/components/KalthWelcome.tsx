import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const KalthWelcome = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.8 }}
          className="absolute top-[10%] left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-4"
        >
          {/* Wand magic burst */}
          <motion.div className="relative w-40 h-40">
            {/* Central magic orb */}
            <motion.div
              className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-primary"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 2, 0.8, 1.5, 1],
                opacity: [0, 1, 0.8, 1, 0.6],
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{
                boxShadow: "0 0 40px hsl(195 100% 50%), 0 0 80px hsl(195 100% 50% / 0.5)",
              }}
            />

            {/* Magic rays shooting outward */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 bg-gradient-to-r from-primary to-secondary rounded-full origin-left"
                style={{
                  rotate: `${i * 45}deg`,
                  transformOrigin: "0% 50%",
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: [0, 70, 40],
                  opacity: [0, 1, 0.3],
                  height: [2, 3, 1],
                }}
                transition={{ duration: 1, delay: 0.3 + i * 0.05, ease: "easeOut" }}
              />
            ))}

            {/* Sparkle particles */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const radius = 50 + Math.random() * 30;
              return (
                <motion.div
                  key={`spark-${i}`}
                  className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i % 3 === 0 ? "hsl(40 90% 60%)" : "hsl(269 62% 58%)",
                  }}
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{ duration: 1.5, delay: 0.5 + i * 0.08, ease: "easeOut" }}
                />
              );
            })}
          </motion.div>

          {/* Welcome text */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <motion.p
              className="font-display text-lg md:text-2xl font-bold tracking-[0.3em] uppercase gradient-text glow-text"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Welcome to the Kultverse
            </motion.p>
            <motion.div
              className="mt-2 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1.3, duration: 1 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KalthWelcome;
