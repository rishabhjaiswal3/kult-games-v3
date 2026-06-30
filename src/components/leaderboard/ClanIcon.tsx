import zeroGLogo from "@/assets/0G Logo.png";
import kultLogo from "@/assets/Kult Logo.png";
import okxLogo from "@/assets/OKX_crypto-logo-okb-png_2.png";
import baseLogo from "@/assets/Base Logo.png";
import solanaLogo from "@/assets/solana-sol-logo.png";
import okxWordmark from "@/assets/OKX_id7gsDJl-c_1.svg";

/**
 * Golden OKX wordmark — the black "OKX" logo SVG recolored to the clan's gold
 * gradient via CSS mask. Used in place of the plain "OKX" clan-name text.
 */
export function OkxWordmark({ className = "h-3.5" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="OKX"
      className={`${className} inline-block aspect-[157/44] bg-gradient-to-br from-[#f7d774] via-[#e0a528] to-[#9a6b12]`}
      style={{
        WebkitMaskImage: `url(${okxWordmark})`,
        maskImage: `url(${okxWordmark})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export function ClanIcon({ type, className = "h-3.5 w-3.5" }: { type: string; className?: string }) {
  if (type === "zerog") {
    return <img src={zeroGLogo} alt="" className={`${className} object-contain`} />;
  }
  if (type === "kult") {
    return <img src={kultLogo} alt="" className={`${className} object-contain`} />;
  }
  if (type === "okx") {
    return <img src={okxLogo} alt="OKX" className={`${className} rounded-full object-contain`} />;
  }
  if (type === "solana") {
    return <img src={solanaLogo} alt="Solana" className={`${className} rounded-full object-contain`} />;
  }
  if (type === "base") {
    return <img src={baseLogo} alt="Base" className={`${className} rounded-full object-contain`} />;
  }
  if (type === "rebel") {
    return (
      <span className={`${className} inline-flex items-center justify-center rounded-full bg-amber-400/20 text-amber-400 text-[9px] font-bold`}>
        R
      </span>
    );
  }
  if (type === "shadow") {
    return (
      <span className={`${className} inline-flex items-center justify-center rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold`}>
        S
      </span>
    );
  }
  return (
    <span className={`${className} inline-flex items-center justify-center rounded-full bg-[#9a35ff]/20 text-[#b95cff] text-[9px] font-bold`}>
      K
    </span>
  );
}

export function clanFromArchetype(archetype: string) {
  const map: Record<string, { name: string; type: string }> = {
    BERSERKER: { name: "Base", type: "base" },
    TACTICIAN: { name: "Solana", type: "solana" },
    DEFENDER: { name: "Base", type: "base" },
    ASSASSIN: { name: "ZeroG", type: "zerog" },
    SUPPORT: { name: "Solana", type: "solana" },
    HYBRID: { name: "ZeroG", type: "zerog" },
  };
  return map[archetype] ?? { name: "ZeroG", type: "zerog" };
}
