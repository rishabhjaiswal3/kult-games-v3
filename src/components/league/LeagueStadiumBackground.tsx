import { FEATURED_MATCH } from "./leagueData";

const STADIUM_SRC = "/league/stadium-pitch.jpg";

/**
 * Photorealistic stadium broadcast backdrop — photo + light overlays for legibility.
 */
export function LeagueStadiumBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src={FEATURED_MATCH.stadiumImage ?? STADIUM_SRC}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[center_42%] scale-[1.03]"
      />
      {/* Colour grade — cinematic, not flat cartoon */}
      <div className="absolute inset-0 bg-[#0a1628]/25 mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05050a]/55 via-[#05050a]/15 via-45% to-[#05050a]/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05050a]/45 via-transparent to-[#05050a]/45" />
      {/* Broadcast spotlight on pitch center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,rgba(255,255,255,0.12),transparent_65%)]" />
    </div>
  );
}
