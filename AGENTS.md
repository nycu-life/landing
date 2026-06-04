# AGENTS.md — NYCU LIFE Landing

The official NYCU LIFE marketing site (`官網`). A **static** SvelteKit app —
prerendered with `adapter-static` and served either from **GitHub Pages** or a
**Docker/nginx** container. No backend, no runtime server.

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

- **GitHub Pages**: `deploy-pages.yml` builds on push to `main` with
  `SITE_BASE_PATH=/<repo>` so assets resolve under the Pages sub-path.
- **Docker**: `Dockerfile` builds the static output behind nginx for cluster
  hosting. With no `SITE_BASE_PATH`, the site is served at root.
- `svelte.config.js` reads `SITE_BASE_PATH` (must be empty or start with `/`).

## Gotchas

- It's a **static** site: no server endpoints, no `+page.server.ts` data loading
  at request time — everything is prerendered at build.
- The default locale is **`zh-tw`**; the unprefixed `/` renders Chinese copy.
- Brand string "NYCU LIFE" is identical in both locales — safe to assert in tests.
