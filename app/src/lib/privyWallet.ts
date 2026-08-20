import type { ConnectedWallet, User } from "@privy-io/react-auth";

/** True when the Privy user already has any linked EVM wallet (embedded or external). */
export function hasPrivyLinkedWallet(user: User | null | undefined): boolean {
  return Boolean(getWalletAddressFromPrivyUser(user));
}

function isEmbeddedPrivyWallet(walletClientType?: string | null) {
  return walletClientType === "privy" || walletClientType === "privy-v2";
}

type WalletPreference = "embedded" | "external" | "any";

/** Prefer embedded Privy wallet (email / Google) then any linked wallet. */
export function getWalletAddressFromPrivyUser(
  user: User | null | undefined,
  preference: WalletPreference = "any",
): string | undefined {
  if (!user) return undefined;

  const linked = user.linkedAccounts ?? [];
  const walletAccounts = linked.filter((a): a is Extract<(typeof linked)[number], { type: "wallet" }> => a.type === "wallet");

  const embedded = walletAccounts.find((a) => isEmbeddedPrivyWallet(a.walletClientType));
  if (preference === "embedded") return embedded?.address;

  const external = walletAccounts.find((a) => a.address && !isEmbeddedPrivyWallet(a.walletClientType));
  if (preference === "external" && external?.address) return external.address;

  if (embedded?.address) return embedded.address;

  if (external?.address) return external.address;

  const smart = linked.find((a): a is Extract<(typeof linked)[number], { type: "smart_wallet" }> => a.type === "smart_wallet");
  if (smart && "address" in smart && smart.address) return smart.address;

  return undefined;
}

/** Merge `user.linkedAccounts` with live `useWallets()` (embedded wallet can appear here first). */
export function resolvePrivyWalletAddress(
  user: User | null | undefined,
  wallets: ConnectedWallet[],
  preference: WalletPreference = "any",
): string | undefined {
  const embeddedWallet = wallets.find((w) => isEmbeddedPrivyWallet(w.walletClientType));
  const externalWallet = wallets.find((w) => !isEmbeddedPrivyWallet(w.walletClientType));

  if (preference === "embedded") {
    return getWalletAddressFromPrivyUser(user, "embedded") ?? embeddedWallet?.address;
  }

  if (preference === "external") {
    return externalWallet?.address ?? getWalletAddressFromPrivyUser(user, "external") ?? embeddedWallet?.address;
  }

  const fromUser = getWalletAddressFromPrivyUser(user);
  if (fromUser) return fromUser;

  if (embeddedWallet?.address) return embeddedWallet.address;

  return wallets[0]?.address;
}

/**
 * Every EVM address this Privy session can act as (embedded, external, smart), lowercased.
 *
 * A Kult session is bound to whichever address signed SIWE. `resolvePrivyWalletAddress`
 * returns only one *preferred* address and that preference changes as login intent is
 * cleared, so comparing the stored wallet against it alone reports a false mismatch.
 */
export function getPrivyWalletAddresses(
  user: User | null | undefined,
  wallets: ConnectedWallet[],
): string[] {
  const addresses = new Set<string>();

  for (const wallet of wallets) {
    if (wallet.address) addresses.add(wallet.address.toLowerCase());
  }

  for (const account of user?.linkedAccounts ?? []) {
    if ((account.type === "wallet" || account.type === "smart_wallet") && "address" in account) {
      const address = account.address;
      if (typeof address === "string" && address) addresses.add(address.toLowerCase());
    }
  }

  return [...addresses];
}

export function pickSigningWallet(
  wallets: ConnectedWallet[],
  address: string,
  preference: WalletPreference = "any",
): ConnectedWallet | undefined {
  const candidates =
    preference === "embedded"
      ? wallets.filter((w) => isEmbeddedPrivyWallet(w.walletClientType))
      : preference === "external"
        ? wallets.filter((w) => !isEmbeddedPrivyWallet(w.walletClientType))
        : wallets;

  const match = candidates.find((w) => w.address.toLowerCase() === address.toLowerCase());
  if (match) return match;

  const embedded = candidates.find((w) => isEmbeddedPrivyWallet(w.walletClientType));
  return embedded ?? candidates[0];
}

export function isEmbeddedPrivyConnectedWallet(wallet: ConnectedWallet | undefined) {
  return isEmbeddedPrivyWallet(wallet?.walletClientType);
}

/**
 * Sign a SIWE message via Privy's wallet API.
 * Embedded wallets must use `wallet.sign`, routing through `window.ethereum` / personal_sign
 * often hangs or returns 4100 when browser wallet extensions are installed.
 */
export async function signMessageWithPrivyWallet(
  wallet: ConnectedWallet,
  message: string,
  address: string,
): Promise<string> {
  if (typeof wallet.sign === "function") {
    try {
      return await wallet.sign(message);
    } catch (err) {
      if (isEmbeddedPrivyConnectedWallet(wallet)) throw err;
    }
  }

  const provider = await wallet.getEthereumProvider();
  try {
    await provider.request({ method: "eth_requestAccounts" });
  } catch {
    /* best-effort */
  }

  return provider.request({
    method: "personal_sign",
    params: [message, address],
  }) as Promise<string>;
}
