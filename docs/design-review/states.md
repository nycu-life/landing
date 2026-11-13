# 設計評審截圖清單

每一輪都照這份清單截圖，ID 與 `tools/states.mjs` 一致。範圍只有 Ghost 原生主題
（`PUBLIC_SITE_ENGINE=ghost` 時的公開頁）與許願池；rollback 用的 Svelte 公開頁
（`PrototypeStory.svelte`、`src/routes/about/` 等）不截、不評。

| 尺寸      | 視窗              | 像素比 | 截圖高度                             |
| --------- | ----------------- | ------ | ------------------------------------ |
| `desktop` | 1440 × 900        | 1      | 從頁首或指定錨點起，最多 2400 px     |
| `mobile`  | 390 × 844（觸控） | 2      | 從頁首或指定錨點起，最多 1688 CSS px |

固定條件：

- 減少動態效果（`prefers-reduced-motion: reduce`），捲動故事因此依序排開、不鎖捲動；
  截圖時再關閉 CSS 動畫與轉場。
- 深色狀態用 `localStorage['nycu-life-theme'] = 'dark'`（網站自己的開關，不跟系統）。
- 英文許願池沿用正式站行為：`PARAGLIDE_LOCALE=en` cookie（Ghost 頁面的 `site.js` 會設定），網址同為 `/wishpool/`。
- 瀏覽器時鐘固定在 2026-11-13 12:00（Asia/Taipei），許願的相對時間不漂移。
- 截圖瀏覽器一次只開一個；每個狀態前都等 `tools/wait-load.sh 10`，瀏覽器逾時就重試一次。
- 視窗維持 1440 × 900／390 × 844，用 `fullPage` 加 `clip` 截長圖（不把視窗拉高，`vh` 區塊保持原尺寸）；錨點截圖時把黏性頁首移到截圖頂端。點擊後把滑鼠移到 (0, 0)，避免拍到 hover。
- 每次截圖前從 `/tmp/nycu-hc/wishes.sql` 還原 Wish API 的 Postgres，表單送出與 +1 不會讓資料隨輪次漂移。
- Ghost 選單是站台資料：`capture-baseline.sh` 與 `deploy-new.sh` 都以各自版本的 `install-ghost-theme.mjs --initialize-navigation` 預設選單安裝主題。

## 測試環境（全部在本機，不連正式 Ghost、不匯入真實會員）

| 服務                                                                         | 位置                                                                            | 資料                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ghost 6（compose 專案 `nycu-hc`）                                            | `127.0.0.1:2379`                                                                | `docker/ghost/seed.mjs`（10 集漫畫、3 篇 devlog）、`scripts/seed-site-content.mjs`、`cms:migrate-theme`、`migrate-ghost-about.mjs`，再加 `tools/review-ghost.mjs seed`（6 則最新消息、5 篇 devlog，含無封面與長標題） |
| Postgres                                                                     | `127.0.0.1:55441`（容器 `nycu-hc-pg`）                                          | `tools/seed-wishes.mjs`：8 則公開未實現、3 則已實現（含回覆）、3 則待審核、1 則隱藏                                                                                                                                   |
| Wish API（`api/`，`CGO_ENABLED=0 go build`，跑在 alpine 容器 `nycu-hc-api`） | `127.0.0.1:13011`（只開 loopback）                                              | 無 OIDC；管理端用本機 `WISH_ADMIN_TOKEN`                                                                                                                                                                              |
| Node（`pnpm build`，`PUBLIC_SITE_ENGINE=ghost`）                             | 基準 `:14191`／新版 `:14192`；Ghost 不通的實例 `:14193`（直接截，不經 gateway） | —                                                                                                                                                                                                                     |
| `tools/gateway.mjs`                                                          | 基準 `:18291`／新版 `:18292`                                                    | 模擬正式 Traefik 分流                                                                                                                                                                                                 |

**模擬登入（SSO）**：截圖腳本攔截 `/api/wishes/auth/me` 回傳已登入的虛構管理員，
並在 `/api/wishes/admin*` 請求加上本機 break-glass token 後轉給真的 Wish API；
沒有連 NYCU One／Authentik。

## 頁面與狀態

| ID                                      | 頁面                          | 狀態                     | 語言             | 重現方式                             |
| --------------------------------------- | ----------------------------- | ------------------------ | ---------------- | ------------------------------------ |
| `home-zh`                               | 首頁 `/`                      | 扭蛋機首屏起             | 繁中             | —                                    |
| `home-en`                               | 首頁 `/en/`                   | 同上                     | 英文             | —                                    |
| `home-dark-zh`                          | 首頁                          | 深色                     | 繁中             | dark                                 |
| `home-about-zh`                         | 首頁                          | 「關於」章               | 繁中             | 錨點 `#about`                        |
| `home-products-zh` / `-en` / `-dark-zh` | 首頁                          | 「產品」章               | 繁中／英文／深色 | 錨點 `#products`                     |
| `home-faq-zh` / `-en`                   | 首頁                          | FAQ 章（第一題展開）     | 繁中／英文       | 錨點 `#faq`                          |
| `home-join-zh` / `-dark-en`             | 首頁                          | 夥伴招募章               | 繁中／英文深色   | 錨點 `#join`                         |
| `home-wish-footer-zh`                   | 首頁                          | 許願池入口＋頁尾         | 繁中             | 錨點 `#wishes`                       |
| `menu-open-zh` / `-dark-en`             | 全站導覽                      | 手機選單展開（只截手機） | 繁中／英文深色   | 點 `.menu-toggle`，只截視窗          |
| `about-zh` / `-en` / `-dark-zh`         | 關於 `/about/`                | 有資料                   | 繁中／英文／深色 | —                                    |
| `about-milestones-zh`                   | 關於                          | 里程碑                   | 繁中             | 錨點 `#milestones`                   |
| `products-zh` / `-en` / `-dark-zh`      | 產品 `/products/`             | 有資料                   | 繁中／英文／深色 | —                                    |
| `products-loading-zh`                   | 產品                          | 圖片載入中               | 繁中             | `/content/images/` 不回應            |
| `news-zh` / `-dark-zh`                  | 最新消息 `/news/`             | 有資料                   | 繁中             | —                                    |
| `news-loading-zh`                       | 最新消息                      | 圖片載入中               | 繁中             | `/content/images/` 不回應            |
| `news-post-zh`                          | 消息文章                      | 有封面                   | 繁中             | `/news/app-v3-release/`              |
| `devlog-zh` / `-dark-zh`                | 開發日誌 `/devlog/`           | 有資料                   | 繁中             | —                                    |
| `devlog-post-zh` / `-dark-zh`           | devlog 文章                   | 標題、清單、引言、程式碼 | 繁中             | `/devlog/design-system-glass/`       |
| `devlog-post-nocover-zh`                | devlog 文章                   | 無封面                   | 繁中             | `/devlog/accessibility-audit/`       |
| `comics-zh` / `-dark-zh`                | 漫畫 `/comics/`               | 有集數                   | 繁中             | —                                    |
| `comics-episode-zh`                     | 漫畫單集                      | 有集數                   | 繁中             | `/comics/ep-03/`                     |
| `not-found-zh` / `-dark-zh`             | 不存在的網址                  | 404                      | 繁中             | `/no-such-page/`                     |
| `ghost-down-zh`                         | 首頁                          | 內容服務無法連線         | 繁中             | Node 指向不回應的 Ghost              |
| `wish-zh` / `-en` / `-dark-zh`          | 許願池 `/wishpool/`           | 有資料                   | 繁中／英文／深色 | —                                    |
| `wish-loading-zh`                       | 許願池                        | 載入中                   | 繁中             | `GET /api/wishes` 不回應             |
| `wish-error-zh`                         | 許願池                        | 載入錯誤                 | 繁中             | `GET /api/wishes` 回 500             |
| `wish-empty-zh`                         | 許願池                        | 空資料                   | 繁中             | `GET /api/wishes` 回空陣列           |
| `wish-fulfilled-zh` / `-dark-en`        | 許願池                        | 已實現分頁               | 繁中／英文深色   | 點 `#wish-tab-fulfilled`             |
| `wish-card-open-zh`                     | 許願池                        | 第一則說明展開           | 繁中             | 點第一個 `.wish-card-detail summary` |
| `wish-form-filled-zh`                   | 許願池                        | 表單：填寫標題與補充說明 | 繁中             | 填欄位，只截視窗                     |
| `wish-form-error-zh`                    | 許願池                        | 表單：標題太短           | 繁中             | 填「洗衣」後送出                     |
| `wish-form-sent-zh` / `-en`             | 許願池                        | 表單：送出、等待審核     | 繁中／英文       | 填有效標題後送出                     |
| `wish-supported-zh`                     | 許願池                        | 第一則 +1 之後           | 繁中             | 點第一個 `.wish-support`             |
| `admin-signed-out-zh` / `-en`           | 許願池管理 `/wishpool/admin/` | 登入前                   | 繁中／英文深色   | —                                    |
| `admin-pending-zh` / `-dark-zh`         | 許願池管理                    | 登入後、待審核           | 繁中／深色       | 模擬 SSO                             |
| `admin-published-zh` / `-en`            | 許願池管理                    | 已公開分頁               | 繁中／英文       | 模擬 SSO，點第 2 個分頁              |
| `admin-reply-zh`                        | 許願池管理                    | 撰寫回覆                 | 繁中             | 已公開分頁，點第一個「回覆」         |
| `admin-loading-zh`                      | 許願池管理                    | 清單載入中               | 繁中             | `/api/wishes/admin` 不回應           |
| `admin-empty-zh`                        | 許願池管理                    | 空清單                   | 繁中             | `/api/wishes/admin` 回空陣列         |
| `admin-error-zh`                        | 許願池管理                    | 清單錯誤                 | 繁中             | `/api/wishes/admin` 回 500           |
| `news-empty-zh`                         | 最新消息                      | 沒有文章                 | 繁中             | 所有文章暫時改為草稿                 |
| `devlog-empty-zh`                       | 開發日誌                      | 沒有文章                 | 繁中             | 同上                                 |
| `comics-empty-zh` / `-dark-zh`          | 漫畫                          | 還沒有集數               | 繁中／深色       | 同上                                 |

## 參考對手

第一輪截一次，之後每輪重用同一組檔案：

| ID                 | 網址                         | 對應的我方頁面         |
| ------------------ | ---------------------------- | ---------------------- |
| `linear-home`      | https://linear.app/          | 產品官網首頁           |
| `linear-changelog` | https://linear.app/changelog | 開發日誌／最新消息     |
| `raycast-home`     | https://www.raycast.com/     | 產品官網首頁、產品頁   |
| `raycast-blog`     | https://www.raycast.com/blog | 文章列表               |
| `canny-roadmap`    | https://feedback.canny.io/   | 許願池（公開回饋看板） |

## 重現

```bash
R=docs/design-review/tools
GHOST_PORT=2379 GHOST_PUBLIC_URL=http://127.0.0.1:2379 docker compose -p nycu-hc -f docker/ghost/compose.yml up -d --wait
GHOST_ADMIN_URL=http://127.0.0.1:2379 GHOST_ENV_FILE=/tmp/nycu-hc/env GHOST_OWNER_PASSWORD=… node docker/ghost/seed.mjs
# 以 /tmp/nycu-hc/env 的 Admin key：seed-site-content、cms:migrate-theme、migrate-ghost-about（皆 --apply）
node $R/review-ghost.mjs session && node $R/review-ghost.mjs seed
$R/wait-load.sh && nice pnpm cms:theme-build && nice pnpm build
GHOST_ADMIN_SESSION_FILE=/tmp/nycu-hc/session.json node scripts/install-ghost-theme.mjs --apply --initialize-navigation
# Wish API + gateway + Node（見上表埠號），再：
WISH_ADMIN_TOKEN=… node $R/seed-wishes.mjs
WISH_ADMIN_TOKEN=… node $R/capture.mjs site http://127.0.0.1:18292 http://127.0.0.1:14193 /tmp/nycu-hc/sets/rN
node $R/capture.mjs references /tmp/nycu-hc/sets/reference
python3 $R/make_round.py N /tmp/nycu-hc/sets/rN
```

基準組（`main` 的主題與 Node build）只截一次，存在 `/tmp/nycu-hc/sets/baseline`。
