# RoboWars Launcher — Full Implementation Spec

**Platform:** Windows only (for now)  
**Status:** Frontend fully done. Need: (1) Unreal changes, (2) Electron launcher.  
**Goal:** User clicks "Launch RoboWars" on the web page → `aiarena://` opens the launcher → launcher runs the Unreal game → game ends → launcher POSTs result to backend → web page auto-transitions to result overlay.

---

## How the full flow works (end-to-end)

```
Browser (kult-games-v3)
  │
  │  1. User clicks "Launch RoboWars"
  │  2. Frontend opens: aiarena://launch?matchId=abc123&agentA=id1&agentB=id2
  │
  ▼
Windows OS
  │  3. Looks up registry: HKCR\aiarena → runs AIArenaLauncher.exe "%1"
  ▼
Electron Launcher (AIArenaLauncher.exe)
  │  4. Parses URI, extracts matchId / agentA / agentB
  │  5. Shows "Launching match…" UI
  │  6. Spawns: RoboWars.exe -matchId=abc123 -agentA=id1 -agentB=id2
  │  7. Monitors process — shows progress UI
  │  8. Unreal game runs and completes
  │  9. Unreal writes result to: %APPDATA%\AIArena\result_abc123.json
  │  10. Launcher reads result file
  │  11. Launcher POSTs to: /v1/battles/abc123/end  { winnerId, loserId, ... }
  │  12. Launcher shows "Battle submitted" screen
  ▼
Backend (aiarena-gateway)
  │  13. Sets battle.status = "COMPLETED"
  ▼
Browser (polling every 2s)
  │  14. Detects status === "COMPLETED"
  │  15. Builds RobowarDuelResult, calls 0G commentary + memory
  │  16. Shows BattleResultOverlay
```

---

## Part 1 — Unreal Engine Changes

### 1.1 Read command-line arguments at game start

When the launcher spawns `RoboWars.exe`, it passes three args:

```
RoboWars.exe -matchId=abc123 -agentA=agent-id-1 -agentB=agent-id-2
```

In your Unreal C++ (GameInstance or GameMode `Init`):

```cpp
#include "Misc/CommandLine.h"

FString MatchId, AgentAId, AgentBId;

FParse::Value(FCommandLine::Get(), TEXT("-matchId="), MatchId);
FParse::Value(FCommandLine::Get(), TEXT("-agentA="),  AgentAId);
FParse::Value(FCommandLine::Get(), TEXT("-agentB="),  AgentBId);

// Store in GameInstance so all blueprints can access them
UMyGameInstance* GI = Cast<UMyGameInstance>(GetGameInstance());
GI->MatchId  = MatchId;
GI->AgentAId = AgentAId;
GI->AgentBId = AgentBId;
```

**Blueprint alternative:** Use `Parse Command Line` node in GameInstance BeginPlay.  
Both methods work — pick whatever fits your project setup.

---

### 1.2 Write result JSON when the match ends

When the match finishes (bot dies, time up, whatever your win condition is), write a result file **before** quitting.

**File path (must match launcher exactly):**
```
%APPDATA%\AIArena\result_{matchId}.json
```
On Windows this resolves to:  
`C:\Users\{username}\AppData\Roaming\AIArena\result_abc123.json`

**File contents:**
```json
{
  "matchId":    "abc123",
  "winnerId":   "agent-id-1",
  "loserId":    "agent-id-2",
  "winnerHp":   72,
  "loserHp":    0,
  "rounds":     3,
  "durationSeconds": 145
}
```

**Unreal C++ to write the file:**

```cpp
#include "Misc/Paths.h"
#include "Misc/FileHelper.h"
#include "HAL/PlatformFileManager.h"

void WriteResultFile(FString MatchId, FString WinnerId, FString LoserId,
                     int32 WinnerHp, int32 Rounds, int32 Duration)
{
    // Build path: %APPDATA%/AIArena/
    FString AppData = FPlatformMisc::GetEnvironmentVariable(TEXT("APPDATA"));
    FString Dir     = AppData / TEXT("AIArena");
    FString FilePath = Dir / FString::Printf(TEXT("result_%s.json"), *MatchId);

    // Create dir if missing
    IPlatformFile& PF = FPlatformFileManager::Get().GetPlatformFile();
    PF.CreateDirectoryTree(*Dir);

    // Build JSON string manually (no extra plugin needed)
    FString Json = FString::Printf(
        TEXT("{\n")
        TEXT("  \"matchId\": \"%s\",\n")
        TEXT("  \"winnerId\": \"%s\",\n")
        TEXT("  \"loserId\": \"%s\",\n")
        TEXT("  \"winnerHp\": %d,\n")
        TEXT("  \"loserHp\": 0,\n")
        TEXT("  \"rounds\": %d,\n")
        TEXT("  \"durationSeconds\": %d\n")
        TEXT("}"),
        *MatchId, *WinnerId, *LoserId, WinnerHp, Rounds, Duration
    );

    FFileHelper::SaveStringToFile(Json, *FilePath);
}
```

Call `WriteResultFile(...)` from your game-over / match-end logic **before** calling `FGenericPlatformMisc::RequestExit(false)` or closing the window.

---

### 1.3 Then quit the game

After writing the result file:

```cpp
// Give file a moment to flush, then quit
FPlatformMisc::RequestExit(false); // false = graceful quit
```

The launcher is watching for the process to exit. Once it exits, it reads the result file.

---

### 1.4 Test the Unreal side in isolation

Before building the launcher, verify the file writing works:

1. Run from command line:
   ```
   RoboWars.exe -matchId=TEST001 -agentA=agentXXX -agentB=agentYYY
   ```
2. Play through a match
3. Check `C:\Users\{you}\AppData\Roaming\AIArena\result_TEST001.json` exists and is valid JSON

---

## Part 2 — Electron Launcher

### 2.1 Project structure

```
ai-arena-launcher/
  package.json
  main.js              ← Electron main process (all the logic)
  preload.js           ← Exposes safe IPC to renderer
  renderer/
    index.html         ← Launcher UI (idle / launching / waiting / done / error)
    renderer.js        ← UI logic, listens to IPC events from main
  assets/
    icon.ico           ← App icon (required for installer)
    logo.png
  build/               ← electron-builder config output
  RoboWars/            ← Unreal game files go here (or configured separately)
    RoboWars.exe
    RoboWars/          ← UE content folder
```

---

### 2.2 package.json

```json
{
  "name": "ai-arena-launcher",
  "version": "1.0.0",
  "description": "AI Arena Desktop Launcher — RoboWars",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win --x64",
    "build:dir": "electron-builder --win --dir"
  },
  "dependencies": {
    "electron-log": "^5.1.2"
  },
  "devDependencies": {
    "electron": "^31.0.0",
    "electron-builder": "^24.13.3"
  },
  "build": {
    "appId": "io.aiarena.launcher",
    "productName": "AI Arena Launcher",
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    },
    "protocols": [
      {
        "name": "AI Arena Launcher",
        "schemes": ["aiarena"]
      }
    ],
    "files": [
      "main.js",
      "preload.js",
      "renderer/**/*",
      "assets/**/*"
    ],
    "extraFiles": [
      {
        "from": "RoboWars",
        "to": "RoboWars",
        "filter": ["**/*"]
      }
    ]
  }
}
```

**Key point:** The `"protocols"` field in the build config makes `electron-builder` write the `aiarena://` registry entries automatically during NSIS install. You do NOT need to write registry entries manually.

---

### 2.3 main.js (full implementation)

```js
const { app, BrowserWindow, ipcMain } = require("electron");
const { spawn, execFile }             = require("child_process");
const path  = require("path");
const fs    = require("fs");
const https = require("https");

// ─── Config ──────────────────────────────────────────────────────────────────

const GATEWAY_URL   = "https://aiarena-gateway.onrender.com";
const RESULT_DIR    = path.join(app.getPath("appData"), "AIArena");
// Path to Unreal exe — bundled inside the installer next to main.js
const ROBOWAR_EXE   = path.join(process.resourcesPath, "..", "RoboWars", "RoboWars.exe");

// ─── Deep link handling on Windows ───────────────────────────────────────────
// On Windows, a second instance is launched with the URI as argv[1].
// We forward to the first instance and quit.

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (event, argv) => {
    // argv on Windows: ["...", "--allow-file-access...", "aiarena://launch?..."]
    const url = argv.find((a) => a.startsWith("aiarena://"));
    if (url) handleDeepLink(url);
    if (win) { win.show(); win.focus(); }
  });
}

// ─── Window ───────────────────────────────────────────────────────────────────

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width:  480,
    height: 560,
    resizable: false,
    icon: path.join(__dirname, "assets", "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration:  false,
    },
    titleBarStyle: "hidden",
    backgroundColor: "#040810",
  });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
  win.on("closed", () => { win = null; });
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
    sendToRenderer("phase", { phase: "error", message: "Invalid launch URL." });
    return;
  }

  const matchId  = parsed.searchParams.get("matchId");
  const agentA   = parsed.searchParams.get("agentA");
  const agentB   = parsed.searchParams.get("agentB");

  if (!matchId || !agentA || !agentB) {
    sendToRenderer("phase", { phase: "error", message: "Missing matchId, agentA, or agentB in launch URL." });
    return;
  }

  launchMatch(matchId, agentA, agentB);
}

// ─── Launch match ─────────────────────────────────────────────────────────────

function launchMatch(matchId, agentA, agentB) {
  sendToRenderer("phase", { phase: "launching", matchId });

  // Check exe exists
  if (!fs.existsSync(ROBOWAR_EXE)) {
    sendToRenderer("phase", {
      phase:   "error",
      message: `RoboWars.exe not found at: ${ROBOWAR_EXE}`,
    });
    return;
  }

  // Ensure result dir exists
  fs.mkdirSync(RESULT_DIR, { recursive: true });

  // Clean up any leftover result file from a previous match
  const resultPath = path.join(RESULT_DIR, `result_${matchId}.json`);
  if (fs.existsSync(resultPath)) fs.unlinkSync(resultPath);

  const proc = spawn(ROBOWAR_EXE, [
    `-matchId=${matchId}`,
    `-agentA=${agentA}`,
    `-agentB=${agentB}`,
  ], {
    detached: false,
    stdio:    "ignore",
  });

  sendToRenderer("phase", { phase: "waiting", matchId });

  proc.on("error", (err) => {
    sendToRenderer("phase", { phase: "error", message: `Failed to start game: ${err.message}` });
  });

  proc.on("close", (code) => {
    readResultAndSubmit(matchId, agentA, agentB);
  });
}

// ─── Read result file and POST to backend ────────────────────────────────────

function readResultAndSubmit(matchId, agentAFallback, agentBFallback) {
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
        sendToRenderer("phase", { phase: "error", message: "Could not parse result file." });
        return;
      }
      submitResult(result);
    } else if (attempts < 10) {
      attempts++;
      setTimeout(tryRead, 1000);
    } else {
      // No result file — game crashed or was closed. Submit as cancelled.
      sendToRenderer("phase", {
        phase:   "error",
        message: "Game closed without producing a result. Please retry.",
      });
    }
  };
  tryRead();
}

// ─── POST /v1/battles/:id/end ─────────────────────────────────────────────────

function submitResult(result) {
  const body = JSON.stringify({
    winnerId:        result.winnerId,
    loserId:         result.loserId,
    winnerHp:        result.winnerHp        ?? 100,
    loserHp:         result.loserHp         ?? 0,
    rounds:          result.rounds          ?? 1,
    durationSeconds: result.durationSeconds ?? 0,
  });

  const options = {
    hostname: "aiarena-gateway.onrender.com",
    path:     `/v1/battles/${result.matchId}/end`,
    method:   "POST",
    headers:  {
      "Content-Type":   "application/json",
      "Content-Length": Buffer.byteLength(body),
    },
  };

  const req = https.request(options, (res) => {
    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        sendToRenderer("phase", { phase: "done", matchId: result.matchId });
        // Clean up result file
        const resultPath = path.join(RESULT_DIR, `result_${result.matchId}.json`);
        try { fs.unlinkSync(resultPath); } catch {}
      } else {
        sendToRenderer("phase", {
          phase:   "error",
          message: `Backend returned ${res.statusCode}: ${data}`,
        });
      }
    });
  });

  req.on("error", (err) => {
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
```

---

### 2.4 preload.js

```js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("launcher", {
  onPhase: (cb) => ipcRenderer.on("phase", (_event, data) => cb(data)),
  retry:   ()   => ipcRenderer.send("retry"),
  quit:    ()   => ipcRenderer.send("quit"),
});
```

---

### 2.5 renderer/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AI Arena Launcher</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #040810;
      color: #fff;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      padding: 32px;
    }
    .title-bar {
      position: fixed; top: 0; left: 0; right: 0;
      height: 32px; background: #020509;
      -webkit-app-region: drag;
      display: flex; align-items: center;
      padding: 0 16px;
      font-size: 11px; color: rgba(255,255,255,0.3);
    }
    .logo { font-size: 22px; font-weight: 900; letter-spacing: 0.05em; }
    .logo span { color: #dc2626; }
    .status-icon { font-size: 48px; }
    .status-title { font-size: 20px; font-weight: 700; text-align: center; }
    .status-sub { font-size: 12px; color: rgba(255,255,255,0.4); text-align: center; max-width: 320px; line-height: 1.6; }
    .match-id { font-family: monospace; font-size: 10px; color: rgba(255,255,255,0.2); }
    .btn {
      padding: 12px 32px; border-radius: 10px; border: none;
      font-size: 13px; font-weight: 700; cursor: pointer;
      transition: opacity 0.15s;
    }
    .btn:hover { opacity: 0.85; }
    .btn-red { background: #dc2626; color: #fff; }
    .btn-gray { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.12); }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #dc2626;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    #phase-done { display: none; }
  </style>
</head>
<body>
  <div class="title-bar">AI Arena Launcher</div>

  <div class="logo">AI <span>ARENA</span></div>

  <div id="content">
    <!-- Populated by renderer.js based on phase events -->
    <div class="status-icon">🤖</div>
    <div class="status-title">Ready</div>
    <div class="status-sub">Waiting for a match to be launched from the browser.</div>
  </div>

  <script src="renderer.js"></script>
</body>
</html>
```

---

### 2.6 renderer/renderer.js

```js
const content = document.getElementById("content");

const PHASES = {
  idle: {
    icon:  "🤖",
    title: "Ready",
    sub:   "Waiting for a match to be launched from the browser.",
    actions: [],
  },
  launching: {
    icon:  null, // spinner
    title: "Launching RoboWars…",
    sub:   "Starting the game, this takes a few seconds.",
    actions: [],
  },
  waiting: {
    icon:  null, // spinner
    title: "Battle in Progress",
    sub:   "The robots are fighting. This window will update automatically when the match ends.",
    actions: [],
  },
  submitting: {
    icon:  null,
    title: "Submitting Result…",
    sub:   "Uploading battle result to the AI Arena backend.",
    actions: [],
  },
  done: {
    icon:  "✅",
    title: "Battle Complete!",
    sub:   "Results submitted. You can close this window — the browser page will show the outcome automatically.",
    actions: [{ label: "Close Launcher", cls: "btn-gray", action: "quit" }],
  },
  error: {
    icon:  "⚠️",
    title: "Something Went Wrong",
    sub:   null, // filled from message
    actions: [
      { label: "Try Again", cls: "btn-red",  action: "retry" },
      { label: "Close",     cls: "btn-gray", action: "quit"  },
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
  html += `<div class="status-title">${cfg.title}</div>`;
  if (sub) html += `<div class="status-sub">${sub}</div>`;
  if (data.matchId) html += `<div class="match-id">${data.matchId}</div>`;
  for (const btn of cfg.actions) {
    html += `<button class="btn ${btn.cls}" onclick="window.launcher.${btn.action}()">${btn.label}</button>`;
  }

  content.innerHTML = html;
});
```

---

### 2.7 Registry — how it works on Windows

`electron-builder` handles this automatically when you include the `"protocols"` field in `package.json`. During NSIS install it writes:

```
HKEY_CLASSES_ROOT\aiarena
  (Default) = "URL:AI Arena Protocol"
  URL Protocol = ""
  shell\open\command
    (Default) = "C:\Program Files\AI Arena Launcher\AI Arena Launcher.exe" "%1"
```

**You do not need to write registry entries manually.**  
They are created on install and removed on uninstall.

---

## Part 3 — Build & Distribution

### 3.1 Build the installer

```bash
npm install
npm run build
```

Output: `build/AI Arena Launcher Setup 1.0.0.exe`

This is the file you upload to the URL set in `VITE_LAUNCHER_DOWNLOAD_URL`.

### 3.2 Update .env in kult-games-v3

```env
VITE_LAUNCHER_DOWNLOAD_URL=https://your-cdn.com/AIArenaLauncherSetup.exe
VITE_LAUNCHER_PROTOCOL=aiarena
```

The "Download Launcher" button on the pre-match screen uses `VITE_LAUNCHER_DOWNLOAD_URL`.

---

## Part 4 — Checklist (do in order)

### Unreal side
- [ ] Read `-matchId`, `-agentA`, `-agentB` from command line on game start
- [ ] Store in GameInstance (accessible everywhere in blueprints/C++)
- [ ] On match end: write `%APPDATA%\AIArena\result_{matchId}.json` with winnerId, loserId, winnerHp, rounds, durationSeconds
- [ ] Call `RequestExit(false)` after writing the file
- [ ] **Test in isolation:** run exe from terminal with fake args, play to end, confirm JSON file appears

### Launcher side
- [x] Create project, `npm install` — scaffolded at `ai-arena-launcher/`
- [x] Copy `main.js`, `preload.js`, `renderer/index.html`, `renderer/renderer.js` from this spec
- [ ] Place Unreal build files inside `RoboWars/` folder in the project root (needs the actual game build)
- [x] Verify `ROBOWAR_EXE` path in `main.js` points correctly
- [ ] `npm start` — test by running `aiarena://launch?matchId=TEST&agentA=A&agentB=B` from the browser address bar (needs a local `npm install` + a `RoboWars.exe` to fully exercise)
- [ ] Confirm window opens, game spawns, result file is read, backend POST fires
- [ ] `npm run build` — generates NSIS installer (needs `assets/icon.ico`)
- [ ] Install the output `.exe`, test the full browser → launcher → game → result flow

**Note:** `submitResult()` in `main.js` was aligned to the real `AiArenaEndBattleRequest` shape
(`winnerId`, `loserId`, `rounds` — see `src/types/aiArenaGateway.ts:521`), not the `winnerHp`/`loserHp`/
`durationSeconds` shape sketched earlier in Part 6 of this doc, since those fields aren't in the
actual backend contract.

### Frontend / env
- [ ] Upload installer `.exe` to CDN / R2
- [ ] Set `VITE_LAUNCHER_DOWNLOAD_URL` to the installer URL
- [ ] Redeploy frontend

---

## Part 5 — Key constants / paths (hardcoded in launcher)

| Item | Value |
|---|---|
| URI scheme | `aiarena` |
| Launch command format | `aiarena://launch?matchId=X&agentA=Y&agentB=Z` |
| Result file dir | `%APPDATA%\AIArena\` |
| Result file name | `result_{matchId}.json` |
| Backend endpoint | `POST https://aiarena-gateway.onrender.com/v1/battles/{matchId}/end` |
| Unreal exe location | `{installDir}\RoboWars\RoboWars.exe` |
| Frontend polling interval | 2 seconds |
| Frontend idle timeout | 10 minutes |

---

## Part 6 — endBattle request body shape

This is what `main.js` POSTs to `/v1/battles/{matchId}/end`. Match this to what the backend expects:

```json
{
  "winnerId":        "agent-id-string",
  "loserId":         "agent-id-string",
  "winnerHp":        72,
  "loserHp":         0,
  "rounds":          3,
  "durationSeconds": 145
}
```

Check `AiArenaEndBattleRequest` in  
`kult-games-v3/src/types/aiArenaGateway.ts` (line ~521) for the authoritative field list.  
If the backend needs extra fields, add them to the Unreal result JSON and forward them in `submitResult()`.

---

## Part 7 — Frontend files already done (do NOT touch)

These are complete and committed to `kult-games-v3` on branch `main`:

| File | What it does |
|---|---|
| `src/pages/RobowarGamePage.tsx` | Full page — pre-match, waiting, result overlay |
| `src/components/launcher/LauncherPreMatchView.tsx` | "Launch RoboWars" landing |
| `src/components/launcher/LauncherWaitingScreen.tsx` | Animated progress during battle |
| `src/components/launcher/LauncherNotInstalledModal.tsx` | Install instructions + download button |
| `src/components/launcher/LauncherErrorView.tsx` | Error / timeout / cancelled screens |
| `src/hooks/useLauncherBattle.ts` | State machine: idle→launching→waiting→complete/error |
| `src/hooks/useLauncherDetection.ts` | `aiarena://` open + blur detection (3s timeout) |
| `src/constants/launcher.ts` | `LauncherPhase` type, step config, timeout values |

The browser detects launcher installation by watching for a `window blur` or `visibilitychange` event within 3 seconds of opening the URI. If neither fires, it shows the "Launcher Required" modal.

---

*Generated 2026-07-05. Pick this up in a new session with: "Implement the AI Arena Launcher per ROBOWAR_LAUNCHER_SPEC.md"*
