# Prototype Fidelity Implementation Plan

**Goal:** Treat the complete supplied Downloads folder as the visual source of truth and rebuild the existing static SvelteKit frontend so its home, menu, product, about, course, devlog, article, and responsive states match the prototype assets and reference exports.

**Source of truth:** Reconcile `app_1.jsx`, `app_7.jsx`, both supplied HTML exports, the UI Style Guidelines PDF, supplied screenshots, and supplied brand assets as one prototype package. When exports differ, use the latest app shell/page behavior represented by `app_7.jsx` and the HTML content/state coverage; do not invent a second visual concept.

**Architecture:** Keep the existing routes, Paraglide content layer, and static adapter. Make `/` the complete long-form marketing page from the rendered HTML export, with the normal desktop navigation and anchored sections. Keep destination routes as deep links using the same light visual language; remove the dark full-screen app shell as the primary home experience.

**Tech Stack:** SvelteKit 2, Svelte 5, TypeScript, CSS, Paraglide, existing Lucide icons, Playwright CLI.

---

### Task 1: Establish prototype tokens and assets

**Files:**

- Modify: `src/routes/layout.css`
- Modify: `package.json`
- Create: `static/brand/logo.svg`
- Create: `static/brand/logo-bus.svg`

**Steps:**

1. Use the prototype's light/dark color roles, Ubuntu/Roboto/Noto Sans TC faces, 1200px content width, 76px header rhythm, 8/10/14/16/22px radius families, and 12/32px shadow scale.
2. Add the two supplied SVG marks as static assets and add only the missing bundled font packages.
3. Keep reduced-motion, focus-visible, base-path-safe image URLs, and the existing SvelteKit reset behavior.

### Task 2: Rebuild the shared shell

**Files:**

- Modify: `src/routes/+layout.svelte`
- Modify: `src/lib/components/landing/TopBar.svelte`
- Modify: `src/lib/components/landing/MenuOverlay.svelte`
- Modify: `src/lib/components/glass/FoxMark.svelte`
- Modify: `src/lib/components/glass/GlassIconBtn.svelte`
- Modify: `src/lib/components/glass/BurgerIcon.svelte`

**Steps:**

1. Match the rendered HTML header geometry, logo, anchored navigation, locale control, and theme affordance.
2. Keep the burger overlay only as a deep-link/mobile fallback if it remains useful; it must not replace the prototype's normal navigation on `/`.
3. Preserve route navigation and locale switching without adding a second navigation system.

### Task 3: Rebuild the home experience

**Files:**

- Modify: `src/routes/+page.svelte`
- Modify: `src/lib/components/landing/OrbitWheel.svelte`
- Modify: `src/lib/components/glass/Aurora.svelte`

**Steps:**

1. Reproduce the complete rendered HTML page: pale hero with orbit, four product cards, about split section, three course cards, devlog cards, CTA, and footer.
2. Keep real supplied assets and content data; preserve reduced-motion behavior and base-path-safe URLs.

### Task 4: Match destination page layouts

**Files:**

- Modify: `src/lib/components/landing/PageShell.svelte`
- Modify: `src/routes/products/+page.svelte`
- Modify: `src/routes/about/+page.svelte`
- Modify: `src/routes/courses/+page.svelte`
- Modify: `src/routes/devlog/+page.svelte`
- Modify: `src/lib/components/landing/FolderStack.svelte`
- Modify: `src/lib/components/landing/TeamBento.svelte`
- Modify: `src/lib/components/landing/ContactBody.svelte`
- Modify: `src/lib/components/landing/DevlogCard.svelte`
- Modify: `src/lib/components/landing/ProductDrawer.svelte`

**Steps:**

1. Replace the current dark-card-heavy page styling with the prototype's white page surfaces, blue accent, thin borders, spacious section rhythm, and responsive grids/timeline treatment.
2. Keep all existing real copy/data and honest coming-soon states.
3. Keep product drawer, folders, team links, external links, and focus behavior working.

### Task 5: Verify in real browsers

**Files:**

- Modify: `src/routes/page.svelte.spec.ts` only if the existing assertions describe the old visual contract.

**Steps:**

1. Run `pnpm check`, `pnpm lint`, `pnpm test:unit -- --run`, `pnpm build`, and `pnpm test:e2e`.
2. Capture desktop and mobile screenshots for `/`, menu open, `/products/`, `/about/`, `/courses/`, and `/devlog/` with Playwright.
3. Run the Impeccable detector once on changed UI files and fix only mechanical findings that conflict with the prototype or accessibility requirements.
