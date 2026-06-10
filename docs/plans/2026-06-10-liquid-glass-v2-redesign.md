# Liquid Glass v2 — 手機版重構 + 桌面 storytelling 設計

來源設計稿:`0610NYCU LIFE Web.html`(React + GSAP prototype,已解包至元件層級)。
設計 token 依據:`nycu-life-ui-skill/references/design-tokens.md`(Figma style guide,dark mode)。

## 目標

1. **手機(< 1024px)**:app-style 介面完全比照設計稿 — 淺色 NEAT 漸層首頁 + 轉盤、
   液態玻璃選單 bloom、四個內頁(認識我們資料夾堆疊 / 課程專區雙欄切換 /
   所有產品玻璃磚 + 中央懸浮卡 / 開發日誌拍立得・明信片)。所有狀態變化皆有動畫。
2. **桌面(≥ 1024px)**:`/` 以 storytelling 一頁式呈現,把四個 tab 內容轉為敘事章節
   (hero → 產品 → 認識我們 → 課程 → 開發日誌 → 加入我們),同一套 Liquid Glass 視覺語言,
   捲動驅動進場。子路由在桌面寬度仍可瀏覽(置中欄)。

## 關鍵決策

- **架構**:`+layout.svelte` 改為固定視口 app shell。常駐 WebGL 背景
  (`@firecms/neat`,首頁淺色盤 / 內頁藍色盤交叉淡入,永不重建)位於最底層;
  頁面以 `{#key pathname}` 自訂 Svelte transition 做「浮升入場 / 上浮離場 + blur」
  (取代 View Transitions API);選單開啟時內容群組 scale(.95) + blur(6px) 後退。
- **Token**:沿用既有變數名(`--ink`/`--brand`/`--glass`…)重新對映到藍色品牌系統
  (dark primary `#2F60DA`、accent `#4D7FFF`、cat green `#A3E052`、cat gold `#E5B54D`)。
  字體 Space Grotesk/Caveat → **Ubuntu**(標題/EN)+ **Roboto**(內文 Latin)+ Noto Sans TC。
- **玻璃統一**:`.glass` 改為設計稿規格 — Tint 8% · blur(28px) saturate(150%) ·
  只留頂部 rim-light(rgba(255,255,255,.3))· 深色雙層陰影。新增
  `.liquid-glass-btn` / `.liquid-glass-btn-circle` / `.glass-switch-*` / `.nl-flow`
  (center-focus 流光,`@property --nlang` conic 邊框)。
- **資料策略**:版面與文案結構照設計稿;**真實資料以 repo 為準**
  (產品 = bus/coz/activity/map、團隊 = team.ts、聯絡連結 = landing.ts)。
  課程專區無真實資料 → 沿用設計稿課程內容,放進 content 層方便日後替換。
  開發日誌以 repo 真實條目為主,套設計稿卡型。
- **i18n**:新文案全部進 paraglide messages(zh-tw + en),content 層維持資料驅動。
- **相依**:新增 `gsap`(MotionPath/Draggable/Inertia,3.13+ 全插件免費)、
  `@firecms/neat`、`@fontsource/ubuntu`、`@fontsource/roboto`;移除
  `@fontsource/space-grotesk`、`@fontsource/caveat`。

## 風險與緩解

- WebGL 雙 canvas 效能:隱藏側 `speed = 0` 暫停;`prefers-reduced-motion` 全部暫停。
- 祖先 transform/filter 會破壞子層 backdrop-filter:轉場結束後移除樣式
  (Svelte transition 天生如此),後退群組關閉時不留 filter 屬性。
- e2e 斷言 H1:首頁 H1 保留 "NYCU LIFE" 字樣。
