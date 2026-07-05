# AI Arena Launcher

Electron desktop app that handles the `aiarena://` protocol, launches `RoboWars.exe`
with match args, reads the result file it writes on exit, and POSTs the outcome to
the AI Arena gateway. See `../ROBOWAR_LAUNCHER_SPEC.md` for the full end-to-end flow.

## Develop

```bash
npm install
npm start
```

Test a deep link while it's running by opening this in a browser address bar
(or via `start` on Windows):

```
aiarena://launch?matchId=TEST&agentA=A&agentB=B
```

Before this works you need `RoboWars/RoboWars.exe` present locally (see `RoboWars/.gitkeep`).

## Build the installer

```bash
npm run build
```

Requires `assets/icon.ico` (see `assets/.gitkeep`) and the game files under `RoboWars/`.
Output: `build/AI Arena Launcher Setup <version>.exe`.

`electron-builder`'s `protocols` config in `package.json` registers the `aiarena://`
scheme in the Windows registry automatically during NSIS install/uninstall — no manual
registry edits needed.
