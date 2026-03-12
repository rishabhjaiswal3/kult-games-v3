import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import AutoPlayVideo from "@/components/AutoPlayVideo";

interface VideoShowcaseProps {
  videoSrc: string;
  title: string;
  subtitle: string;
  overlayOpacity?: number;
  height?: string;
  children?: React.ReactNode;
}

const VideoShowcase = ({
  videoSrc,
  title,
  subtitle,
  overlayOpacity = 0.5,
  height = "60vh",
  children,
}: VideoShowcaseProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.05]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden z-10"
      style={{ height }}
    >
      {/* Parallax video */}
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <AutoPlayVideo src={videoSrc} loop className="w-full h-[130%] object-cover" />
      </motion.div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, hsl(220 50% 6% / ${overlayOpacity}), hsl(220 50% 6% / ${overlayOpacity * 0.6}), hsl(220 50% 6% / ${overlayOpacity}))` }}
      />

      {/* Top/bottom borders */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

      {/* Content */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10"
        style={{ opacity }}
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] uppercase mb-4"
        >
          {subtitle.split(" • ").map((word, i, arr) => (
            <span key={word} className="flex items-center gap-2">
              <span
                className="text-white font-bold drop-shadow-[0_0_6px_hsl(0_0%_100%/0.4)]"
              >
                {word}
              </span>
              {i < arr.length - 1 && (
                <span className="text-white/25">•</span>
              )}
            </span>
          ))}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-[0_2px_24px_hsl(220_80%_4%/0.9)]"
          style={{ textShadow: "0 0 40px hsl(195 100% 60% / 0.25), 0 2px 20px hsl(220 80% 4% / 0.8)" }}
        >
          {title}
        </motion.h2>
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            {children}
          </motion.div>
        )}
      </motion.div>

      {/* Corner accents */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-neon-cyan/30 pointer-events-none" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-neon-cyan/30 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-neon-cyan/30 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-neon-cyan/30 pointer-events-none" />
    </div>
  );
};

export default VideoShowcase;
