import AutoPlayVideo from "@/components/AutoPlayVideo";

interface VideoShowcaseProps {
  videoSrc: string;
  title: string;
  subtitle: string;
  overlayOpacity?: number;
  height?: string;
  contentVerticalAlign?: "center" | "lower";
  videoObjectPosition?: string;
  children?: React.ReactNode;
}

const VideoShowcase = ({
  videoSrc,
  title,
  subtitle,
  overlayOpacity = 0.5,
  height = "60vh",
  contentVerticalAlign = "center",
  videoObjectPosition = "center center",
  children,
}: VideoShowcaseProps) => {
  const isLower = contentVerticalAlign === "lower";

  const shellClass = isLower
    ? "absolute inset-0 z-10 flex flex-col items-center justify-end px-6 pb-10 pt-[clamp(11rem,42vh,26rem)] text-center sm:pb-12 md:pb-14"
    : "absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center";

  const subtitleEl = (
    <span className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em]">
      {subtitle.split(" • ").map((word, i, arr) => (
        <span key={word} className="flex items-center gap-2">
          <span className="font-bold text-white drop-shadow-[0_0_6px_hsl(0_0%_100%/0.4)]">{word}</span>
          {i < arr.length - 1 && <span className="text-white/25">•</span>}
        </span>
      ))}
    </span>
  );

  const titleEl = (
    <h2
      className="font-display text-3xl font-black tracking-tight text-white drop-shadow-[0_2px_24px_hsl(220_80%_4%/0.9)] sm:text-4xl md:text-6xl lg:text-7xl"
      style={{ textShadow: "0 0 40px hsl(195 100% 60% / 0.25), 0 2px 20px hsl(220 80% 4% / 0.8)" }}
    >
      {title}
    </h2>
  );

  return (
    <div className="relative z-10 overflow-hidden" style={{ height }}>
      <div className="absolute inset-0">
        <AutoPlayVideo
          src={videoSrc}
          loop
          className="h-full w-full object-cover"
          style={{ objectPosition: videoObjectPosition }}
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, hsl(220 50% 6% / ${isLower ? overlayOpacity * 0.4 : overlayOpacity}), hsl(220 50% 6% / ${overlayOpacity * 0.6}), hsl(220 50% 6% / ${overlayOpacity}))`,
        }}
      />

      <div className="absolute left-0 right-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

      <div className={shellClass}>
        {isLower ? (
          <>
            {titleEl}
            <div className="mt-3">{subtitleEl}</div>
            {children ? <div className="mt-5 sm:mt-6">{children}</div> : null}
          </>
        ) : (
          <>
            <span className="mb-4">{subtitleEl}</span>
            {titleEl}
            {children ? <div className="mt-6">{children}</div> : null}
          </>
        )}
      </div>

      <div className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-neon-cyan/30" />
      <div className="pointer-events-none absolute right-4 top-4 h-8 w-8 border-r border-t border-neon-cyan/30" />
      <div className="pointer-events-none absolute bottom-4 left-4 h-8 w-8 border-b border-l border-neon-cyan/30" />
      <div className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b border-r border-neon-cyan/30" />
    </div>
  );
};

export default VideoShowcase;
