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
}

const MageCharacter = ({
  src,
  alt = "Mage",
  className = "",
  flip = false,
  glowColor = "primary",
  showMask = true,
  loading = "lazy",
}: MageCharacterProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const glowHsl = glowColor === "primary" ? "269 62% 52%" : glowColor === "secondary" ? "281 35% 72%" : "281 40% 82%";

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={showMask ? {
        maskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 95%)',
      } : undefined}
    >
      {/* Solid dark backdrop to hide grid lines behind the character */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `radial-gradient(ellipse at center 30%, hsl(236 50% 8% / 0.95) 0%, hsl(236 50% 8% / 0.7) 40%, transparent 70%)`,
        }}
      />

      {/* Wand/Staff fire glow - large pulsing orb */}
      <motion.div
        className="absolute top-[3%] left-[25%] w-[100px] h-[100px] rounded-full blur-[45px] z-[2]"
        style={{ background: `hsl(${glowHsl} / 0.7)` }}
        animate={{
          opacity: [0.4, 1, 0.5, 1, 0.4],
          scale: [1, 1.4, 0.9, 1.3, 1],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary fire spark */}
      <motion.div
        className="absolute top-[0%] left-[20%] w-[60px] h-[60px] rounded-full blur-[25px] z-[2]"
        style={{ background: `hsl(${glowHsl} / 0.9)` }}
        animate={{
          opacity: [0.5, 1, 0.3, 0.9, 0.5],
          scale: [0.8, 1.5, 1, 1.6, 0.8],
          y: [0, -12, 6, -18, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
      {/* Fire flicker - fast small spark */}
      <motion.div
        className="absolute top-[2%] left-[28%] w-[30px] h-[30px] rounded-full blur-[12px] z-[2]"
        style={{ background: `hsl(40 90% 60% / 0.6)` }}
        animate={{
          opacity: [0, 0.8, 0, 0.6, 0],
          scale: [0.5, 1.2, 0.5, 1, 0.5],
          y: [0, -6, 2, -10, 0],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />

      {/* Tiny fire particles rising from wand */}
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="absolute w-[5px] h-[5px] rounded-full z-[3]"
          style={{
            background: i % 2 === 0 ? `hsl(${glowHsl})` : `hsl(40 90% 60%)`,
            left: `${21 + i * 3}%`,
            top: '4%',
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -40, -80],
            x: [0, (i - 2) * 8],
            scale: [0.3, 1, 0],
          }}
          transition={{
            duration: 1.2 + i * 0.2,
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Eye glow - left */}
      <motion.div
        className="absolute top-[18%] left-[45%] w-[8px] h-[8px] rounded-full blur-[4px] z-[3]"
        style={{ background: `hsl(${glowHsl})` }}
        animate={{
          opacity: [0.4, 1, 0.4],
          boxShadow: [
            `0 0 6px hsl(${glowHsl}), 0 0 15px hsl(${glowHsl} / 0.5)`,
            `0 0 15px hsl(${glowHsl}), 0 0 30px hsl(${glowHsl} / 0.7)`,
            `0 0 6px hsl(${glowHsl}), 0 0 15px hsl(${glowHsl} / 0.5)`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Eye glow - right */}
      <motion.div
        className="absolute top-[18%] left-[50%] w-[8px] h-[8px] rounded-full blur-[4px] z-[3]"
        style={{ background: `hsl(${glowHsl})` }}
        animate={{
          opacity: [0.4, 1, 0.4],
          boxShadow: [
            `0 0 6px hsl(${glowHsl}), 0 0 15px hsl(${glowHsl} / 0.5)`,
            `0 0 15px hsl(${glowHsl}), 0 0 30px hsl(${glowHsl} / 0.7)`,
            `0 0 6px hsl(${glowHsl}), 0 0 15px hsl(${glowHsl} / 0.5)`,
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />

      {/* Ambient glow behind mage */}
      <motion.div
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[100px] z-[1]"
        style={{ background: `hsl(${glowHsl} / 0.3)` }}
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.15, 1] }}
        transition={{ duration: 3.5, repeat: Infinity }}
      />

      <motion.div
        className="absolute inset-[8%] z-[2] rounded-[32px] bg-gradient-to-b from-white/12 via-white/4 to-transparent"
        animate={{ opacity: imageLoaded ? 0 : 0.35 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      {/* The mage image */}
      <motion.img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setImageLoaded(true)}
        className={`w-full h-auto relative z-[2] ${flip ? 'transform -scale-x-100' : ''}`}
        style={{
          filter: `drop-shadow(0 0 60px hsl(${glowHsl} / 0.6))`,
          willChange: "transform, opacity, filter",
        }}
        initial={{ opacity: 0, y: 18, scale: 0.97, filter: `blur(18px) drop-shadow(0 0 60px hsl(${glowHsl} / 0.35))` }}
        animate={{
          opacity: imageLoaded ? 1 : 0,
          y: imageLoaded ? [0, -8, 0] : 18,
          scale: imageLoaded ? 1 : 0.97,
          filter: imageLoaded
            ? `blur(0px) drop-shadow(0 0 60px hsl(${glowHsl} / 0.6))`
            : `blur(18px) drop-shadow(0 0 60px hsl(${glowHsl} / 0.35))`,
        }}
        transition={
          imageLoaded
            ? {
                opacity: { duration: 0.55, ease: "easeOut" },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.55, ease: "easeOut" },
                filter: { duration: 0.55, ease: "easeOut" },
              }
            : { duration: 0.3 }
        }
      />
    </div>
  );
};

export default MageCharacter;
