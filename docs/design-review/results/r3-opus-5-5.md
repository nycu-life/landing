# r3 blind review: Claude Opus 5.5 (effort high)

- Date: 2026-11-13
- Brief: `brief.md`, SHA-256 `38706a333a66ce90e7a2f1d36c2cfba51ce2651580ebe6fd7657560245416fd4` (unchanged)
- Reviewer: claude-proxy `claude-opus-5-5`, effort high, fresh thread, no other context
- Mapping (revealed after the review): **A = reference**, **B = new** (round 3), **C = baseline** (`main` at `d189336`)

| Set           | Mean of 12 scores |
| ------------- | ----------------: |
| C (baseline)  |              5.58 |
| B (new)       |              7.54 |
| A (reference) |              7.92 |

Note: the reviewer's C section repeats issues that the baseline really has; its remark that
"home-products … about 的影片區塊沒有正確呈現" also refers to the baseline.

Raw reviewer output below, unedited except that the final JSON block is shown on one line.

---

## 組 A

一句話總評：參考組是成熟的產品官網與更新日誌，字體、格線和深色系統很一致。可是截圖裡幾乎看不到載入、錯誤、表單這類狀態，所以狀態與動畫兩項只能保守給分。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                               |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 9    | linear-home desktop：首屏大標、副標、主要按鈕依序排列，產品截圖緊接在後，一眼看懂產品在做什麼。raycast-home desktop：標題與下載按鈕位於首屏正中。linear-changelog desktop：每則更新都是「日期 → 標題 → 內文」，日期最先被看到。 |
| 字體排印   | 9    | linear-home 和 linear-changelog 兩種尺寸都用同一套無襯線字族，大標字距收緊，內文行長控制得宜。raycast-blog desktop 的文章標題與摘要字級落差清楚。                                                                               |
| 色彩       | 8.5  | linear-home 和 raycast-home 都以深色為底、只用單一強調色。canny-roadmap desktop 的狀態欄用色點區分。但 raycast-home 的灰色次要文字在深底上偏暗。                                                                                |
| 間距與版面 | 9    | linear-changelog desktop 是置中的單欄閱讀寬度，段落間距規律。raycast-blog desktop 的卡片格線對齊。canny-roadmap desktop 的三欄等寬，不過內容少時下方留白偏多。                                                                  |
| 一致性     | 8.5  | 同一品牌內的按鈕圓角、卡片邊框、導覽列樣式在 home 和 changelog／blog 之間一致。不同品牌之間本來就不必一致。                                                                                                                     |
| 資訊密度   | 8    | linear-changelog mobile 一屏就能看到一則完整更新。canny-roadmap mobile 的項目很稀疏、空白偏多。raycast-home mobile 的頁面很長，視覺元素占了大量高度。                                                                           |
| 導覽       | 8    | 各頁都有固定的頂部導覽與主要按鈕。手機版收成漢堡選單（未見展開狀態）。changelog 看不到明顯的上一篇／下一篇或分頁線索。                                                                                                          |
| 狀態與回饋 | 6    | 截圖只有有資料的狀態，沒有載入、空資料、錯誤、表單驗證的畫面。canny-roadmap 有「Planned／In progress」這類狀態標籤，可以算部分線索。                                                                                            |
| 響應式     | 8.5  | linear-home mobile 的格線改成單欄，產品截圖跟著縮放，沒有橫向溢出。raycast-blog mobile 的卡片改成單欄堆疊，比例合理。                                                                                                           |
| 文案       | 8.5  | 標題短而具體，例如 linear-changelog 每則都以功能名稱當標題。沒有看到系統訊息外露。                                                                                                                                              |
| 無障礙     | 7    | raycast-home 和 linear-home 的深色底上，次要灰字對比偏低。手機版的按鈕高度看起來足夠。看不到焦點樣式。                                                                                                                          |
| 動畫與轉場 | 5    | 截圖已關閉動畫，也沒有骨架、展開收合、選單開啟等可見線索，只能保守給分。                                                                                                                                                        |

要保留的優點：

- linear-changelog 的「日期 → 標題 → 內文」單欄節奏，是更新日誌的好範本。
- linear-home 和 raycast-home 首屏都只放一個主要按鈕，行動焦點清楚。
- 深色外觀以單一強調色撐住品牌，不靠大量色塊。
- raycast-blog 的卡片格線在桌面與手機都整齊。

最重要的五個問題（由嚴重到輕微）：

1. [狀態與回饋] [canny-roadmap] [兩者] 截圖完全看不到載入、空資料、錯誤、送出回饋 —— 回饋看板的核心就是投票與提交，回饋品質無從判斷 —— 建議補上空欄位與投票後的狀態樣式。
2. [無障礙] [raycast-home] [兩者] 深色底上的灰色說明文字對比偏低 —— 小字在手機上更難讀 —— 次要文字至少提高到 4.5:1。
3. [資訊密度] [canny-roadmap] [mobile] 項目很少、留白很大，一屏看到的有用資訊很少 —— 浪費手機的垂直空間 —— 縮小欄位間距或改用列表。
4. [導覽] [linear-changelog] [兩者] 截圖範圍內沒有看到分頁或上一則／下一則 —— 長日誌難以回溯 —— 補上年月索引或分頁。
5. [動畫與轉場] [linear-home] [兩者] 沒有可見的狀態轉換線索 —— 無法評估互動回饋 —— 在靜態畫面中也保留 hover／active 的樣式差異。

## 組 B

一句話總評：NYCU LIFE 的品牌語彙（扭蛋機、貼紙按鈕、手繪外框）在 Ghost 頁面和許願池之間大致統一。空資料、錯誤、404、503 都有帶插圖與下一步的狀態頁。剩下的摩擦集中在許願池管理的操作邏輯、小字級，以及許願池空狀態與其他頁不一致。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 8    | news-zh desktop：麥穗式麵包屑「NYCU LIFE / NEWS」、大標「最新消息」、說明、社群連結，接著是三欄卡片，每張卡都是「日期 → 標題 → 摘要 → 標籤」。wish-zh desktop：大標「一起改造 NYCU 的 LIFE」、表單、「大家正在敲碗」，主次分明。admin-pending-zh desktop：登入狀態列 → 分頁 → 計數 → 卡片，層次清楚。                                                                                                                                                          |
| 字體排印   | 7.5  | devlog-post-zh mobile 的內文行高寬鬆，h2「為什麼不直接複製 CSS」和引用、程式碼區塊都有區別。但 wish-zh desktop 的「9 小時前」「9 人有共鳴」、表單隱私說明，以及 admin-pending-zh desktop 的「1 人有共鳴」、時間戳記都只有約 12px，偏小。                                                                                                                                                                                                                       |
| 色彩       | 8    | 品牌藍貫穿頂部「許願池✦」貼紙、按鈕和標籤膠囊。wish-fulfilled-dark-en desktop 的「✓ Fulfilled」用綠色膠囊表達已實現。wish-error-zh mobile 用紅色標題「暫時連不上許願池」。admin-error-zh desktop 用紅色虛線框加驚嘆號。news-dark-zh 和 devlog-dark-zh 的深色卡片底與文字對比成立。                                                                                                                                                                             |
| 間距與版面 | 7.5  | news-zh 和 devlog-zh desktop 是三欄等寬卡片，對齊整齊。但 wish-zh desktop 第三列「希望校車能顯示即時擁擠度」被旁邊帶團隊回覆的卡片撐高，卡內出現約 150px 空白。news-empty-zh desktop 的扭蛋機插圖只有約 70px，離文字很遠，左半邊顯得空。                                                                                                                                                                                                                       |
| 一致性     | 7.5  | news-empty、comics-empty、devlog-empty、not-found、ghost-down 都用同一個虛線框加扭蛋機插圖加藍色按鈕。標籤膠囊、上一篇／下一篇卡片在 news-post 和 devlog-post 之間一致。但 wish-empty-zh desktop 的空狀態只有虛線框和兩行小字，沒有插圖也沒有按鈕，跟 Ghost 頁的空狀態不是同一套。admin 的卡片（細邊框、無陰影）也和許願池前台的手繪粗框卡片不同。                                                                                                             |
| 資訊密度   | 7    | news-zh desktop 一屏約能看到 6 張卡片。wish-zh mobile 一屏約能看到 4 張願望卡。但 admin-reply-zh mobile 每張卡有 3–4 顆按鈕堆疊，一屏只看得到約 3 則。comics-zh desktop 每張卡都重複「小貢的校園日常第 N 集（Ghost 範例內容）」，資訊重複。                                                                                                                                                                                                                    |
| 導覽       | 8    | 桌面頂部導覽固定有 6 個連結和許願池貼紙，在許願池頁時貼紙改成淡紫外框，表示目前位置。news-post-zh 和 devlog-post-nocover-zh desktop 有「← 上一篇／下一篇 →」卡片並帶標題。not-found-zh desktop 除了「回首頁」，還提供「最新消息」「許願池」兩條次要路徑。admin-signed-out 有「← 返回公開許願池」。                                                                                                                                                             |
| 狀態與回饋 | 8    | wish-loading-zh desktop 用三張骨架卡。news-loading-zh mobile 的封面用灰色佔位。wish-form-error-zh mobile 在表單內顯示紅字「請用至少 4 個字描述你的願望。」。wish-error-zh mobile 有說明和「重新載入」。ghost-down-zh mobile 是品牌化的 503，有「重新整理」和「前往許願池 →」。wish-supported-zh desktop 中按過 +1 的按鈕改成淡紫填色。不足的是 wish-form-sent-zh desktop 的成功訊息只是一行 12px 綠字，admin-error-zh desktop 在錯誤框上方仍顯示「待審核 0」。 |
| 響應式     | 8    | wish-zh mobile 的表單改成上下排列，分類下拉和「投下願望」並排，「願望池／✓ 已實現」切換改成滿寬分段按鈕。devlog-zh mobile 是單欄卡片。devlog-empty-zh mobile 的頁尾連結和下載按鈕改成單欄。沒有看到橫向溢出。                                                                                                                                                                                                                                                  |
| 文案       | 7.5  | 空狀態文案有溫度，也帶下一步，例如 devlog-empty「第一篇日誌整理中／看里程碑 →」、comics-empty「小貢的第一集還在畫」、ghost-down「許願池不受影響，仍然可以許願」。但 admin-pending-zh desktop 外露「ID 32acc7e9」、「審查用管理員 / 由 NYCU LIFE SSO 驗證」這類內部資訊。admin-signed-out-zh 的「auth.nycu.one」也偏技術。                                                                                                                                      |
| 無障礙     | 7    | 主要按鈕與 +1 按鈕面積足夠，wish-zh mobile 的 +1 約 48px 高。已實現標籤同時有「✓」符號與綠色，不只靠顏色。但 wish、admin 頁有大量 12px 灰字。wish-supported-zh 只用淡紫填色表示已 +1，沒有文字變化。                                                                                                                                                                                                                                                           |
| 動畫與轉場 | 6.5  | 可見線索有：骨架卡（wish-loading、admin-loading）、灰色封面佔位（news-loading）、「顯示詳情 ∨」和「收起詳情 ∧」兩種展開狀態（wish-card-open-zh mobile）、+1 前後兩種樣式。看不到按鈕的 pressed／focus 樣式。                                                                                                                                                                                                                                                   |

要保留的優點：

- Ghost 頁的空狀態、404、503 共用一套扭蛋機插圖加虛線框加主要／次要動作，而且 503 明確告訴使用者許願池仍可用。
- 文章頁的「← 上一篇／下一篇 →」卡片，有方向標籤也有完整標題，點擊範圍大。
- 許願池的手繪粗框願望卡、膠帶裝飾、+1 貼紙按鈕，品牌感強，深色下也成立（wish-dark-zh mobile）。
- 手機版許願池的表單重排和滿寬分段切換（wish-zh mobile）。
- 標籤一律用藍色膠囊（news、devlog、文章頁），可掃讀性好。
- 已實現的願望用綠色「✓ Fulfilled」加完成日期加團隊回覆框（wish-fulfilled-dark-en desktop）。

最重要的五個問題（由嚴重到輕微）：

1. [狀態與回饋] [admin-pending-zh] [desktop] 待審核（尚未公開）的願望也提供「標記為已實現」，而且和「核准公開」「下架」並排，四顆按鈕權重接近 —— 管理員很容易誤按，造成狀態跳級 —— 待審核卡片只保留「核准公開／下架」為主要動作，「標記為已實現」移到公開後才出現，「下架」改成次要的危險樣式。
2. [一致性] [wish-empty-zh] [desktop] 許願池的空狀態只有兩行小字，沒有插圖也沒有按鈕，跟 news-empty、devlog-empty 的扭蛋機加按鈕版型不同 —— 許願池是核心互動頁，空池時更需要引導 —— 套用同一個空狀態元件，按鈕捲回表單或聚焦輸入框。
3. [狀態與回饋] [wish-form-sent-zh] [desktop] 送出成功只在表單底部出現一行約 12px 的綠字，輸入框已清空，而且頁面捲動後標題不在畫面內 —— 使用者容易不確定是否送出成功 —— 改成有圖示的成功區塊或 toast，並說明「審核通過後會出現在許願池」。
4. [字體排印] [wish-zh、admin-pending-zh] [desktop] 卡片的時間、共鳴人數、隱私說明、管理時間戳記約 12px 淺灰 —— 在 1440 寬螢幕上很難讀，對比也不足 —— 次要資訊提高到 13–14px，並加深灰階。
5. [間距與版面] [wish-zh] [desktop] 同一列卡片等高，沒有回覆的卡片（「希望校車能顯示即時擁擠度」）中間出現大塊空白 —— 看起來像缺內容 —— 改成 masonry 或讓卡片高度自適應、底部對齊 +1 列。

## 組 C

一句話總評：許願池本身做得和另一版本接近，但 Ghost 頁面有多處沒有完成：漫畫列表標題錯成「開發日誌」、空集合只剩一句孤立文字和「Page 1 of 1」、404 是英文、503 是無樣式的純文字。導覽和頁尾的用詞也在各頁之間不一致。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 資訊層級   | 6    | comics-zh desktop 的麵包屑寫「NYCU LIFE / COMICS」，大標卻是「開發日誌」，副標也是開發日誌的說明。news-zh desktop 每張卡的標籤緊貼摘要、沒有間距，例如「合作」直接接在摘要下一行。not-found-zh desktop 只有「404 / Page not found / NYCU LIFE →」三行，靠左擠在頂部。                                                                                                                                                                                              |
| 字體排印   | 6.5  | devlog-post-nocover-zh desktop 的標籤「設計」「/」「無障礙」各占一行垂直堆疊，斜線單獨成行。news-zh desktop 的摘要字級約 12px，和標題落差太大。內文頁 devlog-post-dark-zh desktop 本身的排印尚可。                                                                                                                                                                                                                                                                 |
| 色彩       | 7    | 品牌藍與深色外觀大致成立（news-dark-zh、devlog-post-dark-zh desktop），但標籤沒有色彩膠囊，只是黑字，失去分類辨識。ghost-down-zh mobile 是純白底、黑色等寬字，完全沒有品牌色。                                                                                                                                                                                                                                                                                     |
| 間距與版面 | 5.5  | news-zh desktop 改成兩欄，無封面的「11 月 16 日凌晨系統維護」卡片很矮，和左側高卡並排，留下大片空洞。devlog-zh desktop 的「無障礙稽核紀錄」卡片沒有封面，卡內下半部約 280px 全白。comics-zh desktop 每張卡寬約 455px、封面很高，一屏只看得到 4 集。                                                                                                                                                                                                                |
| 一致性     | 5    | 許願池頁導覽是「認識我們、產品、常見問題、夥伴徵才、開發日誌」（wish-zh desktop），Ghost 頁卻是「關於我們、產品、FAQ、加入我們、開發日誌」（news-zh desktop）。兩邊都沒有「最新消息」。許願池麵包屑寫「WISH POOL / PRODUCT 06」，其他頁寫「NYCU LIFE / …」。頁尾一邊是「Crafted with care by the NYCU LIFE 內容管理」，一邊是「…by the NYCU LIFE」。                                                                                                               |
| 資訊密度   | 6    | comics-zh 和 devlog-zh desktop 的兩欄大封面讓一屏只看得到 4 張卡。news-empty-zh desktop 下方大片空白，什麼都沒有。許願池密度和另一版本相當（wish-zh desktop 三欄）。                                                                                                                                                                                                                                                                                               |
| 導覽       | 6    | 頂部導覽沒有「最新消息」入口（news-zh desktop 的導覽只有 5 項）。devlog-post-zh mobile 和 news-post-zh desktop 的上一篇／下一篇只是純文字「← 標題」「標題 →」，沒有「上一篇／下一篇」標籤，點擊範圍小。404 只有一顆「NYCU LIFE →」按鈕，沒有其他去處。                                                                                                                                                                                                             |
| 狀態與回饋 | 4    | ghost-down-zh mobile 是白底等寬字「Content is temporarily unavailable. Please try ag…」，文字超出畫面被截斷，沒有導覽、按鈕或中文。news-empty-zh desktop 完全沒有空狀態，只剩頁首。devlog-empty-zh mobile 和 comics-empty-dark-zh mobile 只顯示孤立的「在那之前，可以先到「認識我們」…」和「Page 1 of 1」，前文缺失，也沒有連結。news-loading-zh mobile 的封面佔位是白色，看不出在載入。許願池的錯誤和驗證和另一版本相同（wish-form-error-zh mobile 有紅字提示）。 |
| 響應式     | 5.5  | ghost-down-zh mobile 的文字橫向溢出被截斷。devlog-zh mobile 單欄堆疊正常。wish-form-error-zh mobile 和另一版本相同、版面正常。依截圖檢視時的觀察，home-products 的產品輪播沒有外框收束，about 的影片區塊沒有正確呈現。                                                                                                                                                                                                                                             |
| 文案       | 4.5  | 中文頁面出現英文系統字串：「Page not found」（not-found-zh）、「Page 1 of 1」（devlog-empty、comics-empty）、「Content is temporarily unavailable」（ghost-down-zh）。頁尾外露「內容管理」字樣。admin-signed-out-zh desktop 寫「任何成功通過 NYCU LIFE OAuth 的帳號都可以進入」和「OAuth token」，既是內部術語，又讓人誤以為任何人都能進入管理頁。                                                                                                                 |
| 無障礙     | 6    | 上一篇／下一篇是一行純文字連結，點擊目標小（devlog-post-zh mobile）。標籤失去膠囊後，在卡片上只是 12px 黑字，可辨識度低（news-zh desktop）。許願池的按鈕尺寸和另一版本相同。                                                                                                                                                                                                                                                                                       |
| 動畫與轉場 | 5    | 許願池保留骨架與展開收合線索（wish-card-open-zh mobile 有「收起詳情」）。但 news-loading-zh mobile 的封面佔位是白色、沒有骨架感。Ghost 頁沒有其他可見的狀態轉換線索，只能保守給分。                                                                                                                                                                                                                                                                                |

要保留的優點：

- 許願池的手繪卡片、+1 貼紙按鈕、願望池／已實現切換，與品牌語彙一致（wish-zh desktop）。
- 許願池表單的錯誤提示就近顯示在表單內（wish-form-error-zh mobile）。
- 文章內文頁的排印、引用、程式碼區塊在深色下可讀（devlog-post-dark-zh desktop）。
- 漫畫集數頁的格子框與「第 3 集，第 1 格」說明清楚（comics-episode-zh mobile）。

最重要的五個問題（由嚴重到輕微）：

1. [狀態與回饋] [ghost-down-zh] [mobile] 內容服務無法連線時，只顯示白底等寬英文字，而且橫向溢出截斷，沒有導覽、品牌或下一步 —— 使用者會以為網站壞掉並直接離開，也不知道許願池仍可用 —— 改成品牌化的 503 頁，提供「重新整理」與「前往許願池」。
2. [狀態與回饋] [news-empty-zh、devlog-empty-zh、comics-empty-zh] [兩者] 空集合沒有空狀態：最新消息完全空白；開發日誌和漫畫只剩一句前文缺失的「在那之前…」加「Page 1 of 1」，沒有連結 —— 新站上線初期最常遇到這個狀態，現在看起來像壞掉 —— 補上帶標題、插圖、按鈕的空狀態，移除單頁時的分頁文字。
3. [資訊層級] [comics-zh、comics-empty-zh] [兩者] 漫畫列表的大標與副標錯用「開發日誌」 —— 使用者無法確認自己在哪一頁，也誤解內容 —— 改用漫畫專屬的標題與說明。
4. [一致性] [wish-zh 對照 news-zh] [desktop] 許願池與 Ghost 頁的導覽用詞不同（認識我們／常見問題／夥伴徵才 對 關於我們／FAQ／加入我們），兩邊都缺「最新消息」，麵包屑還外露「PRODUCT 06」 —— 跨頁跳轉時像換了網站，也找不到最新消息 —— 統一導覽元件與用詞，補回最新消息。
5. [文案] [not-found-zh、admin-signed-out-zh] [desktop] 中文 404 顯示「Page not found」；管理登入頁寫「任何成功通過 NYCU LIFE OAuth 的帳號都可以進入」並提到「OAuth token」 —— 語系混雜，而且權限描述會誤導 —— 404 改成在地化文案並加回首頁與次要路徑，登入說明改成「僅限團隊管理員」的白話描述。

```json
{
	"A": {
		"scores": {
			"資訊層級": 9,
			"字體排印": 9,
			"色彩": 8.5,
			"間距與版面": 9,
			"一致性": 8.5,
			"資訊密度": 8,
			"導覽": 8,
			"狀態與回饋": 6,
			"響應式": 8.5,
			"文案": 8.5,
			"無障礙": 7,
			"動畫與轉場": 5
		},
		"issues": [
			"canny-roadmap 兩者：看不到載入、空資料、錯誤、投票後的回饋狀態",
			"raycast-home 兩者：深色底上的灰色次要文字對比偏低",
			"canny-roadmap mobile：項目稀疏、留白過多，一屏有用資訊少",
			"linear-changelog 兩者：截圖範圍內沒有分頁或上一則／下一則",
			"linear-home 兩者：沒有可見的狀態轉換或按鈕狀態線索"
		]
	},
	"B": {
		"scores": {
			"資訊層級": 8,
			"字體排印": 7.5,
			"色彩": 8,
			"間距與版面": 7.5,
			"一致性": 7.5,
			"資訊密度": 7,
			"導覽": 8,
			"狀態與回饋": 8,
			"響應式": 8,
			"文案": 7.5,
			"無障礙": 7,
			"動畫與轉場": 6.5
		},
		"issues": [
			"admin-pending-zh desktop：待審核願望也能「標記為已實現」，四顆按鈕權重相近，容易誤按",
			"wish-empty-zh desktop：許願池空狀態沒有插圖與按鈕，和 Ghost 頁空狀態不一致",
			"wish-form-sent-zh desktop：送出成功只有一行 12px 綠字，回饋不明顯",
			"wish-zh / admin-pending-zh desktop：時間、共鳴數、說明文字約 12px 淺灰，難讀",
			"wish-zh desktop：卡片等高，沒有回覆的卡片中間出現大塊空白"
		]
	},
	"C": {
		"scores": {
			"資訊層級": 6,
			"字體排印": 6.5,
			"色彩": 7,
			"間距與版面": 5.5,
			"一致性": 5,
			"資訊密度": 6,
			"導覽": 6,
			"狀態與回饋": 4,
			"響應式": 5.5,
			"文案": 4.5,
			"無障礙": 6,
			"動畫與轉場": 5
		},
		"issues": [
			"ghost-down-zh mobile：503 是無樣式的英文等寬純文字，橫向溢出截斷，沒有下一步",
			"news-empty / devlog-empty / comics-empty：沒有空狀態，只剩孤立句子與「Page 1 of 1」",
			"comics-zh / comics-empty-zh：漫畫列表標題與說明錯用「開發日誌」",
			"wish-zh 對照 news-zh desktop：導覽用詞不一致、缺最新消息，麵包屑外露「PRODUCT 06」",
			"not-found-zh、admin-signed-out-zh：中文頁出現英文 404，登入說明外露 OAuth 術語且權限描述誤導"
		]
	}
}
```
