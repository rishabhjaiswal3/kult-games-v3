import { ASSET_BASE_URL } from "@/lib/serviceUrls";

/** Resolve marketplace paths against the configured CDN without changing absolute URLs. */
export function resolveAssetUrl(value?: string | null): string | null {
  const assetPath = value?.trim();
  if (!assetPath) return null;

  try {
    return new URL(assetPath, `${ASSET_BASE_URL}/`).toString();
  } catch {
    return assetPath;
  }
}
