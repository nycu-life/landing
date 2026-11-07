# Ghost 原生官網主題

這次轉換讓 **Ghost 直接產生官網 HTML**。`theme/` 是可上傳的原生 Handlebars
主題，由 Ghost 直接渲染首頁。Ghost 自帶的 Portal／搜尋可能嵌入公開 Content API key；
Admin 憑證只留在服務端，不放入主題。
`theme/site.js` 只加上捲動故事、產品切換和明暗模式；關閉 JavaScript 仍可閱讀內容。

## 網址和責任

| 網址                             | 服務                                       |
| -------------------------------- | ------------------------------------------ |
| `/`、`/en/`                      | Ghost 主題首頁                             |
| `/about/`、`/en/about/`          | Ghost Page 和主題                          |
| `/devlog/`、`/devlog/<slug>/`    | Ghost 開發日誌集合                         |
| `/comics/`、`/comics/<slug>/`    | Ghost 漫畫集合                             |
| `/news/`                         | 未分類文章，避免新文章沒有公開網址         |
| `/<page-slug>/`                  | 一般 Ghost Page                            |
| `/ghost/`                        | Ghost Admin，經 NYCU One gate              |
| `/cms/`、`/cms/ghost/`           | 轉址到 `/ghost/`，沒有第二套部落格         |
| `/cms/content/images/…`          | 舊圖片網址，相容轉送到 `/content/images/…` |
| `/wishpool/`、`/wishpool/admin/` | 原 SvelteKit 互動介面與獨立 Go API         |
| `/healthz`                       | Node 程序健康檢查，不依賴 Ghost            |

Node 的 `PUBLIC_SITE_ENGINE=ghost` 啟用公開頁面轉送，`GHOST_THEME_URL` 指向
Ghost 的叢集內 **origin，沒有 `/cms`**。轉送保留 Ghost 的 HTML、404、重新導向和
SEO；不轉送管理員身分標頭。Ingress 將 `/ghost/` 直接送到帶有 gate 的 Ghost。
Wish Pool 在 Ghost 故障時仍可使用；其 Svelte 導覽列保留程式內雙語文案。

## 編輯

原有 78 個 `site-*` 資料頁會轉換成一般富文字 Pages，既有內容不被覆寫。
`theme-zh-tw-*` 與 `theme-en-*` 是兩個語系：

- `hero`：插圖上方的可見標語與搜尋摘要。扭蛋機插圖中的字是設計素材，修改插圖需要更新主題。
- `intro`：首頁 About 的標題與內文。
- `film`：使用 Ghost 的影片嵌入卡片。
- `wish`：許願池入口的標題與內文。
- `join`：招募標題和說明。加上內部標籤 `#recruiting` 才會顯示職缺中的報名連結；移除即關閉。
- `footer`：頁尾介紹、聯絡和社群連結。
- `about`：完整 About，直接使用標題、圖片、段落和列表編輯。

產品、FAQ 和職缺各是一個 Page，分別加上 `#theme-product-zh-tw`、
`#theme-faq-zh-tw`、`#theme-role-zh-tw`，英文將尾碼換成 `en`。
產品的標題、Excerpt、Feature image 分別是名稱、摘要和預設手機畫面，內文列表是特色，
一般連結是產品入口。內文圖片卡片會輪播於手機中；圖片說明填 `Light` 或 `Dark`
可分配明暗版本，未填說明的圖片視為明亮版。可使用箭頭、圓點與左右滑動切換產品。
FAQ 的標題是問題，內文是答案。職缺的標題是職稱、Excerpt 是
短句，內文包含說明與報名連結。

集合依發布日期由早到晚排序，可在 Ghost 的文章設定調整日期。每個集合最多 100 筆，
適合首頁產品、FAQ 和職缺；大型文章集合使用原生分頁。內部標籤不會顯示在公開頁。
發布、下架和編輯會由 Ghost 直接更新，無須 build，也沒有原先 30 秒 API 快取。
首頁組件 Pages 的 canonical 指向首頁對應章節，因此不會重複列入 Ghost sitemap。

導覽選單在 Ghost Settings → Navigation 編輯：Primary 是中文，Secondary 是英文。
Ghost Design 的站名、圖示和字型設定生效；原生主題版型、插圖和動畫則在 `theme/`
與共用設計元件中維護。App 商店入口是主題固定連結。

開發日誌繼續使用 `#devlog`，漫畫使用 `#comics`。既有 slug 網址保留；一般 Page
改用 Ghost 原生 `/<slug>/`，原 `/pages/<slug>/` 會轉址。文章內所有 Ghost 卡片由
原生 `{{content}}` 呈現。英文一般 Page 可在 Page settings 選擇 `en` 自訂模板。
會員訂閱與付款不在此次轉換範圍。

## 建置和驗證

```sh
pnpm cms:theme-build
pnpm exec gscan -z dist/nycu-life.zip
pnpm cms:migrate-theme                   # 預覽，不寫入
pnpm cms:theme-install                   # 預覽，不寫入
```

建置重用既有 Svelte 元件的 CSS 與 `static/` 設計素材，打包為 `dist/nycu-life.zip`。
CSS 或插圖變更需重新建置主題，內容發布則不需要。建置不連 CMS、不讀任何密鑰。

本機 Ghost 請先照 `docs/ghost.md` 初始化範例內容及 `site-*` Pages，接著以操作環境
提供 `GHOST_ADMIN_URL`、`GHOST_SITE_URL` 與 Admin 認證，執行：

```sh
pnpm cms:migrate-theme --apply
pnpm cms:theme-install --apply --initialize-navigation
GHOST_THEME_TEST_URL=http://localhost:2368 \
VISUAL_AUDIT_SCREENSHOTS=/tmp/ghost-theme-screens \
pnpm exec playwright test e2e/smoke.test.ts -g 'visual acceptance matrix'
```

同一個獨立測試站可執行 `GHOST_THEME_TEST_URL=… pnpm exec playwright test
e2e/ghost-theme.test.ts` 驗證無 JavaScript 閱讀、FAQ、手機選單與截圖明暗切換。
`scripts/test-ghost-theme.mjs` 會編輯並還原一筆 Page，只能對拋棄式環境執行。

安裝主題、路由和選單需要 Owner 或 Administrator 的 Ghost session。操作工具可讀
`GHOST_ADMIN_SESSION_FILE` 指定的 Playwright storage state，檔案權限必須為 `0600`。
一般內容轉換可使用現有的 Admin API integration。不要把這些值放入 Git、主題或映像。

## 正式切換順序

1. 原始碼 PR 合併並發布 `v0.0.23` 映像後，先合併「前置版本更新」GitOps PR：
   先執行資料庫／內容備份 Job，校驗完成後更新版本；相容 `/cms` 與 `/ghost`
   cookie 的 Wish API 先上線。
   Node engine 與 Ghost `/cms` base 保持原設定，確認 rollout 完成再繼續。
2. 備份 Ghost 資料庫、content volume 和目前映像版本。先執行內容轉換、主題安裝。
   工具會跳過既有 slug，並在 `.ghost-theme-backups/` 私下保存原主題 ZIP、路由與選單。
   `--initialize-navigation` 會明確替換兩組選單；省略即可保留管理員設定。
3. 完成上述備份和安裝後，才合併後續「原生主題切換」GitOps PR。
   它將 Ghost `url` 改成 `https://nycu.life`，probe 路徑改成
   `/ghost/api/admin/site/`；保留資料庫、PVC 和 SSO adapter。
4. 將 `/ghost/api/content/` 設為公開例外，其餘 `/ghost` 套用同一個 NYCU One gate。
   `/assets/`、`/public/`、`/content/`、`/favicon.ico` 和 sitemap XML（含子檔）
   直接路由至 Ghost，避免 SvelteKit 頁面規則加上尾斜線而 404。
   主題 CSS 的字型使用相對路徑，隨主題放在 `assets/` 內。
   舊 `/cms/ghost/api/content/`、`/cms/content/images/` 使用 StripPrefix `/cms`
   轉送至 Ghost，其他 `/cms` 交給 Node 轉址。
5. Node 設定 `PUBLIC_SITE_ENGINE=ghost`、`GHOST_THEME_URL=http://landing-ghost:2368`，
   `GHOST_URL`、`GHOST_PUBLIC_URL` 也移除 `/cms`。保留 rolling update
   `maxUnavailable: 0`，startup probe 檢查首頁，readiness/liveness 維持 `/healthz`。
6. 驗證匿名首頁、兩語系、文章、漫畫、sitemap、舊圖片、許願池與 NYCU One → 個人
   Ghost staff 登入。確認 `/ghost` 無法繞過 gate，Owner 和兩位 Admin 角色不變。
7. 正式確認後將舊 `site-*` Pages 下架。這些原資料頁先保留可供回退，不會自動刪除；
   在完成下架前，Ghost 原生 sitemap 仍可能包含它們，不能將遷移視為完成。

Ghost 使用單一 RWO volume，切換 `url` 需要一次 Recreate，不能承諾 CMS 零中斷。
原 Node 可在切換期間沿用最多 5 分鐘的舊內容；Wish API 不重啟且獨立可用。
若驗證失敗，先恢復原 Ghost url、probe、Ingress 和 Node engine/image，接著以備份的
主題備份恢復原主題與選單：

```sh
node scripts/restore-ghost-theme.mjs --backup=<private-backup-directory> --apply
node scripts/restore-ghost-pages.mjs --backup=<private-legacy-backup-directory> --apply
```

安裝中途失敗會自動嘗試回復。若回復也失敗，工具保留備份路徑供上述指令重試。
保留新 Pages 不影響舊系統。若已執行最後的舊頁下架，回退前須從 `legacy-*` 備份
恢復這些 Pages 的原發布狀態，否則舊版讀取不到內容。

此文件描述可執行的切換流程；程式碼合併或主題通過 gscan 都不代表正式環境已切換。
