# r4 blind review: Claude Opus 5.5 (effort high)

- Date: 2026-11-13
- Brief: `brief.md`, SHA-256 `38706a333a66ce90e7a2f1d36c2cfba51ce2651580ebe6fd7657560245416fd4` (unchanged)
- Reviewer: claude-proxy `claude-opus-5-5`, effort high, fresh thread, no other context
- Mapping (revealed after the review): **A = new** (round 4), **B = baseline** (`main` at `d189336`), **C = reference**
- The reviewer reports it did not open a few images one by one (listed in its first paragraph).

| Set           | Mean of 12 scores |
| ------------- | ----------------: |
| B (baseline)  |              5.46 |
| A (new)       |              7.67 |
| C (reference) |              8.25 |

Maintainer note: the highlighted Google Play button in `wish-fulfilled-dark-en` is the
capture's mouse pointer resting on it after clicking the tab (a hover state), not a
design defect; from round 5 the capture moves the pointer away and the baseline was
re-shot with the same tool.

Raw reviewer output below, unedited except that the final JSON block is shown on one line.

---

註：覆蓋範圍。C 組的 10 張截圖全部看過。A、B 兩組看過以下所有狀態的桌面版：首頁各章、關於、產品、最新消息、開發日誌、漫畫、404／503、許願池主要狀態，以及管理後台的待審核、已公開、撰寫回覆、載入中、空清單、錯誤、深色。其中大部分狀態也看了手機版，加上手機選單。以下幾張沒有逐張打開，評分沒有直接依據它們：admin-signed-out-en、admin-\*-zh_mobile 的一部分、wish-form-filled、wish-loading／error／empty／fulfilled 的 mobile 版、wish-card-open_desktop。

## 組 A

一句話總評：品牌語彙（扭蛋機插圖、手繪框、貼紙按鈕）從 Ghost 頁面一路延伸到許願池與錯誤頁，各種狀態的處理很完整；剩下的主要是深色模式的細節與少數元件不一致。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 8    | wish-zh desktop：麵包屑「NYCU LIFE / WISH POOL」→ 兩行大標 → 副標 → 手繪框表單 → 「大家正在敲碗」，主次清楚。not-found-zh desktop：「404」小標、「找不到這個頁面」大標、主按鈕「回首頁」，次連結「最新消息／許願池」。admin-pending-zh desktop：狀態列、分頁、篩選、計數「待審核 5」依序排列                                                                                |
| 字體排印   | 8    | 中文大標字重夠，與內文對比明確（wish-zh、admin-signed-out-zh desktop）。wish-form-sent-en mobile：英文長句行高寬鬆、不擠。但 wish-zh desktop 卡片裡的「9 人有共鳴」、時間戳約 12px，偏小                                                                                                                                                                                    |
| 色彩       | 7.5  | 品牌藍一致；成功綠（wish-form-sent-zh desktop 綠色橫幅＋勾勾）、錯誤紅（wish-form-error「請用至少 4 個字…」）、已實現綠標（wish-fulfilled-zh）都有語意。wish-dark-zh desktop／mobile 的表單與卡片都改成深底，深色成立。不過 wish-fulfilled-dark-en desktop 頁尾的 Google Play 按鈕呈藍色高亮，像卡住的 hover／focus 狀態；products-dark-zh 的商店按鈕變白，小字說明對比偏低 |
| 間距與版面 | 7.5  | comics-dark-zh desktop 三欄格線整齊；not-found 與 ghost-down 的卡片置中、留白夠。wish-zh desktop 卡片依內容長高，同一列底部參差（第一列約 180／200／190px），格線感變弱                                                                                                                                                                                                     |
| 一致性     | 8    | 頁首、頁尾、虛線卡片＋扭蛋機插圖用在 404、503、comics-empty、wish-empty，同一套語彙。許願池導覽與 Ghost 頁面的項目相同（關於我們／產品／FAQ／加入我們／開發日誌／最新消息）。但 admin-pending-zh 的「標記為已實現」是底線文字連結，admin-reply-zh（公開中）卻是綠框按鈕；「下架」在 pending 是紅底，公開中是紅框，有落差                                                    |
| 資訊密度   | 7.5  | comics-dark-zh desktop 一屏約 6 張集數卡，合理。admin-pending-zh desktop 每筆約 165px 高，5 筆要捲兩屏，略鬆。wish-zh desktop 一屏看得到表單＋約 6 張願望                                                                                                                                                                                                                   |
| 導覽       | 7.5  | 桌面頁首有完整主導覽、語言切換、主題切換。admin 有「← 返回公開許願池」。404 提供三個出口。wish-en desktop 的英文導覽少了 Dev log／News，中英導覽結構不同，切換語言後會找不到入口                                                                                                                                                                                            |
| 狀態與回饋 | 8.5  | wish-loading-zh：三張骨架卡。wish-error-zh：紅色標題「暫時連不上許願池」＋說明＋「重新載入」。wish-empty-zh：插圖＋「寫下第一個願望」CTA。wish-supported-zh：+1 後按鈕變實心淡紫，計數變 10。admin-error-zh：紅虛線框＋驚嘆號＋「重新整理」。admin-loading-zh：分頁變灰、計數顯示「–」、spinner。ghost-down-zh：品牌化 503，並說明許願池不受影響                            |
| 響應式     | 8    | admin-pending-zh mobile：操作改成 2×2 格狀，ID chip 靠右，篩選縱向堆疊。wish-zh mobile：表單欄位縱排，分頁改為全寬切換。ghost-down-zh mobile 卡片置中、按鈕並排不溢出。沒看到橫向溢出                                                                                                                                                                                       |
| 文案       | 8    | 「這一池還很安靜／成為第一個許願的人吧」「暫時連不上許願池…願望都還在，稍後再試就好」語氣自然。頁尾「由 NYCU LIFE 學生團隊用心打造 · 原始碼」在地化。admin-signed-out-zh「登入在 auth.nycu.one 完成，這個頁面不會看到或保存你的密碼」說得清楚、不帶術語                                                                                                                     |
| 無障礙     | 7    | 主按鈕對比夠；錯誤除了紅色還有圖示或標題文字。但 admin-pending-dark-zh 的「核准公開」是淺藍底白字，對比偏低；wish 卡片的時間與計數小字是灰色。截圖中看不到焦點樣式的線索                                                                                                                                                                                                    |
| 動畫與轉場 | 6.5  | 有骨架（wish-loading）、spinner（admin-loading）、展開／收合「顯示詳情／收起詳情 ⌃」（wish-card-open mobile）、+1 後的狀態變化。但沒有轉場本身的線索，保守給分                                                                                                                                                                                                              |

要保留的優點：

- 404 與 503（not-found-zh、ghost-down-zh）用虛線卡片＋扭蛋機插圖＋主次兩層出口；503 特別說明「許願池不受影響」。
- 許願池的載入、錯誤、空資料三種狀態分開處理，各有下一步（骨架、重新載入、寫下第一個願望）。
- 表單回饋：成功是綠色橫幅＋勾勾，錯誤是粗體紅字，位置都在送出按鈕下方（wish-form-sent-zh、wish-form-error-zh）。
- 管理後台的 ID 縮成「ID 1735a96e」chip，易讀也便於搜尋（admin-pending-zh、admin-published-en）。
- 深色模式下，許願池表單與願望卡片完整改成深色（wish-dark-zh desktop／mobile）。
- 頁首與頁尾在 Ghost 頁面和許願池之間完全一致，頁尾文案也在地化。

最重要的五個問題（由嚴重到輕微）：

1. [色彩] [wish-fulfilled-dark-en] [desktop] 頁尾 Google Play 按鈕呈藍色高亮，App Store 卻沒有 —— 看起來像卡住的 hover／focus 狀態，深色頁上很搶眼 —— 檢查頁尾商店按鈕在深色主題下的預設樣式，兩顆按鈕應該一致。
2. [一致性] [admin-pending-zh／admin-reply-zh] [兩者] 「標記為已實現」在待審核是底線文字連結，在公開中是綠框按鈕；「下架」一個紅底、一個紅框 —— 同一個動作有兩種外觀，管理者要重新辨認 —— 統一成同一套按鈕層級。
3. [導覽] [wish-en、home-en] [desktop] 英文導覽少了開發日誌與最新消息，中文有 —— 切到英文後失去內容入口，也和中文版結構不一致 —— 保留入口，標註「中文」即可。
4. [無障礙] [admin-pending-dark-zh、products-dark-zh] [desktop] 深色下「核准公開」是淺藍底白字；產品頁商店按鈕的小字說明對比不足 —— 低於可讀門檻 —— 深色主按鈕改深字，或加深底色。
5. [間距與版面] [wish-zh] [desktop] 三欄願望卡依內容長高，同一列底部參差，第三列留下大片空白 —— 格線感弱，看起來不整齊 —— 改成等高卡片，或用真正的 masonry 版面。

## 組 B

一句話總評：許願池主體和 A 相近，但多處狀態處理退化或壞掉（503 裸文字、錯誤顯示成空狀態、漫畫空頁出現開發日誌內容），深色模式與中英文案也不一致。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                              |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 6.5  | not-found-zh desktop：只有「404 / Page not found / NYCU LIFE →」，擠在左上角，下方大片空白。comics-empty-zh desktop：麵包屑是 COMICS，大標卻是「開發日誌」，頁面身份錯亂。wish-zh 的主結構仍然清楚                                                                                                                                             |
| 字體排印   | 7    | 大標與 A 相同；但 wish-zh desktop 的「公開匿名顯示」說明約 11px，wish-zh mobile 擠成三行小字。ghost-down-zh 是瀏覽器預設等寬字                                                                                                                                                                                                                 |
| 色彩       | 5.5  | wish-dark-zh desktop／mobile：深色頁面上，表單框與所有願望卡仍是純白，像沒套到深色主題。wish-fulfilled-dark-en 卡片也是白底。admin-error-zh 錯誤橫幅底下的空狀態卻用綠勾，語意互相矛盾                                                                                                                                                         |
| 間距與版面 | 6.5  | wish-zh desktop：卡片被拉成等高，「希望校車能顯示即時擁擠度」整張卡中段約 150px 空白。not-found-zh desktop 內容全部靠左上，1440 寬幾乎全空。comics-dark-zh desktop 兩欄大卡，單卡約 460px 高                                                                                                                                                   |
| 一致性     | 4.5  | 許願池導覽用「認識我們／常見問題／夥伴徵才」，Ghost 頁面用「關於我們／FAQ／加入我們」，同一站兩套名稱。許願池麵包屑是「WISH POOL / PRODUCT 06」。404 與 503 不沿用任何品牌元件                                                                                                                                                                 |
| 資訊密度   | 6    | comics-dark-zh desktop 一屏只有約 4 張集數卡。admin-pending-zh desktop 的 ID 顯示成截斷 UUID「652981b1-98a3-487f-ae5c…」，佔位又難讀。about 的影片區只有一塊空暗框                                                                                                                                                                             |
| 導覽       | 5.5  | 頁首沒有「最新消息」（wish-zh、not-found-zh desktop）。404 只有一顆寫著「NYCU LIFE →」的按鈕，沒說會去哪裡。devlog-empty 出現英文「Page 1 of 1」，也沒有返回或替代路徑                                                                                                                                                                         |
| 狀態與回饋 | 4    | ghost-down-zh：白底等寬英文「Content is temporarily unavailable…」，沒有頁首、品牌與出口。wish-error-zh：表單下方紅色小字，列表卻顯示「這一池還很安靜」，錯誤被當成空資料。admin-error-zh：紅色錯誤橫幅＋綠勾「這裡目前沒有項目」，兩個訊息打架。wish-loading 只有一行文字。wish-empty 沒有 CTA。成功只有一行綠字（wish-form-sent-zh desktop） |
| 響應式     | 5    | ghost-down-zh mobile：等寬文字被裁成「Please try ag」，右側溢出。admin-pending-zh mobile 的 2×2 操作按鈕排得不錯。wish mobile 表單可用                                                                                                                                                                                                         |
| 文案       | 4.5  | 中文頁混英文：頁尾「Crafted with care by the NYCU LIFE 內容管理」、404「Page not found」、devlog-empty「Page 1 of 1」。devlog-empty 有一句沒有前文的「在那之前，可以先到『認識我們』…」。內部標籤外露：「PRODUCT 06」、admin-signed-out-zh 的「OAuth token」                                                                                   |
| 無障礙     | 5.5  | not-found-dark-zh mobile：淺藍按鈕配白字「NYCU LIFE →」，對比低。錯誤訊息只靠紅色小字（wish-form-error-zh「請用至少 4 個字…」，沒有圖示或粗體）。wish-zh desktop 卡片小字偏淡                                                                                                                                                                  |
| 動畫與轉場 | 5    | 沒有骨架，載入只有文字（wish-loading-zh、admin-loading 改成「正在確認登入狀態…」＋spinner）。有展開／收合（wish-card-open mobile「收起詳情」）。線索有限，保守給分                                                                                                                                                                             |

要保留的優點：

- 手機管理後台：每筆願望的四個操作排成 2×2 等寬按鈕，「標記為已實現」是綠框按鈕，好點擊（admin-pending-zh mobile）。
- 管理後台在待審核與公開中，「標記為已實現」都用同一種綠框按鈕，比 A 一致（admin-pending-zh、admin-reply-zh desktop）。
- 許願池主視覺：手繪框表單、貼紙式「投下願望」按鈕、膠帶裝飾卡片，品牌感強（wish-zh desktop）。
- 已實現分頁：綠色「✓ 已實現」標、團隊回覆框、日期資訊清楚（wish-fulfilled-zh desktop）。
- 英文版導覽保留「Dev log」入口（wish-en desktop）。

最重要的五個問題（由嚴重到輕微）：

1. [狀態與回饋] [ghost-down-zh] [兩者] 內容服務掛掉時只剩白底等寬英文一行，手機還被裁成「Please try ag」 —— 使用者完全失去品牌、導覽，也不知道許願池還能用 —— 改用品牌化 503 頁，加上重新整理與前往許願池的出口。
2. [狀態與回饋] [wish-error-zh、admin-error-zh] [desktop] 載入失敗時列表顯示「這一池還很安靜」或綠勾「這裡目前沒有項目」 —— 把錯誤偽裝成空資料，使用者會以為真的沒有願望 —— 分開錯誤與空狀態，錯誤狀態要有重試按鈕。
3. [文案] [comics-empty-zh、devlog-empty-zh、comics-dark-zh] [兩者] 漫畫頁大標是「開發日誌」，空頁有沒頭沒尾的「在那之前…」與英文「Page 1 of 1」 —— 頁面身份錯誤、內容外露 —— 修正模板標題，空頁給專屬的說明與 CTA。
4. [色彩] [wish-dark-zh、wish-fulfilled-dark-en] [兩者] 深色模式下，表單與願望卡仍是純白 —— 深色頁裡出現大塊刺眼白卡，主題不完整 —— 讓卡片、表單、輸入框跟隨深色 token。
5. [一致性] [wish-zh vs not-found-zh] [desktop] 許願池導覽「認識我們／常見問題／夥伴徵才」與 Ghost 頁「關於我們／FAQ／加入我們」不同；許願池少了「最新消息」，麵包屑寫「PRODUCT 06」 —— 跨頁像兩個網站 —— 共用同一份導覽與麵包屑資料。

## 組 C

一句話總評：參考組（Linear、Raycast、Canny）整體成熟，排印、深色與格線都很穩，但能看到的狀態種類很少，部分版面偏空。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                               |
| ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 9    | linear-home desktop：首屏一句大標＋副標＋主 CTA，下方是產品截圖。raycast-home desktop 也是大標＋下載 CTA。linear-changelog 每則以日期＋標題開頭 |
| 字體排印   | 9    | linear-changelog desktop：標題、日期、內文三層字級清楚，行長控制得好。raycast-blog 的卡片標題與摘要層次分明                                     |
| 色彩       | 8.5  | Linear 深色底配低彩度灰階，品牌一致。Raycast 深色加紅色重點。語意色出現得少，Canny roadmap 用狀態欄位色區分                                     |
| 間距與版面 | 8.5  | raycast-blog desktop 格線整齊。canny-roadmap desktop 三欄內容很少，大片留白，1440 寬沒有善用                                                    |
| 一致性     | 9    | 同品牌頁面之間（linear-home／linear-changelog、raycast-home／raycast-blog）的頁首、按鈕、卡片圓角一致                                           |
| 資訊密度   | 8    | linear-changelog 一屏約 1–2 則，配大圖，偏鬆。canny-roadmap desktop 稀疏。raycast-blog 一屏約 6 篇，適中                                        |
| 導覽       | 8.5  | 各頁頁首導覽完整。手機版收成漢堡選單（linear-home、raycast-home mobile）。changelog 與 blog 是長列表，截圖中看不到分頁                          |
| 狀態與回饋 | 7    | 截圖幾乎只有「有資料」狀態，看不到載入、錯誤、表單回饋。Canny 有狀態欄位分類，回饋看板的投票數清楚                                              |
| 響應式     | 8.5  | linear-home mobile：標題重新斷行，截圖縮放合理。raycast-home mobile 區塊改成單欄，沒有溢出                                                      |
| 文案       | 8.5  | 標題精簡、用詞一致。changelog 條目直接描述變更                                                                                                  |
| 無障礙     | 7.5  | 深色底上的次要灰字（linear-home、linear-changelog 的說明與日期）對比偏低。主要按鈕夠大                                                          |
| 動畫與轉場 | 7    | 首頁有產品截圖與漸層，暗示有動態，但截圖沒有骨架或展開線索，保守給分                                                                            |

要保留的優點：

- Linear changelog：每則都是日期＋標題＋配圖，可以快速掃讀，適合參考開發日誌列表。
- Raycast blog：封面卡片網格整齊，標題與摘要層次清楚。
- Linear 與 Raycast 首頁首屏：一句價值主張＋單一主 CTA，非常聚焦。
- Canny roadmap：用狀態欄位呈現回饋進度，和「許願池／已實現」的概念對得上。

最重要的五個問題（由嚴重到輕微）：

1. [資訊密度] [canny-roadmap] [desktop] 三欄 roadmap 內容稀少，大片空白 —— 1440 寬沒有善用，第一眼看不出有多少回饋 —— 欄寬依內容調整，或加入摘要計數。
2. [無障礙] [linear-home、linear-changelog] [兩者] 深色底上的次要灰字對比偏低 —— 日期與說明不易閱讀 —— 提高次要文字亮度。
3. [資訊密度] [linear-changelog] [desktop] 每則配大圖，一屏只看得到 1–2 則 —— 想找特定更新要捲很久 —— 提供精簡列表或目錄。
4. [狀態與回饋] [全組] [兩者] 沒有載入、錯誤、空資料的可見範例 —— 無法評估回饋設計 —— 不適用於產品本身，只是參考範圍有限。
5. [導覽] [raycast-blog、linear-changelog] [mobile] 長列表在截圖範圍內看不到分頁或篩選 —— 手機上要找舊文很難 —— 加上分類篩選或年份跳轉。

```json
{
	"A": {
		"scores": {
			"資訊層級": 8,
			"字體排印": 8,
			"色彩": 7.5,
			"間距與版面": 7.5,
			"一致性": 8,
			"資訊密度": 7.5,
			"導覽": 7.5,
			"狀態與回饋": 8.5,
			"響應式": 8,
			"文案": 8,
			"無障礙": 7,
			"動畫與轉場": 6.5
		},
		"issues": [
			"[色彩] wish-fulfilled-dark-en desktop：深色頁尾 Google Play 按鈕呈藍色高亮，App Store 沒有，像卡住的 hover/focus 狀態",
			"[一致性] admin-pending-zh vs admin-reply-zh：「標記為已實現」一處是底線連結、一處是綠框按鈕；「下架」紅底與紅框不一致",
			"[導覽] wish-en/home-en desktop：英文導覽少了開發日誌與最新消息入口，與中文版結構不同",
			"[無障礙] admin-pending-dark-zh、products-dark-zh：深色下淺藍底白字的主按鈕與商店按鈕小字對比不足",
			"[間距與版面] wish-zh desktop：願望卡依內容長高，同一列底部參差、格線感弱"
		]
	},
	"B": {
		"scores": {
			"資訊層級": 6.5,
			"字體排印": 7,
			"色彩": 5.5,
			"間距與版面": 6.5,
			"一致性": 4.5,
			"資訊密度": 6,
			"導覽": 5.5,
			"狀態與回饋": 4,
			"響應式": 5,
			"文案": 4.5,
			"無障礙": 5.5,
			"動畫與轉場": 5
		},
		"issues": [
			"[狀態與回饋] ghost-down-zh：503 只剩白底等寬英文一行，手機被裁成「Please try ag」，沒有品牌與出口",
			"[狀態與回饋] wish-error-zh、admin-error-zh：載入失敗時同時顯示「這一池還很安靜」或綠勾空狀態，錯誤被偽裝成沒有資料",
			"[文案] comics-empty-zh/comics-dark-zh/devlog-empty-zh：漫畫頁大標顯示「開發日誌」，空頁有沒頭沒尾的句子與英文「Page 1 of 1」",
			"[色彩] wish-dark-zh、wish-fulfilled-dark-en：深色模式下表單與願望卡仍是純白，主題不完整",
			"[一致性] wish-zh vs Ghost 頁：導覽名稱兩套（認識我們/常見問題/夥伴徵才 vs 關於我們/FAQ/加入我們），缺最新消息，麵包屑外露「PRODUCT 06」"
		]
	},
	"C": {
		"scores": {
			"資訊層級": 9,
			"字體排印": 9,
			"色彩": 8.5,
			"間距與版面": 8.5,
			"一致性": 9,
			"資訊密度": 8,
			"導覽": 8.5,
			"狀態與回饋": 7,
			"響應式": 8.5,
			"文案": 8.5,
			"無障礙": 7.5,
			"動畫與轉場": 7
		},
		"issues": [
			"[資訊密度] canny-roadmap desktop：三欄 roadmap 內容稀少、大片留白",
			"[無障礙] linear-home/linear-changelog：深色底次要灰字對比偏低",
			"[資訊密度] linear-changelog desktop：每則大圖，一屏僅 1–2 則",
			"[狀態與回饋] 全組：截圖中沒有載入、錯誤、空資料狀態可評估",
			"[導覽] raycast-blog/linear-changelog mobile：長列表看不到分頁或篩選"
		]
	}
}
```
