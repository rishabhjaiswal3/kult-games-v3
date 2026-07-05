const content = document.getElementById("content");

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

const PHASES = {
  idle: {
    icon: "🤖",
    title: "Ready",
    sub: "Waiting for a match to be launched from the browser.",
    actions: [],
  },
  launching: {
    icon: null, // spinner
    title: "Launching RoboWars…",
    sub: "Starting the game, this takes a few seconds.",
    actions: [],
  },
  waiting: {
    icon: null, // spinner
    title: "Battle in Progress",
    sub: "The robots are fighting. This window will update automatically when the match ends.",
    actions: [],
  },
  submitting: {
    icon: null,
    title: "Submitting Result…",
    sub: "Uploading battle result to the AI Arena backend.",
    actions: [],
  },
  done: {
    icon: "✅",
    title: "Battle Complete!",
    sub: "Results submitted. You can close this window — the browser page will show the outcome automatically.",
    actions: [{ label: "Close Launcher", cls: "btn-gray", action: "quit" }],
  },
  error: {
    icon: "⚠️",
    title: "Something Went Wrong",
    sub: null, // filled from message
    actions: [
      { label: "Try Again", cls: "btn-red", action: "retry" },
      { label: "Close", cls: "btn-gray", action: "quit" },
    ],
  },
};

window.launcher.onPhase((data) => {
  const cfg = PHASES[data.phase] ?? PHASES.idle;
  const sub = data.message ?? cfg.sub;

  let html = "";
  if (cfg.icon) {
    html += `<div class="status-icon">${cfg.icon}</div>`;
  } else {
    html += `<div class="spinner"></div>`;
  }
  html += `<div class="status-title">${escapeHtml(cfg.title)}</div>`;
  if (sub) html += `<div class="status-sub">${escapeHtml(sub)}</div>`;
  if (data.matchId) html += `<div class="match-id">${escapeHtml(data.matchId)}</div>`;
  for (const btn of cfg.actions) {
    html += `<button class="btn ${btn.cls}" data-action="${btn.action}">${escapeHtml(btn.label)}</button>`;
  }

  content.innerHTML = html;

  content.querySelectorAll("button[data-action]").forEach((el) => {
    el.addEventListener("click", () => {
      const action = el.getAttribute("data-action");
      if (action === "retry") window.launcher.retry();
      if (action === "quit") window.launcher.quit();
    });
  });
});
