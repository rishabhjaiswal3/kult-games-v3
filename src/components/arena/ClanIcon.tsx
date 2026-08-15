import zeroGLogo from "@/assets/0G Logo.png";
import okxLogo from "@/assets/OKX_crypto-logo-okb-png_2.png";
import solanaLogo from "@/assets/solana-sol-logo.png";
import baseLogo from "@/assets/Base Logo.webp";

function SolanaIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <img src={solanaLogo} alt="Solana" className={`${className} rounded-full object-contain`} />;
}

function BaseIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <img src={baseLogo} alt="Base" className={`${className} rounded-full object-contain`} />;
}

function ZeroGClanIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <img src={zeroGLogo} alt="0G" className={`${className} object-contain`} />;
}

function OkxClanIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <img src={okxLogo} alt="OKX" className={`${className} rounded-full object-contain`} />;
}

export function ClanIcon({ type, className = "h-3.5 w-3.5" }: { type: string; className?: string }) {
  if (type === "solana") return <SolanaIcon className={className} />;
  if (type === "base") return <BaseIcon className={className} />;
  if (type === "zerog") return <ZeroGClanIcon className={className} />;
  if (type === "okx") return <OkxClanIcon className={className} />;
  return null;
}
