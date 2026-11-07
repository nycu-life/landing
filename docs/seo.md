# SEO — indexable pages and retired URLs

With `PUBLIC_SITE_ENGINE=ghost`, Ghost's native sitemap, canonical URLs and real
404 responses replace the headless catalog described below. See
[ghost-theme.md](ghost-theme.md) for component Page canonicals and legacy archival.
Wish Pool and retired 410 routes remain owned by Node.

Owner split for Search Console work: this repo (code, tests, deploy) is handled by
the coding agent; Search Console properties, sitemap submission, and Google-side
live tests are handled by Codex. Submitting or reading a sitemap is not the same
as being indexed — report only what Search Console actually shows.

## Indexable pages

`/sitemap.xml` (served at `https://nycu.life/sitemap.xml`, advertised in
`static/robots.txt`) is generated on request by
`src/routes/sitemap.xml/+server.ts`, using the shared 30-second Ghost catalog.
It combines two sources of truth:

1. `src/lib/seo/pages.ts` → `indexablePages`: the core routes, in order. To
   add a page, add one line there.
2. Ghost content read at runtime (`docs/ghost.md`): `/devlog/` and its
   posts (newest first), then `/comics/` and its episodes (episode order).
   They are listed **only** when Ghost has published content.

| URL                                | Status | Canonical | robots                        |
| ---------------------------------- | ------ | --------- | ----------------------------- |
| `https://nycu.life/`               | 200    | self      | —                             |
| `https://nycu.life/about/`         | 200    | self      | —                             |
| `https://nycu.life/wishpool/`      | 200    | self      | —                             |
| `https://nycu.life/devlog/`        | 200    | self      | — (`noindex` while empty)     |
| `https://nycu.life/devlog/<slug>/` | 200    | self      | — (Ghost-backed)              |
| `https://nycu.life/comics/`        | 200    | self      | — (`noindex` while empty)     |
| `https://nycu.life/comics/<slug>/` | 200    | self      | — (Ghost-backed)              |
| `/comics/ep-01/` … (placeholder)   | 200    | self      | `noindex`, not in the sitemap |

All return full HTML without JS through SvelteKit SSR. Home/About/shared chrome use Ghost Pages. `/wishpool/admin/` is
reachable but `noindex,nofollow` and intentionally absent from the sitemap.
English copy is a cookie-selected locale on the same URLs (Paraglide `cookie`
strategy), so there are no `/en/` URLs and no hreflang alternates.

Ghost-backed sections (`docs/ghost.md`) join the sitemap only when Ghost
supplies published content:

- `/devlog/` and `/devlog/<slug>/` once at least one `#devlog` post is
  published. Without posts (or without Ghost) `/devlog/` is an empty-state page
  with `noindex`.
- `/comics/` and `/comics/<slug>/` once at least one `#comics` post is
  published. Until then the 10 placeholder episodes from
  `src/lib/content/comics.ts` render with `noindex`, and the comics corner is
  not linked from the navigation.

Builds do not contact Ghost. A configured Ghost outage returns 503 on
article pages and the sitemap after the cache expires. Site content can use the last successful catalog for up to 5 minutes; home/About/custom pages then return 503. Wish Pool and its Go API remain independent. Published/edited/withdrawn articles and their sitemap entries refresh
within 30 seconds, without a new deployment.

Images use Ghost's public `/cms/content/images/` route. Former
`/devlog/media/<path>` and `/comics/media/<path>` URLs redirect there.

The Node server returns a real 404 for unknown article slugs. Dynamic responses
use `private, no-cache` so HTTP caches do not prolong the catalog TTL or share
cookie-selected locale HTML.

## Retired URLs

`/about/` was withdrawn (410) on 2026-09-04 and reinstated as a real page on
2026-11-05 (#106: team vision, film, milestones). It is back in the sitemap.
`/devlog/` was withdrawn on the same day and reinstated on 2026-11-05 as the
Ghost-backed dev log (in the sitemap once a post is published).

| URL                                                          | Response | Why                                                                                                                                                                                                                |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/team/<slug>/` (incl. `/team/hsuan/`, `/team/einstein706/`) | 410      | Member profile pages were deliberately withdrawn (`bc6c0fb`, 2026-09-04). No equivalent page exists and the site no longer links to them.                                                                          |
| `/products/`                                                 | 410      | Unfinished destination page withdrawn (`a9a448c`, 2026-09-04). Products are now a chapter of the home page, not a page of their own; redirecting would be a home-page redirect, which Google treats as a soft 404. |
| `/courses/`                                                  | 410      | Withdrawn with no replacement.                                                                                                                                                                                     |
| `/demo/`, `/demo/paraglide/`                                 | 404      | SvelteKit template scaffolding, removed 2026-10-23 (was publicly 200 and indexable).                                                                                                                               |
| any other unknown path                                       | 404      | Real 404 (see below).                                                                                                                                                                                              |

Search Console groups 410 under "Not found (404)"; that is expected and those
entries age out on their own. Only add a 301 when a page has a genuine
equivalent replacement — never a blanket redirect to `/`.

The catch-all route returns 404/410 and renders `src/routes/+error.svelte` with
`noindex`, no canonical, no `og:url`, and links back to the home page, the
products chapter, and the Wish Pool. `/api/*` misses stay a JSON 404.

## GSC-20261023

Search Console (2026-10-23): 2 indexed / 7 not indexed (5 "Not found (404)",
1 discovered, 1 crawled — currently not indexed); 147 clicks / 556 impressions
over three months; no security or manual actions. Sitemap read successfully on
2026-10-16 (2 URLs).

The two non-404 entries, as read in Search Console by Codex (report data as of
2026-10-16):

- **Discovered – currently not indexed:** `https://nycu.life/wishpool/`. It is
  in the sitemap, 200, prerendered at the time of this report, self-canonical, not noindex. Nothing in this
  repo blocks it; Google simply has not crawled it yet. Google-side follow-up
  only — no code change and no sitemap resubmission (the sitemap is unchanged).
- **Crawled – currently not indexed:** `http://nycu.life/` (plain HTTP), last
  crawled 2026-09-04. It already redirects (308 for HEAD, 301 for GET) to
  `https://nycu.life/`, which is the indexed canonical. Nothing to fix.

Neither entry is caused by the soft-404 or `/demo/` defects below; those were
found by probing the live site, not from these reports. Do not invent pages or
redirects to "fix" either entry.

Defects found and fixed:

- **Soft 404s.** nginx fell back to `/index.html` for every unknown path, so
  e.g. `/en/` or `/anything/` answered 200 with the home page (canonical `/`).
  Fixed in nginx originally; the Node catch-all now preserves the same statuses.
- **Indexable template pages.** `/demo/` and `/demo/paraglide/` were 200 with
  self-canonicals. Removed.
- **Error-page metadata.** The root layout emitted a canonical / `og:url` for
  every page; it now skips both when rendering an error.

The retired URLs above already answered 410 since 2026-09-04 and nothing on
the site links to them; they were kept as 410 on purpose.

Verification lives in `e2e/seo.test.ts`: sitemap contents (the static pages
from `src/lib/seo/pages.ts` first, then only Ghost-backed `/devlog/` and
`/comics/` entries),
self-canonicals on every sitemap URL, noindex placeholder episodes, and the
noindex error page with a real 404. `e2e/devlog.test.ts` and
`e2e/comics.test.ts` cover those pages themselves. Playwright runs the built adapter-node server and verifies real 404/410 status codes.

### Deployment

- Code: landing#114 (`f16e395`, merge `aee4da1`), tag `v0.0.16`.
- Image: `harbor.nycu.one/landing/web:v0.0.16`
  (`sha256:8244e50e91ce2f826226bef37a1d17a897c5fd76f892121ce6e0d98210b4ce5e`),
  promoted in `nycu-life/k8s-manifests` `5b53135`. wish-api stays `v0.0.14`.
- Production check, 2026-10-23T09:37Z (`curl`, then Chromium for the rendered
  head; home page `last-modified: Fri, 23 Oct 2026 09:29:09 GMT`):

| URL                                                       | Result                                                  |
| --------------------------------------------------------- | ------------------------------------------------------- |
| `https://nycu.life/`                                      | 200, canonical `https://nycu.life/`, no robots meta     |
| `https://nycu.life/wishpool/`                             | 200, canonical `https://nycu.life/wishpool/`, no robots |
| `https://nycu.life/wishpool`                              | 301 → `https://nycu.life/wishpool/`                     |
| `http://nycu.life/`                                       | 301 → `https://nycu.life/`                              |
| `https://nycu.life/wishpool/admin/`                       | 200, `noindex,nofollow`                                 |
| `/team/hsuan/`, `/team/einstein706/`                      | 410, error page, `noindex`, no canonical                |
| `/products/`, `/about/`, `/courses/`, `/devlog/`          | 410                                                     |
| `/demo/`, `/demo/paraglide/`, `/en/`, `/nonexistent-xyz/` | 404, error page, `noindex`, no canonical                |
| `/sitemap.xml`                                            | 200 `text/xml`, 2 URLs (`/`, `/wishpool/`)              |
| `/robots.txt`                                             | 200, `Disallow:` (empty), `Sitemap:` line               |
| `/api/wishes?limit=1`                                     | 200 JSON (Wish API unaffected)                          |

Published Public Ghost Pages without the reserved `site-` slug prefix render at `/pages/<slug>/` and join the runtime sitemap. Reserved management Pages return 404 through that route and are never listed. Drafts, private Pages, and withdrawn Pages are absent. `e2e/seo.test.ts` covers the management-page boundary, ordinary missing pages, existing 410 routes, and the CMS-independent `/healthz` endpoint.
