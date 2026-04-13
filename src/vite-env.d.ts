/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_KULT_AI_API_URL?: string;
  /** Override AI Warzone microservice base URL (default: https://ai-warzone.onrender.com). */
  readonly VITE_AI_WARZONE_URL?: string;
  /** Salt mixed into agent binding sign message; change only if you need a new agent-id namespace. */
  readonly VITE_AGENT_ID_SALT?: string;
  /** Embedded Moments app URL (full page iframe on /moments). */
  readonly VITE_MOMENTS_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
