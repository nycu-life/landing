# AGENTS.md — NYCU LIFE Landing

The official NYCU LIFE marketing site (`官網`). A **static** SvelteKit app —
prerendered with `adapter-static` and served from a **Docker/nginx** container.
No backend, no runtime server.

## Stack

- **SvelteKit 2 / Svelte 5 / TypeScript 6**, **Vite 8**, **Tailwind CSS v4**
- **Paraglide (inlang)** i18n — `baseLocale: zh-tw`, also `en` (`project.inlang/`,
  messages in `messages/{zh-tw,en}.json`)
- **adapter-static** (fully prerendered SPA)
- Tooling: **pnpm 10.21.0**, **ESLint 10** + Prettier, `svelte-check`
- Tests: **Vitest** (unit + Storybook browser project) + **Playwright** e2e
- Node **24**

## Commands

```sh
pnpm install
pnpm dev                 # local dev server
pnpm build               # static build -> ./build
pnpm check               # svelte-check (type check)
pnpm lint                # prettier --check . && eslint .
pnpm format              # prettier --write .
pnpm test:unit -- --run  # vitest
pnpm test:e2e            # playwright (builds + previews, then runs e2e/)
pnpm test                # unit + e2e
pnpm storybook           # component workshop
```

CI (`.github/workflows/ci.yml`) runs `check` + `lint` + unit + e2e on every PR.
Keep all of them green — don't merge a red gate.

## Layout

- `src/routes/` — pages: `/` (hero + `OrbitWheel`), `products`, `about`,
  `courses`, `devlog`, `team/[slug]`. Navigation is a **burger menu**
  (`TopBar` + `MenuOverlay`), not a top nav bar.
- `src/lib/content/` — **page copy lives here as data** (`landing.ts`, `about.ts`,
  `team.ts`, `departments.ts`), wired to Paraglide messages. Edit content here,
  not inline in components.
- `src/lib/components/` — `glass/` (theme primitives: `Aurora`, `Eyebrow`, …) and
  `landing/` (page sections).
- `src/routes/layout.css` — **design tokens** (see below).

## Design tokens (heads-up)

Landing uses the **Liquid-Glass** theme: tokens `--ink` / `--brand` / `--glass`
(+ family) in `src/routes/layout.css`, plus global utility classes (`.glass`,
`.grad-text`). This is **a different token system from `activity`** (`--sbx-*`).
That divergence is tracked fleet-wide in the metarepo's `docs/tech-debt.md` — when
editing here, match this repo's tokens; don't import the other system.

## Deploy

- **Production**: `.github/workflows/docker.yml` builds and pushes
  `harbor.nycu.one/landing/web:latest`; ArgoCD deploys
  `nycu-life/k8s-manifests/apps/landing/overlays/prod` to `nycu.life`.
- **Docker**: `Dockerfile` serves the static output behind nginx at the root.
- `svelte.config.js` reads `SITE_BASE_PATH` for optional sub-path previews.

## Gotchas

- It's a **static** site: no server endpoints, no `+page.server.ts` data loading
  at request time — everything is prerendered at build.
- The default locale is **`zh-tw`**; the unprefixed `/` renders Chinese copy.
- Brand string "NYCU LIFE" is identical in both locales — safe to assert in tests.

## Visual acceptance gate

Every landing-page UI change must be inspected in a real browser before handoff.
Check the complete matrix, not only the viewport or theme mentioned in the latest
feedback:

- locales: Traditional Chinese and English;
- appearances: light and dark;
- viewport classes: desktop, tablet, and phone;
- every home-story chapter: hero, about, products, FAQ, and join.

For each state, check broken images, horizontal overflow, text clipping or
overlap, artwork scaling, centering, and excessively small or large content.
Run the Playwright visual-acceptance matrix in `e2e/smoke.test.ts`, then visually
inspect browser screenshots for all 12 locale/appearance/viewport combinations.
Do not describe the UI as finished from type checks or DOM geometry alone.
