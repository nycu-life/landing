# SEO — indexable pages and retired URLs

Owner split for Search Console work: this repo (code, tests, deploy) is handled by
the coding agent; Search Console properties, sitemap submission, and Google-side
live tests are handled by Codex. Submitting or reading a sitemap is not the same
as being indexed — report only what Search Console actually shows.

## Indexable pages

`static/sitemap.xml` (served at `https://nycu.life/sitemap.xml`, advertised in
`static/robots.txt`) lists exactly two URLs:

| URL                           | Status | Canonical                            | robots |
| ----------------------------- | ------ | ------------------------------------ | ------ |
| `https://nycu.life/`          | 200    | `https://nycu.life/` (self)          | —      |
| `https://nycu.life/wishpool/` | 200    | `https://nycu.life/wishpool/` (self) | —      |

Both are prerendered (full HTML without JS). `/wishpool/admin/` is reachable but
`noindex,nofollow` and intentionally absent from the sitemap. English copy is a
cookie-selected locale on the same URLs (Paraglide `cookie` strategy), so there
are no `/en/` URLs and no hreflang alternates.

## Retired URLs

| URL                                                          | Response | Why                                                                                                                                                                                                                |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/team/<slug>/` (incl. `/team/hsuan/`, `/team/einstein706/`) | 410      | Member profile pages were deliberately withdrawn (`bc6c0fb`, 2026-09-04). No equivalent page exists and the site no longer links to them.                                                                          |
| `/products/`                                                 | 410      | Unfinished destination page withdrawn (`a9a448c`, 2026-09-04). Products are now a chapter of the home page, not a page of their own; redirecting would be a home-page redirect, which Google treats as a soft 404. |
| `/about/`                                                    | 410      | Same as `/products/`; the about content is a home-page chapter.                                                                                                                                                    |
| `/courses/`                                                  | 410      | Withdrawn with no replacement.                                                                                                                                                                                     |
| `/devlog/`                                                   | 410      | Withdrawn with no replacement.                                                                                                                                                                                     |
| `/demo/`, `/demo/paraglide/`                                 | 404      | SvelteKit template scaffolding, removed 2026-10-23 (was publicly 200 and indexable).                                                                                                                               |
| any other unknown path                                       | 404      | Real 404 (see below).                                                                                                                                                                                              |

Search Console groups 410 under "Not found (404)"; that is expected and those
entries age out on their own. Only add a 301 when a page has a genuine
equivalent replacement — never a blanket redirect to `/`.

All 404/410 responses carry the SvelteKit error shell (`build/404.html`, from
adapter-static `fallback`), which renders `src/routes/+error.svelte` with
`noindex`, no canonical, no `og:url`, and links back to the home page, the
products chapter, and the Wish Pool. `/api/*` misses stay a JSON 404.

## GSC-20261023

Search Console (2026-10-23): 2 indexed / 7 not indexed (5 "Not found (404)",
1 discovered, 1 crawled — currently not indexed); 147 clicks / 556 impressions
over three months; no security or manual actions. Sitemap read successfully on
2026-10-16 (2 URLs).

Defects found and fixed:

- **Soft 404s.** nginx fell back to `/index.html` for every unknown path, so
  e.g. `/en/` or `/anything/` answered 200 with the home page (canonical `/`).
  Now `try_files $uri $uri/ =404` plus `error_page 404 410 /404.html`.
- **Indexable template pages.** `/demo/` and `/demo/paraglide/` were 200 with
  self-canonicals. Removed.
- **Error-page metadata.** The root layout emitted a canonical / `og:url` for
  every page; it now skips both when rendering an error.

The retired URLs above already answered 410 since 2026-09-04 and nothing on
the site links to them; they were kept as 410 on purpose.

Verification lives in `e2e/seo.test.ts` (sitemap contents, self-canonicals,
noindex error page with a real 404). The nginx status codes were checked by
running `docker/nginx.conf` on `nginx:1.30.6-alpine` against the build.
