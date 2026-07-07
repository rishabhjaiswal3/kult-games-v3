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

## Part 1 — Unreal Engine Changes (Blueprint-only project)

This project has no C++ module, so every change below is described as Blueprint nodes/wiring
to build in the editor. Names below (`WhichStep`, `BP_OrgMenu`, `BP_PlayerRobot`, `BP_EnemyRobot`,
`Map_RobotWars`, `TriggerVolume_1`) match the pasted `Map_RobotWars` level Blueprint graph.

**Status: not yet built — none of this exists in the project yet.** This is a plan to build, not a
record of changes already made (I cannot edit `.uasset` Blueprint graphs directly with my tools —
they're binary, not text files. Everything here has to be wired by hand in the Unreal Editor).

### 1.1 New GameInstance Blueprint — parse command-line args

1. Create `BP_AIArenaGameInstance` (parent class `Game Instance`) if one doesn't already exist.
   Set it as the project's default GameInstance: **Edit → Project Settings → Maps & Modes → Game Instance Class**.
2. Add variables: `MatchId` (String), `AgentAId` (String), `AgentBId` (String), `bLaunchedFromArgs` (Boolean).
3. On `Event Init`:
   - `Get Command Line` (pure node, `UKismetSystemLibrary::GetCommandLine`) → gives the full command-line string.
   - `Parse Param Value` (`UKismetSystemLibrary::ParseParamValue`) three times, with `Param` = `"-matchId="`, `"-agentA="`, `"-agentB="` → outputs into `MatchId`/`AgentAId`/`AgentBId`.
   - `bLaunchedFromArgs` = `Not Equal (String)` on `MatchId` vs empty string (true only when actually launched with args — this is what keeps local in-editor menu testing working, per your "conditional skip" answer).

This matches the original spec's "Blueprint alternative: Parse Command Line node" note — `ParseParamValue` is the concrete node for it.

---

### 1.2 `Map_RobotWars` — skip Main Menu when launched with args

**Confirmed via the actual graph** (not a guess): `Event Tick` on `Map_RobotWars` runs a `Sequence`
with a branch called `Go to GamePlay` that checks `Widget_Menu → Which Step? == "GamePlay"`, guarded
by `Do Once`. When that condition is true, it automatically: repositions `BP_EnemyRobot` and
`BP_PlayerRobot` to their arena spawn transforms, resets `Enemy Energy Count`/`Player Health`, hides
`Widget_Menu`, stops the `MenumasterSequence`, switches the camera to `BP_GameplayCam`, fades in,
and arms robot physics. This is the exact same thing the in-game "Play" button does — its
`On Released (Play_Btn)` handler in `BP_OrgMenu` does `SET Which Step? = "GamePlay"`.

`WhichStep?` is a plain public `String` variable on `BP_OrgMenu`, so it already has an
auto-generated `Set Which Step?` node — no new function needed.

**The entire change**, added to `Map_RobotWars`'s `Event BeginPlay`:
1. `Get Game Instance` → `Cast to BP_AIArenaGameInstance` → `Get bLaunchedFromArgs` → `Branch`
2. **True branch:** `Widget_Menu` → `Set Which Step?` = `"GamePlay"`
3. **False branch:** do nothing — existing behavior untouched for local/in-editor testing.

Because `Event Tick`'s `Go to GamePlay` block already polls `Which Step?` every frame and is
`Do Once`-guarded, it fires itself on the very next tick once this is set — no duplicated logic,
no need to call anything else. (Optional/cosmetic: you can also immediately hide/skip the intro
splash widget from `Event BeginPlay` on the true branch if you don't want the intro to play at all
before the jump to gameplay — not required for functionality.)

---

### 1.3 Display agent IDs instead of the entered player name

**Confirmed via the actual graph:** `BP_OrgMenu` has a `NameSave` (String) variable that is the
single source of truth for the player's typed name — set live from `OnTextChanged (Name?)`, then
validated non-empty on `On Clicked (NameOK_Btn)` before the name-entry window hides.

**Fix:** in the exact same `Branch` (true branch, `bLaunchedFromArgs`) added to `Map_RobotWars`'s
`Event BeginPlay` in step 1.2, add one more `Set` call alongside `Set Which Step? = "GamePlay"`:
- `Widget_Menu` → `Set NameSave` = `AgentAId` (from `BP_AIArenaGameInstance`)

This pre-fills the name before anything downstream reads it, and since the whole name-entry screen
is being bypassed anyway (menu skipped straight to `"GamePlay"`), there's no need to touch
`BP_OrgMenu`'s own text-input nodes at all.

**Still to confirm:** where `NameSave` is actually *displayed* during gameplay (the HUD) — likely in
`Event Tick`'s `New User Save Game` (Then 2) block, which probably writes it into the save-game
object and/or a HUD text widget. If there's a second name field for the opponent (enemy), it needs
the same treatment with `AgentBId`, but it may turn out the enemy's name isn't shown via `NameSave`
at all (single-player games usually only capture "your" name) — need to see that block to know for
sure whether a second widget/variable needs the same override.

---

### 1.4 AI vs AI — possess `BP_PlayerRobot` with an AI Controller instead of a Player Controller

Since `BP_EnemyRobot` already has a working AI Controller/Behavior Tree, reuse it rather than
rewriting `BP_PlayerRobot`'s combat logic:

1. On `BP_PlayerRobot`, add an instance-editable variable `AIControllerOverrideClass`
   (type `AI Controller` class reference), default = the same AI Controller class already assigned to `BP_EnemyRobot`.
2. In `BP_PlayerRobot`'s `Event BeginPlay`: `Get Game Instance` → cast → `Get bLaunchedFromArgs` → `Branch`.
   - **True:** `Get Controller` → `Unpossess` → `Spawn Actor from Class` (`AIControllerOverrideClass`)
     → `Possess` (self) from that new AI controller. This turns the "player" robot into a second
     AI agent using the exact same behavior tree logic as the enemy, without touching its movement/combat nodes.
   - **False:** do nothing — existing Player Controller possession stays intact for local testing.
3. Where `Map_RobotWars` currently does `Get Player Controller (0)` and possesses `BP_PlayerRobot`
   directly, gate that call behind the same `bLaunchedFromArgs` branch so it's skipped in the AI-vs-AI case.

---

### 1.5 End screen — Close-only button that writes the result and quits

Find your win/lose end-screen widget (tied into the `TriggerVolume_1` overlap + score logic that
currently detects `BP_EnemyRobot`/`BP_PlayerRobot` by display name). Remove the "Return to Main Menu"
button. Keep/add a single **Close** button.

`Close` button `OnClicked`:
1. Determine winner/loser: whichever robot actor is still alive/undestroyed maps to `AgentAId` or
   `AgentBId` from the GameInstance (you already have per-robot references from the existing `TriggerVolume_1` logic).
2. Build the result JSON string (same shape as before: `matchId`, `winnerId`, `loserId`, `rounds`).
3. Write it to `%APPDATA%\AIArena\result_{matchId}.json` using **Blueprint FileSDK** (installed and
   enabled). Exact node wiring, in order:
   - `Get Environment Variable` (`VariableName` = `"APPDATA"`) → gives you `C:\Users\{user}\AppData\Roaming`.
   - `Append` (string) that with `"\AIArena\result_"` + `MatchId` (from GameInstance) + `".json"` →
     this is your full `FileName` path.
   - `Create Directory` (`DirectoryName` = `AppData + "\AIArena"`, `CreateDirectoryTree` = true) —
     run this before the write in case `%APPDATA%\AIArena` doesn't exist yet. Safe to call even if it
     already exists.
   - `Write String to File` (`FileName` = the full path built above, `Content` = your JSON string,
     `Append` = false, `Encoding` = Auto Detect or Force UTF8) → returns bool, branch on failure if
     you want an on-screen error instead of silently failing.
   - Then `Quit Game`.

   All three of these (`Get Environment Variable`, `Create Directory`, `Write String to File`) are
   real nodes confirmed in the plugin's source (`FileSDKBPLibrary.h`) — no further plugin research needed.
4. `Quit Game` (`UGameplayStatics::QuitGame`, target = own Player Controller) right after the write —
   same as spec Part 1.3's `RequestExit`.

---

### 1.6 Test in isolation

1. Run from command line: `RoboWars.exe -matchId=TEST001 -agentA=agentXXX -agentB=agentYYY`
2. Confirm the game skips straight to battle, both robots fight autonomously, and the HUD shows
   `agentXXX` / `agentYYY` instead of a typed name.
3. Let the match resolve, click **Close**, confirm `C:\Users\{you}\AppData\Roaming\AIArena\result_TEST001.json`
   exists and is valid JSON, and the game process has exited (so the launcher's `proc.on("close")` fires).
4. Run again with no args (double-click the exe) and confirm the normal menu still works — this is
   what the `bLaunchedFromArgs` gate is protecting.

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
- [x] Create project, `npm install` — scaffolded at `ai-arena-launcher/`, `npm install` run and verified (0 vulnerabilities in the shipped runtime deps; audit findings are all in `electron-builder`'s build-time-only deps)
- [x] Copy `main.js`, `preload.js`, `renderer/index.html`, `renderer/renderer.js` from this spec
- [ ] Place Unreal build files inside `RoboWars/` folder in the project root (needs the actual game build — not available in this environment)
- [x] Verify `ROBOWAR_EXE` path in `main.js` points correctly — confirmed via dev run: resolves to `<electron-dir>/RoboWars/RoboWars.exe` in dev and to a sibling `RoboWars/` folder next to `resources/` once packaged, matching the `extraFiles` config
- [x] `npm start` — smoke-tested: app boots cleanly, no startup errors
- [x] Confirm window opens, deep link (`aiarena://launch?matchId=TEST001&agentA=agentXXX&agentB=agentYYY`) is parsed correctly, and missing-exe case fails gracefully (logs + surfaces an "error" phase instead of crashing)
- [ ] Full match spawn → result file read → backend POST (blocked on having an actual `RoboWars.exe` to run)
- [ ] `npm run build` — generates NSIS installer (needs `assets/icon.ico`, not available in this environment)
- [ ] Install the output `.exe`, test the full browser → launcher → game → result flow

**Also added:** `app.setAsDefaultProtocolClient("aiarena", ...)` call in `main.js` so `aiarena://`
links work when running unpackaged via `npm start` (dev), not just after NSIS install — needed to
make the manual test step above actually runnable pre-build.

**Note:** `submitResult()` in `main.js` was aligned to the real `AiArenaEndBattleRequest` shape
(`winnerId`, `loserId`, `rounds` — see `src/types/aiArenaGateway.ts:521`), not the `winnerHp`/`loserHp`/
`durationSeconds` shape sketched earlier in Part 6 of this doc, since those fields aren't in the
actual backend contract. Cross-checked against the backend (`0g-AIArena/services/battle-service/src/routes/battle.routes.ts:72`
and the gateway proxy rule in `services/api-gateway/src/main.ts:174`) — the route, path rewriting,
and request body all line up with what the launcher sends; no backend changes were needed.

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
