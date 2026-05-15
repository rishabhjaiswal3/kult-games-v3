type LinkedAccountLike = {
  type?: string;
  address?: string;
  chainType?: string;
  chain_type?: string;
};

type PrivyUserLike = {
  wallet?: LinkedAccountLike;
  embeddedWallets?: LinkedAccountLike[];
  wallets?: LinkedAccountLike[];
  linkedAccounts?: LinkedAccountLike[];
  identityToken?: string;
  idToken?: string;
};

export function getEvmWalletAddressFromPrivyUser(user: unknown): string | undefined {
  const typed = user as PrivyUserLike | null;
  if (!typed) return undefined;
  if (typed.wallet?.address) return typed.wallet.address;
  if (Array.isArray(typed.embeddedWallets) && typed.embeddedWallets[0]?.address) {
    return typed.embeddedWallets[0].address;
  }
  if (Array.isArray(typed.wallets) && typed.wallets[0]?.address) return typed.wallets[0].address;
  if (Array.isArray(typed.linkedAccounts)) {
    const wallet = typed.linkedAccounts.find((account) => {
      const chainType = account.chainType ?? account.chain_type;
      return account.type === "wallet" && account.address && chainType !== "ton";
    });
    if (wallet?.address) return wallet.address;
  }
  return undefined;
}

export function getTonWalletAddressFromPrivyUser(user: unknown): string | undefined {
  const typed = user as PrivyUserLike | null;
  const wallet = typed?.linkedAccounts?.find((account) => {
    const chainType = account.chainType ?? account.chain_type;
    return account.type === "wallet" && account.address && chainType === "ton";
  });
  return wallet?.address;
}

export async function getPrivyIdentityToken(privy: unknown): Promise<string | null> {
  const typed = privy as {
    getIdentityToken?: () => Promise<string | null>;
    user?: PrivyUserLike;
  };

  if (typeof typed.getIdentityToken === "function") {
    const token = await typed.getIdentityToken();
    if (token) return token;
  }

  return typed.user?.identityToken ?? typed.user?.idToken ?? null;
}
