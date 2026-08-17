import { type CSSProperties } from "react";
import type { GameAirdrop } from "@/constants/gameAirdrops";
import { cn } from "@/lib/utils";

type GameAirdropBannerProps = {
  drop: GameAirdrop;
  /** Only used once `drop.status` is `live`; ignored while the drop is upcoming. */
  onClaim: () => void;
  /** `compact` shrinks the whole banner for the games catalogue; `section` is the detail-page size. */
  variant?: "section" | "compact";
  className?: string;
};

/**
 * The in-game reward popup rebuilt as a wide banner: gunmetal frame, framed
 * item slot on the left, campaign copy and the stamped action bar on the right.
 */
export function GameAirdropBanner({ drop, onClaim, variant = "section", className }: GameAirdropBannerProps) {
  const isCompact = variant === "compact";
  const isLive = drop.status === "live";

  return (
    <section
      className={cn("drop-banner", isLive && "drop-banner--live", className)}
      style={{ "--drop-scale": isCompact ? 0.86 : 1, "--drop-rarity": drop.rarityColor } as CSSProperties}
      aria-label={`${drop.itemName} airdrop`}
    >
      <span className="drop-banner__rivets" aria-hidden />
      <span className="drop-banner__hazard drop-banner__hazard--left" aria-hidden />
      <span className="drop-banner__hazard drop-banner__hazard--right" aria-hidden />
      <span className="drop-banner__led drop-banner__led--left" aria-hidden>
        <span />
        <span />
        <span />
      </span>
      <span className="drop-banner__led drop-banner__led--right" aria-hidden>
        <span />
        <span />
        <span />
      </span>

      <div className="drop-banner__panel">
        <div className="drop-banner__body">
          <div className="drop-banner__slot">
            <span className="drop-banner__slot-rarity">{drop.rarity}</span>
            <img src={drop.itemImage} alt={drop.itemName} loading="lazy" decoding="async" />
          </div>

          <div className="drop-banner__content">
            <div className="drop-banner__meta">
              <img src={drop.gameLogo} alt="" className="drop-banner__game-logo" />
              <span className="drop-banner__meta-divider" aria-hidden />
              <img src={drop.chainLogo} alt="" className="drop-banner__chain-logo" />
              <span className="drop-banner__tag">
                {isLive ? <span className="drop-banner__tag-dot" aria-hidden /> : null}
                {isLive ? "Airdrop live" : "Airdrop"}
              </span>
              <span className="drop-banner__tag drop-banner__tag--muted">{drop.itemKind}</span>
            </div>

            <p className="drop-banner__eyebrow">{drop.headline}</p>
            <h2 className="drop-banner__title">{drop.itemName}</h2>
            <p className="drop-banner__text">{drop.description}</p>
          </div>

          <div className="drop-banner__action">
            {isLive ? (
              <button type="button" onClick={onClaim} className="drop-banner__bar drop-banner__bar--action">
                <span className="drop-banner__bar-cap drop-banner__bar-cap--left" aria-hidden />
                {drop.ctaLabel}
                <span className="drop-banner__bar-cap drop-banner__bar-cap--right" aria-hidden />
              </button>
            ) : (
              <p className="drop-banner__bar drop-banner__bar--pending">
                <span className="drop-banner__bar-cap drop-banner__bar-cap--left" aria-hidden />
                Coming soon
                <span className="drop-banner__bar-cap drop-banner__bar-cap--right" aria-hidden />
              </p>
            )}
            <span className="drop-banner__note">{isLive ? "Claimed inside the game" : "Drops later this season"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
