const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const https = require("https");
const log = require("electron-log");

// ─── Config ──────────────────────────────────────────────────────────────────

const GATEWAY_HOST = "aiarena-gateway.onrender.com";
const RESULT_DIR = path.join(app.getPath("appData"), "AIArena");
// Path to Unreal exe — bundled inside the installer next to main.js
const ROBOWAR_EXE = path.join(process.resourcesPath, "..", "RoboWars", "RoboWars.exe");

log.transports.file.level = "info";
log.info("AI Arena Launcher starting", { version: app.getVersion() });

// ─── Deep link handling on Windows ───────────────────────────────────────────
// On Windows, a second instance is launched with the URI as argv[1].
// We forward to the first instance and quit.

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (event, argv) => {
    const url = argv.find((a) => a.startsWith("aiarena://"));
    if (url) handleDeepLink(url);
    if (win) {
      win.show();
      win.focus();
    }
  });
}

// ─── Window ───────────────────────────────────────────────────────────────────

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 480,
    height: 560,
    resizable: false,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hidden",
    backgroundColor: "#040810",
  });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
  win.on("closed", () => {
    win = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Handle URI if launched directly via protocol (Windows sends it as argv[1])
  const url = process.argv.find((a) => a.startsWith("aiarena://"));
  if (url) handleDeepLink(url);
});

app.on("window-all-closed", () => app.quit());

// ─── Deep link parser ─────────────────────────────────────────────────────────

function handleDeepLink(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    log.error("Invalid launch URL", url);
    sendToRenderer("phase", { phase: "error", message: "Invalid launch URL." });
    return;
  }

  const matchId = parsed.searchParams.get("matchId");
  const agentA = parsed.searchParams.get("agentA");
  const agentB = parsed.searchParams.get("agentB");

  if (!matchId || !agentA || !agentB) {
    log.error("Missing params in launch URL", url);
    sendToRenderer("phase", {
      phase: "error",
      message: "Missing matchId, agentA, or agentB in launch URL.",
    });
    return;
  }

  launchMatch(matchId, agentA, agentB);
}

// ─── Launch match ─────────────────────────────────────────────────────────────

function launchMatch(matchId, agentA, agentB) {
  log.info("Launching match", { matchId, agentA, agentB });
  sendToRenderer("phase", { phase: "launching", matchId });

  // Check exe exists
  if (!fs.existsSync(ROBOWAR_EXE)) {
    log.error("RoboWars.exe not found", ROBOWAR_EXE);
    sendToRenderer("phase", {
      phase: "error",
      message: `RoboWars.exe not found at: ${ROBOWAR_EXE}`,
    });
    return;
  }

  // Ensure result dir exists
  fs.mkdirSync(RESULT_DIR, { recursive: true });

  // Clean up any leftover result file from a previous match
  const resultPath = path.join(RESULT_DIR, `result_${matchId}.json`);
  if (fs.existsSync(resultPath)) fs.unlinkSync(resultPath);

  const proc = spawn(
    ROBOWAR_EXE,
    [`-matchId=${matchId}`, `-agentA=${agentA}`, `-agentB=${agentB}`],
    {
      detached: false,
      stdio: "ignore",
    }
  );

  sendToRenderer("phase", { phase: "waiting", matchId });

  proc.on("error", (err) => {
    log.error("Failed to start game", err);
    sendToRenderer("phase", { phase: "error", message: `Failed to start game: ${err.message}` });
  });

  proc.on("close", (code) => {
    log.info("RoboWars.exe exited", { code });
    readResultAndSubmit(matchId);
  });
}

// ─── Read result file and POST to backend ────────────────────────────────────

function readResultAndSubmit(matchId) {
  const resultPath = path.join(RESULT_DIR, `result_${matchId}.json`);

  sendToRenderer("phase", { phase: "submitting", matchId });

  // Retry reading the file for up to 10s (Unreal may still be flushing)
  let attempts = 0;
  const tryRead = () => {
    if (fs.existsSync(resultPath)) {
      let result;
      try {
        result = JSON.parse(fs.readFileSync(resultPath, "utf8"));
      } catch (e) {
        log.error("Could not parse result file", e);
        sendToRenderer("phase", { phase: "error", message: "Could not parse result file." });
        return;
      }
      submitResult(result);
    } else if (attempts < 10) {
      attempts++;
      setTimeout(tryRead, 1000);
    } else {
      log.error("No result file produced", resultPath);
      sendToRenderer("phase", {
        phase: "error",
        message: "Game closed without producing a result. Please retry.",
      });
    }
  };
  tryRead();
}

// ─── POST /v1/battles/:id/end ─────────────────────────────────────────────────

function submitResult(result) {
  const body = JSON.stringify({
    winnerId: result.winnerId,
    loserId: result.loserId,
    rounds: result.rounds ?? 1,
  });

  const options = {
    hostname: GATEWAY_HOST,
    path: `/v1/battles/${result.matchId}/end`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });
    res.on("end", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        log.info("Result submitted", { matchId: result.matchId });
        sendToRenderer("phase", { phase: "done", matchId: result.matchId });
        // Clean up result file
        const resultPath = path.join(RESULT_DIR, `result_${result.matchId}.json`);
        try {
          fs.unlinkSync(resultPath);
        } catch {}
      } else {
        log.error("Backend rejected result", res.statusCode, data);
        sendToRenderer("phase", {
          phase: "error",
          message: `Backend returned ${res.statusCode}: ${data}`,
        });
      }
    });
  });

  req.on("error", (err) => {
    log.error("Network error submitting result", err);
    sendToRenderer("phase", { phase: "error", message: `Network error: ${err.message}` });
  });

  req.write(body);
  req.end();
}

// ─── IPC ─────────────────────────────────────────────────────────────────────

function sendToRenderer(channel, data) {
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, data);
  }
}

ipcMain.on("retry", () => {
  sendToRenderer("phase", { phase: "idle" });
});

ipcMain.on("quit", () => {
  app.quit();
});
