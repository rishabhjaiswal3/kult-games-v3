import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePolygonUsdcBalance } from "@/hooks/usePolygonUsdcBalance";
import { useDepositWalletPusdBalance } from "@/hooks/useDepositWalletPusdBalance";
import { useDepositWalletAddress } from "@/hooks/useDepositWalletAddress";
import { PolymarketDepositModal } from "./PolymarketDepositModal";
import { PolymarketWithdrawModal } from "./PolymarketWithdrawModal";

/**
 * Read-only balance readout. Shows plain USDC.e in the player's wallet and
 * pUSD in their Polymarket deposit wallet (the tradeable balance).
 */
export function PolygonWalletBalance() {
  const { isAuthenticated, walletAddress, login } = useAuth();
  const { data: usdc, isLoading: usdcLoading } = usePolygonUsdcBalance(walletAddress);
  const { data: pusd, isLoading: pusdLoading } = useDepositWalletPusdBalance(walletAddress);
  const { data: depositWalletAddress } = useDepositWalletAddress(walletAddress);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={login}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left font-tech text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-[#2E5CFF]/40 hover:text-white"
      >
        Connect wallet to see your Polygon USDC balance
      </button>
    );
  }

  return (
    <div className="space-y-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-tech text-[10px] font-bold uppercase tracking-wider text-white/50">Your Polygon USDC</span>
        <span className="font-tech text-sm font-bold text-white">
          {usdcLoading ? "…" : usdc != null ? `$${usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-tech text-[9px] uppercase tracking-wider text-white/35">Tradeable (pUSD)</span>
        <span className="font-tech text-xs font-semibold text-white/70">
          {pusdLoading ? "…" : pusd != null ? `$${pusd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
        </span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setDepositOpen(true)}
          className="w-full rounded-lg border border-[#2E5CFF]/40 bg-[#2E5CFF]/10 px-2 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-[#7c9bff] transition hover:bg-[#2E5CFF]/20"
        >
          Fund wallet
        </button>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-2 py-1.5 font-tech text-[9px] font-bold uppercase tracking-wider text-white/60 transition hover:border-white/30 hover:text-white"
        >
          Withdraw
        </button>
      </div>
      <PolymarketDepositModal open={depositOpen} onOpenChange={setDepositOpen} walletAddress={depositWalletAddress ?? null} />
      <PolymarketWithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} availablePusd={pusd ?? null} />
    </div>
  );
}
