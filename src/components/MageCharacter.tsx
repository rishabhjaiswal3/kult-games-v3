import { motion } from "framer-motion";
import { useState } from "react";

interface MageCharacterProps {
  src: string;
  alt?: string;
  className?: string;
  flip?: boolean;
  glowColor?: string;
  showMask?: boolean;
  loading?: "eager" | "lazy";
  animate?: boolean;
}

const MageCharacter = ({
  src,
  alt = "Mage",
  className = "",
  flip = false,
  glowColor = "primary",
  showMask = true,
  loading = "lazy",
  animate = true,
}: MageCharacterProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const glowHsl = "195 100% 50%";

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={showMask ? {
        maskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
      } : undefined}
    >
      {/* Solid dark backdrop */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `radial-gradient(ellipse at center 30%, hsl(220 50% 6% / 0.95) 0%, hsl(220 50% 6% / 0.7) 40%, transparent 70%)`,
        }}
      />

      {/* Wand/Staff cyan lightning glow */}
      <motion.div
        className="absolute top-[3%] left-[25%] w-[100px] h-[100px] rounded-full blur-[45px] z-[2]"
        style={{ background: `hsl(${glowHsl} / 0.8)` }}
        animate={{
          opacity: [0.4, 1, 0.5, 1, 0.4],
          scale: [1, 1.4, 0.9, 1.3, 1],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary cyan spark */}
      <motion.div
        className="absolute top-[0%] left-[20%] w-[60px] h-[60px] rounded-full blur-[25px] z-[2]"
        style={{ background: `hsl(195 100% 65% / 0.9)` }}
        animate={{
          opacity: [0.5, 1, 0.3, 0.9, 0.5],
          scale: [0.8, 1.5, 1, 1.6, 0.8],
          y: [0, -12, 6, -18, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      {/* Lightning flash spark */}
      <motion.div
        className="absolute top-[2%] left-[28%] w-[30px] h-[30px] rounded-full blur-[12px] z-[2]"
        style={{ background: `hsl(195 80% 80% / 0.8)` }}
        animate={{
          opacity: [0, 1, 0, 0.8, 0],
          scale: [0.5, 1.5, 0.5, 1.2, 0.5],
          y: [0, -6, 2, -10, 0],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Cyan lightning particles rising */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          className="absolute w-[4px] h-[4px] rounded-full z-[3]"
          style={{
            background: i % 2 === 0 ? `hsl(${glowHsl})` : `hsl(195 80% 80%)`,
            left: `${21 + i * 2.5}%`,
            top: '4%',
            boxShadow: `0 0 6px hsl(${glowHsl}), 0 0 12px hsl(${glowHsl} / 0.5)`,
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -50, -100],
            x: [0, (i - 3) * 10],
            scale: [0.3, 1.2, 0],
          }}
          transition={{
            duration: 1.2 + i * 0.15,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Eye glow - left */}
      <motion.div
        className="absolute top-[18%] left-[45%] w-[10px] h-[10px] rounded-full blur-[5px] z-[3]"
        style={{ background: `hsl(${glowHsl})` }}
        animate={{
          opacity: [0.5, 1, 0.5],
          boxShadow: [
            `0 0 8px hsl(${glowHsl}), 0 0 20px hsl(${glowHsl} / 0.6), 0 0 40px hsl(${glowHsl} / 0.3)`,
            `0 0 20px hsl(${glowHsl}), 0 0 40px hsl(${glowHsl} / 0.8), 0 0 60px hsl(${glowHsl} / 0.4)`,
            `0 0 8px hsl(${glowHsl}), 0 0 20px hsl(${glowHsl} / 0.6), 0 0 40px hsl(${glowHsl} / 0.3)`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Eye glow - right */}
      <motion.div
        className="absolute top-[18%] left-[50%] w-[10px] h-[10px] rounded-full blur-[5px] z-[3]"
        style={{ background: `hsl(${glowHsl})` }}
        animate={{
          opacity: [0.5, 1, 0.5],
          boxShadow: [
            `0 0 8px hsl(${glowHsl}), 0 0 20px hsl(${glowHsl} / 0.6), 0 0 40px hsl(${glowHsl} / 0.3)`,
            `0 0 20px hsl(${glowHsl}), 0 0 40px hsl(${glowHsl} / 0.8), 0 0 60px hsl(${glowHsl} / 0.4)`,
            `0 0 8px hsl(${glowHsl}), 0 0 20px hsl(${glowHsl} / 0.6), 0 0 40px hsl(${glowHsl} / 0.3)`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />

      {/* Ambient cyan glow behind mage */}
      <motion.div
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full blur-[120px] z-[1]"
        style={{ background: `hsl(${glowHsl} / 0.35)` }}
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      />

      {/* Lightning energy ring around mage */}
      <motion.div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full z-[2]"
        style={{
          border: `1px solid hsl(${glowHsl} / 0.2)`,
          boxShadow: `0 0 20px hsl(${glowHsl} / 0.1), inset 0 0 20px hsl(${glowHsl} / 0.05)`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.1, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute inset-[8%] z-[2] rounded-[32px] bg-gradient-to-b from-white/12 via-white/4 to-transparent"
        animate={{ opacity: imageLoaded ? 0 : 0.35 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      {/* The mage image with subtle body sway animation */}
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-auto relative z-[2] ${flip ? 'transform -scale-x-100' : ''}`}
        style={{
          filter: `drop-shadow(0 0 60px hsl(${glowHsl} / 0.7)) drop-shadow(0 0 120px hsl(${glowHsl} / 0.3)) contrast(1.15) brightness(1.08)`,
          willChange: "transform, opacity, filter",
        }}
        initial={{ opacity: 0, y: 18, scale: 0.97, filter: `blur(18px) drop-shadow(0 0 60px hsl(${glowHsl} / 0.35))` }}
        animate={{
          opacity: imageLoaded ? 1 : 0,
          y: imageLoaded ? [0, -8, 0] : 18,
          scale: imageLoaded ? [1, 1.01, 1] : 0.97,
          rotate: imageLoaded && animate ? [0, -0.8, 0, 0.8, 0] : 0,
          filter: imageLoaded
            ? `blur(0px) drop-shadow(0 0 60px hsl(${glowHsl} / 0.7)) drop-shadow(0 0 120px hsl(${glowHsl} / 0.3))`
            : `blur(18px) drop-shadow(0 0 60px hsl(${glowHsl} / 0.35))`,
        }}
        transition={
          imageLoaded
            ? {
                opacity: { duration: 0.55, ease: "easeOut" },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" },
                filter: { duration: 0.55, ease: "easeOut" },
              }
            : { duration: 0.3 }
        }
      />
    </div>
  );
};

export default MageCharacter;
