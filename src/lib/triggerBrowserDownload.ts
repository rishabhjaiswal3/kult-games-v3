/**
 * Starts a file download / opens the asset in a new tab without changing the
 * current SPA location (uses a temporary <a target="_blank">).
 */
export function triggerBrowserDownload(fileUrl: string): void {
  const href = fileUrl.trim();
  if (!href) return;

  const a = document.createElement("a");
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";

  try {
    const name = new URL(href).pathname.split("/").filter(Boolean).pop();
    if (name) a.setAttribute("download", name);
  } catch {
    // Relative or opaque URL — omit download filename hint
  }

  document.body.appendChild(a);
  a.click();
  a.remove();
}
