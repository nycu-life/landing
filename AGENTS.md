# AGENTS.md — NYCU LIFE Landing

The official NYCU LIFE marketing site (`官網`). A SvelteKit app served by **adapter-node** in Docker. Fixed pages are
prerendered; Ghost dev log, comics, and sitemap render on request. The Wish API
remains a separate Go service.

## Stack

- **SvelteKit 2 / Svelte 5 / TypeScript 6**, **Vite 8**, **Tailwind CSS v4**
- **Paraglide (inlang)** i18n — `baseLocale: zh-tw`, also `en` (`project.inlang/`,
  messages in `messages/{zh-tw,en}.json`)
- **adapter-node** (prerendered fixed pages + runtime Ghost pages)
- Tooling: **pnpm 10.21.0**, **ESLint 10** + Prettier, `svelte-check`
- Tests: **Vitest** (unit + Storybook browser project) + **Playwright** e2e
- Node **24**

## Commands

```sh
pnpm install
pnpm dev                 # local dev server
pnpm build               # Node server + prerendered pages -> ./build
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

- `src/routes/` — public pages: `/` (scroll story: hero, about, products, FAQ,
  join), `/about/`, `/wishpool/`, `/devlog/` + `/devlog/<slug>/` (開發日誌) and
  `/comics/` + `/comics/<slug>/` (漫畫專區, not linked until episodes exist);
  both are Ghost content, see `docs/ghost.md`. `/wishpool/admin/` is noindex.
  `+error.svelte` is the 404/410 page. Navigation is the `TopBar` (About,
  home-section anchors, dev log, Wish Pool sticker).
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
- **Docker**: `Dockerfile` runs Node on port 3000. `GHOST_URL`,
  `GHOST_PUBLIC_URL`, and `GHOST_CONTENT_API_KEY` are runtime environment values;
  builds need no Ghost credentials. Catalogs refresh every 30 seconds.
  `docker/ghost/Dockerfile` packages the NYCU One SSO adapter.
- `svelte.config.js` reads `SITE_BASE_PATH` for optional sub-path previews.

## Gotchas

- Fixed pages inherit `prerender = true` from `+layout.ts`. Ghost content pages,
  sitemap, old media redirects, and the catch-all error route explicitly opt out.
- Ghost is read only at request time (`src/lib/server/ghost.ts`). Without config,
  local dev uses empty/placeholder content. A configured Ghost outage returns 503
  for content pages; fixed pages keep working. Catalogs use a 30-second cache.
- Ghost image URLs use the public `/cms/content/images/` route. The Node service
  uses the in-cluster Ghost URL for API calls and `GHOST_PUBLIC_URL` for images.
- The default locale is **`zh-tw`**; the unprefixed `/` renders Chinese copy.
- Brand string "NYCU LIFE" is identical in both locales — safe to assert in tests.
- **SEO routing** (see `docs/seo.md`): `/sitemap.xml` is generated from
  `src/lib/seo/pages.ts` (static pages) plus Ghost dev log posts and comic episodes. SvelteKit returns a real 404 for unknown paths (no SPA fallback to
  the home page) and 410 for withdrawn ones (`/courses/`, `/products/`,
  `/team/…`), both with the noindex `+error.svelte` page.
  Adding or withdrawing a page means updating the route, `src/lib/seo/pages.ts`,
  `src/routes/[...missing]/+page.server.ts`, and `e2e/seo.test.ts` together.

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
