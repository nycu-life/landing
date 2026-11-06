# Ghost CMS: site content, dev log, comics, and NYCU One sign-in

The SvelteKit site runs with `adapter-node`. Home, About, shared navigation/footer, and Wish Pool render on request; `/devlog/`, `/devlog/<slug>/`, `/comics/`, `/comics/<slug>/`, and
`/sitemap.xml` render on request with the same Svelte components and i18n.

Published content is fetched through Ghost's Content API and cached in each Node
process for **30 seconds**. Concurrent refreshes share one fetch. Publish, edit,
unpublish, and delete need no build, webhook, GitHub token, or deployment. Reload
an open page after the cache expires. Newly published slugs and sitemap entries
appear together; removed content disappears at the next refresh.

## Runtime configuration

| Variable                | Meaning                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `ORIGIN`                | Public site origin, `https://nycu.life` in production.                                               |
| `GHOST_URL`             | Server-reachable Ghost base URL, including sub-path (`http://landing-ghost:2368/cms` in Kubernetes). |
| `GHOST_PUBLIC_URL`      | Browser-reachable base URL, `https://nycu.life/cms`; images use `/content/images/` below it.         |
| `GHOST_CONTENT_API_KEY` | Content key of the existing landing Custom Integration, injected from a runtime Secret.              |

Builds never contact Ghost and carry no CMS credentials. Without Ghost config,
local content pages use the empty dev log / placeholder comics, noindex and absent
from the sitemap. A configured Ghost failing or timing out (5 seconds) yields a
503 on content pages, rather than a misleading empty index or indefinitely stale
posts. The Wish API remains independent; shared chrome can use fallback content during a CMS outage. Empty Ghost sections are a normal state.

Images are served directly by Ghost's public route. Former `/devlog/media/…`
and `/comics/media/…` URLs redirect to that route for compatibility. Staff-authored
HTML is trusted and rendered by the existing components; do not feed member or
comment HTML into it. The comics section stays out of navigation until ready.

## Editor conventions

### 開發日誌 (dev log)

| What            | How in Ghost                                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mark a post     | Add the **internal tag `#devlog`** (a public `devlog` tag also works). Only **published** posts are used, newest first.                                              |
| Labels          | Any other **public** tag (e.g. `校園公車`, `NYCozU`) shows as a label on the card and the post. Internal `#tags` are never shown.                                    |
| Title / excerpt | Post title → card title and `<h1>`. Custom excerpt → card summary, lede, and meta description.                                                                       |
| Cover           | Optional post **feature image**, **16:9** (e.g. 1600×900). Without one the card shows a brand gradient.                                                              |
| Body            | Normal Ghost editor: headings, lists, quotes, code, image / gallery / callout / bookmark cards. Upload images to Ghost so they stay on the public Ghost image route. |
| Language        | Posts are single-language (Traditional Chinese); the English UI says so.                                                                                             |
| URL             | Post **slug** → `https://nycu.life/devlog/<slug>/`. Changing a slug after publishing breaks the old URL.                                                             |

The newest post is shown as the large card at the top of `/devlog/`.

### 漫畫專區 (comics)

| What                | How in Ghost                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mark a comic        | Add the **internal tag `#comics`** (a public `comics` tag also works). Only **published** posts are used.                                                                                         |
| Episode number      | Add an internal tag **`#ep-NN`**, e.g. `#ep-01`, `#ep-12`. Posts without one are numbered after the tagged ones, in `published_at` order. A duplicate `#ep-NN` is ignored (with a build warning). |
| Title               | Post title → card title and reader `<h1>` (same text in both locales).                                                                                                                            |
| Cover               | Post **feature image**, square **1:1** (e.g. 1080×1080). Feature-image alt text = cover alt.                                                                                                      |
| Panels              | Post body: one **image card per panel**, top to bottom. Short text paragraphs are fine. Upload images to Ghost (don't paste external URLs) so they stay on the public Ghost image route.          |
| URL                 | Post **slug** → `https://nycu.life/comics/<slug>/`. Changing a slug after publishing breaks the old URL.                                                                                          |
| Description         | Post **excerpt** (custom excerpt) → meta description.                                                                                                                                             |
| Publish / unpublish | Publishing, editing, or unpublishing refreshes the runtime catalog (see below). A new request sees the change within 30 seconds; reload an already-open page.                                     |

The "Latest / 最新集數" badge goes on the highest episode number.

## Local Ghost

`docker/ghost/compose.yml` runs `ghost:6-alpine` (6.75.x) and `mysql:8.4` with
healthchecks and named volumes (`ghost-mysql`, `ghost-content`). Ghost binds to
`127.0.0.1:2368`. The stub mail transport drops email, so Ghost 6's emailed
staff-device verification is turned off locally. Production needs real SMTP
and keeps it on.

```sh
# 1. Start Ghost + MySQL (first boot takes ~30 s)
docker compose -f docker/ghost/compose.yml up -d --wait

# 2. Owner setup, Custom Integration, 10 sample episodes (idempotent).
#    The first run needs an owner password (10+ chars). It is saved, together with
#    the generated Content/Admin API keys, to the untracked .env.ghost.local (0600).
GHOST_OWNER_PASSWORD='choose-a-long-one' node docker/ghost/seed.mjs
#    Later runs read the password back from .env.ghost.local:
node docker/ghost/seed.mjs

# 3. Import editable site Pages (uses the saved local Admin key)
GHOST_ADMIN_URL=http://127.0.0.1:2368 node --env-file=.env.ghost.local scripts/seed-site-content.mjs --apply

# 4. Build / preview / e2e against Ghost
set -a; . ./.env.ghost.local; set +a
GHOST_REQUIRED=1 pnpm build && pnpm preview

# 4. Stop (keeps volumes) / wipe everything
docker compose -f docker/ghost/compose.yml down
docker compose -f docker/ghost/compose.yml down -v
```

Ghost Admin: <http://127.0.0.1:2368/ghost/>, owner `editor@nycu.life.local`
(override with `GHOST_OWNER_EMAIL`). The seed creates posts `ep-01` … `ep-10`,
each with an SVG cover and three SVG panels uploaded through the Admin images
API. Posts whose slug already exists are skipped. Optional seed variables:
`GHOST_ADMIN_URL`, `GHOST_OWNER_NAME`, `GHOST_ENV_FILE`. Other compose
variables: `GHOST_PUBLIC_URL` (Ghost `url`, default `http://127.0.0.1:2368`),
`GHOST_PORT`, `GHOST_DB_PASSWORD`, `GHOST_DB_ROOT_PASSWORD`.

To include the stack from a root compose file:

```yaml
include:
  - path: landing/docker/ghost/compose.yml
```

## Production login and deployment

Traefik forwards `/cms` authorization to wish-api's `/api/wishes/auth/gate`.
Signed-out editors go through the existing `wishpool-admin` OIDC client at
`auth.nycu.one`, then return to Ghost. Every NYCU One account can pass the outer
gate, while Ghost's staff list controls who can enter the CMS.

The gate signs a short-lived `X-Nycu-Cms-Identity` token containing the NYCU One
subject, display name, and email. Traefik's `authResponseHeaders` overwrites any
client value. The `NycuOneSSO` adapter uses Ghost 6.75's supported SSO hook to
verify the token and create a verified staff session for the Ghost staff user
with the same email. No shared password is needed by the bridge. Ghost's own
role and author/history records therefore remain per person. The gate logs the
NYCU One subject when the session is created.

Ghost does not create staff users through the SSO adapter. An Owner must invite
or create each staff email in Ghost first, then assign its Ghost role. A user
whose NYCU One email has no matching active Ghost staff account is denied by the
adapter. This makes the Ghost staff list the CMS allowlist even though the outer
NYCU One gate can authenticate any account.

`docker/ghost/Dockerfile` packages the adapter outside the persistent content
volume. Activate with `adapters__sso__active=NycuOneSSO` and inject the same
random secret into `NYCU_CMS_SSO_SECRET` (Ghost) and `WISH_CMS_SSO_SECRET`
(wish-api). GitOps generates and persists this secret through
ExternalSecrets/OpenBao. `NYCU_CMS_SSO_STAFF_EMAIL` is an optional temporary
fallback for tokens from an older wish-api image; remove it after the rollout.
Missing/invalid tokens and unprovisioned staff emails never create sessions;
Ghost's manual login remains available behind the gate.

The `/cms` gate remains mandatory on **every** Admin/API request, even when a
Ghost session exists. Wish Pool sign-out clears the gate's CMS cookie too. The
public Content API and uploaded images bypass the gate; the Admin API does not.
SMTP is still unconfigured, so staff-device email verification stays disabled.

Production manifests live in `nycu-life/k8s-manifests/apps/landing/overlays/prod`.
Set the existing Content API key in source Secret `landing-web-ghost-source`,
property `GHOST_CONTENT_API_KEY`, before the Node rollout. PushSecret persists it
to OpenBao (`secret/landing/prod/ghost-content`); ExternalSecret populates
`landing-web-ghost-secret` for the Node service. Do not commit keys. The web and
Wish API use rolling updates with `maxUnavailable: 0` and readiness probes. Ghost
keeps its single RWO content volume and Recreate strategy: its restart briefly
interrupts CMS access; the web service can serve its last good site content for up to 5 minutes, and the Wish API stays available. MySQL and
content volumes are preserved. Roll back web/wish-api/ghost image tags together
if required; no database schema changes are introduced by this release.

Run `pnpm test:cms-sso`, Go tests/vet, frontend checks/tests, and Playwright against
the actual Node server. Verify publishing, editing, unpublishing, new slugs,
sitemap updates, and signed/forged SSO tokens with a disposable Ghost instance.

## 整站內容（首頁與 About）

首頁、About、導覽、頁尾、產品、FAQ、徵才職缺與里程碑都是 Ghost 的**已發布 Pages**。SvelteKit 在每次請求讀取這些 Pages，快取 30 秒；修改、排序、發布或下架不需要重新 build 或部署。每個請求渲染自己的 locale，服務端不會用全域變數覆蓋 Paraglide，因此不同訪客不會互相看到語言或內容。

第一次部署前，使用現有 Ghost Custom Integration 的 Admin API key 執行一次安全匯入：

```sh
GHOST_ADMIN_URL=https://nycu.life/cms \
GHOST_ADMIN_API_KEY='id:secret' \
pnpm cms:seed-site -- --apply
```

匯入會建立 78 個中英文 Pages。它只會建立不存在的 slug，**不會覆寫現有頁面**；若要重新匯入，請先在 Ghost 另存或刪除對應頁面。正式環境應在受控的管理工作站執行，Admin key 不放入 Git、Docker image 或瀏覽器。可先不加 `--apply` 預覽所有 slug。

### 編輯規則

- 集合與一般頁面的 Ghost 標題是顯示標題；固定區段 Page 的標題只用於後台辨識，文案在內文。內文使用一般 **H2 作為欄位名稱**，欄位值放在其後的段落。欄位名稱依匯入頁面顯示（例如「簡介」、「回答」、「排序」）；不要刪除必要欄位或重複同一個 H2。圖片欄位每行一張 Ghost 圖片，產品畫面可填 `/products/...` 或 `https://` URL。
- `site-zh-tw-*` 與 `site-en-*` 是系統管理頁面，請從 Ghost 的 Pages 列表保留已發布狀態；它們不會出現在網站的 `/pages/`。其他一般已發布 Page 會自動出現在 `/pages/<slug>/`，並進入 sitemap。
- `product`、`faq`、`role`、`vision`、`milestone`、`nav` 是可增刪的集合。`排序` 使用數字，數字相同時以 slug 穩定排序；集合頁面下架就會從網站移除。產品至少保留一筆，否則該 locale 會回報 503，避免顯示不完整首頁。
- 連結只接受同站路徑或 HTTPS；`javascript:`、`data:`、`http:` 與不完整網址會被拒絕。`recruitmentOpen` 控制整個招募區是否顯示表單，且必須是 `true` 或 `false`。
- 未設定 Ghost 的本機開發會使用程式內預設內容；已設定 Ghost 但尚未匯入、管理頁缺漏或格式錯誤時，服務會保留最近一次成功內容，連續 5 分鐘無法更新才將首頁/About 顯示 503。Devlog、漫畫與 Wish API 的行為維持原本的獨立路徑。

### 日常工作流程

1. 進入 Ghost 後台，切換到要修改的 `site-zh-tw-*` 或 `site-en-*` Page。
2. 直接修改 H2 下的文字、圖片或連結；集合內容則複製一個同類 Page，改 slug、標題與排序。
3. 按 **Publish**；等最多 30 秒後重新載入網站，先在中英文與深色／淺色模式檢查。
4. 下架集合項目時選 **Unpublish**。不要刪除必要的首頁區段、設定頁或所有產品。

Ghost 的一般文章（Devlog／漫畫）仍照文章標籤流程管理；這次整站內容接入不會改變 Wish Pool 的 Go API、SSO、管理頁或既有文章網址。

### Deployment order and health

Import the site Pages into the existing Ghost **before** switching web images. This only adds Pages and does not affect the currently deployed article-only web service. Validate the Content API catalog, then roll out the new Node web image with `maxUnavailable: 0`. The startup probe uses `/` to require a usable catalog before replacing old replicas. Readiness and liveness use `/healthz` so a later CMS outage does not restart the web process or take Wish Pool's UI offline. Roll back the web image if verification fails; imported Pages can remain in Ghost.

The initial migration requires an Admin API key only on the operator's machine (or a port-forward to Ghost when the public Admin API is behind SSO). Runtime uses only the Content API key. Database and uploaded-image volumes stay in place.
