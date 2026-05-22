/** Short wallet for Moments chrome (no dependency on Navbar helpers). */
export function shortenWalletChip(addr: string) {
  if (!addr || addr.length <= 10) return addr || "Wallet";
  return `${addr.slice(0, 4)}…${addr.slice(-3)}`;
}
