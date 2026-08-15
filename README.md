# Kult Games V3

Frontend for the Kult browser gaming experience.

## Getting started

Requirements:
- Node.js 18+
- npm

Install and run:

```sh
npm install
npm run dev
```
dd
Build for production:

```sh
npm run build
npm run preview
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint
- `npm run test` - run tests once
- `npm run test:watch` - run tests in watch mode

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query

## Cloudflare deployment

Production is deployed as a Cloudflare Worker with static assets using
Workers Builds. Connect this repository to the `kult-games-v3` Worker and use:

- Production branch: `main`
- Build command: `npm run build`
- Deploy command: `npx --yes wrangler@4.123.0 deploy`
- Root directory: `/`

Add public `VITE_*` values under **Settings → Build → Build Variables and
Secrets** in Cloudflare. Vite embeds these values into the browser bundle, so
they must never contain private credentials even when Cloudflare marks them as
secret.

Worker-only credentials belong under **Settings → Variables and Secrets** and
must not use a `VITE_` prefix. The current asset-only Worker has no runtime code
that consumes Worker secrets.

Local `.env` and `.dev.vars` files are ignored by Git and must not be committed.
