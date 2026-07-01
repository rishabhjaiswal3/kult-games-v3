# Highway Hustle — Frontend TODO

## Done
- [x] `HighwayHustleGamePage.tsx` created (full copy of ArenaGamePage, HH-specific wiring)
- [x] Route `/arena/highway-hustle/:battleId` added in `App.tsx`
- [x] `handleMatchFound` in `AIArenaPage.tsx` routes `highway-hustle` to new page
- [x] `VITE_HIGHWAY_HUSTLE_BUILD_URL=` added to `.env`

## Pending
- [ ] Build Highway Hustle Unity project as WebGL
  - Output files must be named: `HighwayHustle.loader.js`, `HighwayHustle.data`, `HighwayHustle.framework.js`, `HighwayHustle.wasm`
- [ ] Upload WebGL build to Cloudflare R2 (same bucket or new folder)
  - Set CORS policy on bucket: AllowedOrigins=["*"], AllowedMethods=["GET","HEAD"]
- [ ] Fill in `VITE_HIGHWAY_HUSTLE_BUILD_URL=https://pub-xxx.r2.dev/v1/HighwayHustle` in `.env`
- [ ] Test full flow: matchmaking → lobby → game loads → race ends → result overlay → commentary
