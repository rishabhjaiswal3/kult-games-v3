import { motion } from "framer-motion";

interface MageCharacterProps {
  src: string;
  alt?: string;
  className?: string;
  flip?: boolean;
  glowColor?: string;
  showMask?: boolean;
}

const MageCharacter = ({ src, alt = "Mage", className = "", flip = false, glowColor = "primary", showMask = true }: MageCharacterProps) => {
  const glowHsl = glowColor === "primary" ? "270 70% 55%" : glowColor === "secondary" ? "280 80% 65%" : "210 80% 55%";

  return (
    <div
      className={`relative pointer-events-none ${className}`}
      style={showMask ? {
        maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)',
      } : undefined}
    >
      {/* Wand/Staff fire glow - large pulsing orb */}
      <motion.div
        className="absolute top-[3%] left-[25%] w-[90px] h-[90px] rounded-full blur-[40px]"
        style={{ background: `hsl(${glowHsl} / 0.6)` }}
        animate={{
          opacity: [0.3, 0.8, 0.4, 1, 0.3],
          scale: [1, 1.3, 0.9, 1.2, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary fire spark */}
      <motion.div
        className="absolute top-[1%] left-[22%] w-[50px] h-[50px] rounded-full blur-[20px]"
        style={{ background: `hsl(${glowHsl} / 0.8)` }}
        animate={{
          opacity: [0.5, 1, 0.3, 0.9, 0.5],
          scale: [0.8, 1.4, 1, 1.5, 0.8],
          y: [0, -8, 4, -12, 0],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      {/* Tiny fire particles rising from wand */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-[6px] h-[6px] rounded-full"
          style={{
            background: `hsl(${glowHsl})`,
            left: `${23 + i * 4}%`,
            top: '5%',
          }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -30, -60],
            x: [0, (i - 1) * 10],
            scale: [0.5, 1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Eye glow - left */}
      <motion.div
        className="absolute top-[18%] left-[45%] w-[7px] h-[7px] rounded-full blur-[3px]"
        style={{ background: `hsl(${glowHsl})` }}
        animate={{ opacity: [0.5, 1, 0.5], boxShadow: [`0 0 4px hsl(${glowHsl})`, `0 0 12px hsl(${glowHsl})`, `0 0 4px hsl(${glowHsl})`] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      {/* Eye glow - right */}
      <motion.div
        className="absolute top-[18%] left-[50%] w-[7px] h-[7px] rounded-full blur-[3px]"
        style={{ background: `hsl(${glowHsl})` }}
        animate={{ opacity: [0.5, 1, 0.5], boxShadow: [`0 0 4px hsl(${glowHsl})`, `0 0 12px hsl(${glowHsl})`, `0 0 4px hsl(${glowHsl})`] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
      />

      {/* Ambient glow behind mage */}
      <motion.div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[250px] h-[250px] rounded-full blur-[80px]"
        style={{ background: `hsl(${glowHsl} / 0.25)` }}
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* The mage image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full h-auto animate-float drop-shadow-[0_0_80px_hsl(${glowHsl.replace(/ /g, '_')}/0.5)] ${flip ? 'transform -scale-x-100' : ''}`}
        style={{ filter: `drop-shadow(0 0 80px hsl(${glowHsl} / 0.5))` }}
      />
    </div>
  );
};

export default MageCharacter;
