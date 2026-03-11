import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-[130%] object-cover"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      </motion.div>

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, hsl(220 50% 6% / ${overlayOpacity}), hsl(220 50% 6% / ${overlayOpacity * 0.6}), hsl(220 50% 6% / ${overlayOpacity}))` }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-[2px] pointer-events-none z-20"
        style={{
          background: "linear-gradient(90deg, transparent, hsl(195 100% 60% / 0.6), hsl(195 100% 80% / 0.8), hsl(195 100% 60% / 0.6), transparent)",
          boxShadow: "0 0 20px hsl(195 100% 60% / 0.4)",
        }}
        animate={{ top: ["-2px", "100%"] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
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
          className="text-[10px] font-mono text-neon-cyan/80 tracking-[0.4em] uppercase mb-4"
        >
          {subtitle}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight gradient-text glow-text"
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
