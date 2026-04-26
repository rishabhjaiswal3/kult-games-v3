export type ChainId = "0g" | "base" | "solana";

export interface ChainTheme {
  id: ChainId;
  name: string;
  token: string;
  tagline: string;
  primary: string;
  secondary: string;
  backdropBg: string;
  cardBg: string;
  ambientGlow: string;
  topAccent: string;
  border: string;
  iconBg: string;
  boxShadow: string;
  features: { text: string; color: string }[];
}

export const CHAIN_THEMES: Record<ChainId, ChainTheme> = {
  "0g": {
    id: "0g",
    name: "0G Chain",
    token: "0G",
    tagline: "AI-native decentralized storage network",
    primary: "hsl(195 100% 65%)",
    secondary: "hsl(270 80% 70%)",
    backdropBg:
      "radial-gradient(ellipse at 50% 40%, hsl(270 82% 15% / 0.3), hsl(220 50% 4% / 0.88))",
    cardBg:
      "linear-gradient(160deg, hsl(265 48% 12% / 0.98), hsl(220 45% 7% / 0.98))",
    ambientGlow:
      "radial-gradient(circle at 50% 0%, hsl(195 100% 50% / 0.2), transparent 60%)",
    topAccent:
      "linear-gradient(90deg, transparent, hsl(195 100% 65% / 0.5), hsl(270 80% 65% / 0.4), transparent)",
    border: "hsl(195 100% 50% / 0.15)",
    iconBg:
      "linear-gradient(135deg, hsl(195 60% 18% / 0.5), hsl(220 45% 10% / 0.5))",
    boxShadow:
      "0 30px 80px hsl(220 50% 2% / 0.5), 0 0 60px hsl(195 100% 50% / 0.06), inset 0 1px 0 hsl(195 100% 65% / 0.08)",
    features: [
      { text: "Self-funded hot wallet on 0G chain", color: "hsl(195 100% 65%)" },
      { text: "AI makes autonomous purchase decisions", color: "hsl(270 80% 70%)" },
      { text: "You control the funding & authorization", color: "hsl(195 100% 65%)" },
    ],
  },
  base: {
    id: "base",
    name: "Base",
    token: "ETH",
    tagline: "Coinbase's secure, low-cost L2 on Ethereum",
    primary: "hsl(221 100% 62%)",
    secondary: "hsl(221 70% 80%)",
    backdropBg:
      "radial-gradient(ellipse at 50% 40%, hsl(221 82% 12% / 0.3), hsl(220 50% 4% / 0.88))",
    cardBg:
      "linear-gradient(160deg, hsl(221 45% 10% / 0.98), hsl(220 45% 7% / 0.98))",
    ambientGlow:
      "radial-gradient(circle at 50% 0%, hsl(221 100% 52% / 0.2), transparent 60%)",
    topAccent:
      "linear-gradient(90deg, transparent, hsl(221 100% 62% / 0.5), hsl(221 70% 78% / 0.4), transparent)",
    border: "hsl(221 100% 52% / 0.15)",
    iconBg:
      "linear-gradient(135deg, hsl(221 60% 18% / 0.5), hsl(220 45% 10% / 0.5))",
    boxShadow:
      "0 30px 80px hsl(220 50% 2% / 0.5), 0 0 60px hsl(221 100% 52% / 0.06), inset 0 1px 0 hsl(221 100% 62% / 0.08)",
    features: [
      { text: "Self-funded hot wallet on Base", color: "hsl(221 100% 65%)" },
      { text: "AI makes autonomous purchase decisions", color: "hsl(221 70% 80%)" },
      { text: "You control the funding & authorization", color: "hsl(221 100% 65%)" },
    ],
  },
  solana: {
    id: "solana",
    name: "Solana",
    token: "SOL",
    tagline: "Ultra-fast transactions with near-zero fees",
    primary: "hsl(258 100% 70%)",
    secondary: "hsl(151 100% 55%)",
    backdropBg:
      "radial-gradient(ellipse at 50% 40%, hsl(258 80% 12% / 0.3), hsl(220 50% 4% / 0.88))",
    cardBg:
      "linear-gradient(160deg, hsl(258 45% 10% / 0.98), hsl(220 45% 7% / 0.98))",
    ambientGlow:
      "radial-gradient(circle at 50% 0%, hsl(258 100% 60% / 0.2), transparent 60%)",
    topAccent:
      "linear-gradient(90deg, transparent, hsl(258 100% 70% / 0.5), hsl(151 100% 55% / 0.4), transparent)",
    border: "hsl(258 100% 60% / 0.15)",
    iconBg:
      "linear-gradient(135deg, hsl(258 45% 18% / 0.5), hsl(220 45% 10% / 0.5))",
    boxShadow:
      "0 30px 80px hsl(220 50% 2% / 0.5), 0 0 60px hsl(258 100% 60% / 0.06), inset 0 1px 0 hsl(258 100% 70% / 0.08)",
    features: [
      { text: "Self-funded hot wallet on Solana", color: "hsl(258 100% 72%)" },
      { text: "AI makes autonomous purchase decisions", color: "hsl(151 100% 58%)" },
      { text: "You control the funding & authorization", color: "hsl(258 100% 72%)" },
    ],
  },
};

export const CHAIN_IDS: ChainId[] = ["0g", "base", "solana"];

/** Injects an alpha channel into a bare hsl() string: "hsl(H S% L%)" → "hsl(H S% L% / α)" */
export function withAlpha(hsl: string, alpha: number): string {
  return hsl.slice(0, -1) + ` / ${alpha})`;
}
