import { motion } from "framer-motion";
import AutoPlayVideo from "@/components/AutoPlayVideo";

interface VideoShowcaseProps {
  videoSrc: string;
  title: string;
  subtitle: string;
  overlayOpacity?: number;
  height?: string;
  children?: React.ReactNode;
}

/**
 * Full-width video band. Scroll-linked parallax was removed — it caused jank and
 * constant repaints over video during scroll.
 */
const VideoShowcase = ({
  videoSrc,
  title,
  subtitle,
  overlayOpacity = 0.5,
  height = "60vh",
  children,
}: VideoShowcaseProps) => {
  return (
    <div className="relative overflow-hidden z-10" style={{ height }}>
      <div className="absolute inset-0">
        <AutoPlayVideo src={videoSrc} loop className="w-full h-full object-cover" />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, hsl(220 50% 6% / ${overlayOpacity}), hsl(220 50% 6% / ${overlayOpacity * 0.6}), hsl(220 50% 6% / ${overlayOpacity}))`,
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-2 text-[10px] font-mono tracking-[0.3em] uppercase mb-4"
        >
          {subtitle.split(" • ").map((word, i, arr) => (
            <span key={word} className="flex items-center gap-2">
              <span className="text-white font-bold drop-shadow-[0_0_6px_hsl(0_0%_100%/0.4)]">{word}</span>
              {i < arr.length - 1 && <span className="text-white/25">•</span>}
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
      </div>

      <div className="absolute top-4 left-4 w-8 h-8 border-t border-l border-neon-cyan/30 pointer-events-none" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-neon-cyan/30 pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-neon-cyan/30 pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b border-r border-neon-cyan/30 pointer-events-none" />
    </div>
  );
};

export default VideoShowcase;
