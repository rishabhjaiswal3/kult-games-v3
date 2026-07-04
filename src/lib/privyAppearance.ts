import kultLogo from "@/assets/kult-logo.png";

/** Shared copy — LoginModal header + Privy landingHeader */
export const KULT_LOGIN_LANDING_HEADER = "Sign in to continue";

export const KULT_PRIVY_LOGO_URL = kultLogo;

/** Shared auth modal dimensions (LoginModal + Privy card) */
export const KULT_AUTH_MODAL = {
  width: "min(92vw, 400px)",
  maxWidth: "400px",
  borderRadius: "24px",
  maxHeight: "min(520px, 90vh)",
} as const;

export const KULT_PRIVY_APPEARANCE = {
  theme: "#1a1326" as const,
  accentColor: "#9835f5" as const,
  logo: kultLogo,
  landingHeader: KULT_LOGIN_LANDING_HEADER,
  showWalletLoginFirst: true,
};
