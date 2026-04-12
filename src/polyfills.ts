/**
 * Vite/browser builds have no Node `Buffer`. Privy + viem paths expect it during sign / crypto.
 * Load before any other app imports in main.tsx.
 */
import { Buffer } from "buffer";

if (typeof globalThis.Buffer === "undefined") {
  (globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
}
