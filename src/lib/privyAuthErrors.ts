/** Map Privy auth error codes to user-facing copy. */
export function privyAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "string"
      ? error
      : typeof error === "object" && error !== null
        ? String(
            (error as { privyErrorCode?: string; code?: string; error?: string }).privyErrorCode ??
              (error as { code?: string }).code ??
              (error as { error?: string }).error ??
              ""
          )
        : "";

  switch (code) {
    case "linked_to_another_user":
      return "This wallet is already linked to another Kult account. Sign in with the email or Google account that first used this wallet, switch to a different wallet in MetaMask, or ask an admin to unlink it in the Privy dashboard.";
    case "exited_auth_flow":
      return "";
    case "wallet_not_connected":
      return "No wallet connected. Open MetaMask and try again.";
    default:
      if (code) return `Sign-in failed (${code}). Please try again.`;
      return "Sign-in failed. Please try again.";
  }
}
