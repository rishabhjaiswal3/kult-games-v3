/** Map Privy auth error codes to user-facing copy. */
export function privyAuthErrorMessage(error: unknown): string {
  const record =
    typeof error === "object" && error !== null ? (error as Record<string, unknown>) : null;

  const message =
    typeof error === "string"
      ? error
      : typeof record?.message === "string"
        ? record.message
        : "";

  const code =
    typeof error === "string"
      ? error
      : String(record?.privyErrorCode ?? record?.code ?? record?.error ?? "");

  if (/already exists/i.test(message) || /try another address/i.test(message)) {
    return "This wallet is already on your Kult account. Close the popup and wait a moment, we'll finish signing you in.";
  }

  switch (code) {
    case "linked_to_another_user":
      return "This wallet is linked to another Kult account. Sign in with the email or Google account that first used this wallet, or connect a different wallet in MetaMask.";
    case "exited_auth_flow":
      return "";
    case "wallet_not_connected":
      return "No wallet connected. Open MetaMask and try again.";
    default:
      if (message && !message.startsWith("Sign-in failed")) return message;
      if (code) return `Sign-in failed (${code}). Please try again.`;
      return "Sign-in failed. Please try again.";
  }
}
