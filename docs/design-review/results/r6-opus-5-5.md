# r6 blind review: Claude Opus 5.5 (effort high)

- Date: 2026-11-13
- Brief: `brief.md`, SHA-256 `38706a333a66ce90e7a2f1d36c2cfba51ce2651580ebe6fd7657560245416fd4` (unchanged)
- Reviewer: claude-proxy `claude-opus-5-5`, effort high, fresh thread, no other context
- Mapping (revealed after the review): **A = baseline** (`main` at `d189336`), **B = new** (round 6), **C = reference**
- The reviewer reports it did not open every A/B image (first paragraph).

| Set           | Mean of 12 scores |
| ------------- | ----------------: |
| A (baseline)  |              5.83 |
| B (new)       |              7.63 |
| C (reference) |              7.50 |

Maintainer note: the "floating tape" in `wish-fulfilled-zh` / `wish-zh` is real — Chromium
paints each card's absolutely positioned tape again below a CSS multi-column; round 7
replaces the columns with a row-major grid masonry.

Raw reviewer output below, unedited except that the final JSON block is shown on one line.

---

> 說明：A、B 兩組有一部分截圖沒有逐一打開。已打開的包括首頁五章、關於、產品、最新消息、開發日誌、漫畫、錯誤頁、許願池主要狀態與管理頁的代表狀態；C 組十張全部看過。下方證據只引用我確實看到、而且能具體描述的畫面。早期看過的首頁與關於頁在後段已無法對照細節，所以這兩區只用來佐證整體印象，不作為扣分的主要依據。

## 組 A

一句話總評：品牌語彙（扭蛋機、手繪貼紙按鈕、膠帶卡片）有出來，但錯誤、空資料等邊緣狀態大多沒有設計，還外露英文系統字串，Ghost 頁和許願池的導覽用詞也互相打架，讓完成度明顯掉一級。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                   |
| ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 6.5  | wish-zh desktop：大標「一起改造 NYCU 的 LIFE」、許願表單、卡片牆主次清楚；但 not-found-zh desktop 只有左上角「404 / Page not found」和一顆「NYCU LIFE →」按鈕，沒有說明，下面大片空白；comics-empty-zh mobile 的標題錯寫成「開發日誌」。                                            |
| 字體排印   | 6.5  | wish-zh desktop 卡片標題粗黑、層次清楚，但「9 人有共鳴」「9 小時前」字級很小而且偏淡；ghost-down-zh desktop 用瀏覽器預設的等寬字；comics-empty-zh mobile 的「Page 1 of 1」是英文 Roboto，混在中文頁裡。                                                                             |
| 色彩       | 7    | 藍色主色一致；wish-fulfilled-zh desktop 的綠色「✓ 已實現」徽章語意正確；admin-pending-dark-zh desktop 深色成立。但 wish-error-zh desktop 的錯誤只是一行小紅字，語意色的份量不夠。                                                                                                   |
| 間距與版面 | 6    | wish-zh desktop 用等高格線，第三列「希望校車能顯示即時擁擠度」卡片被同列有回覆的卡片撐高，內部約 200px 空白；not-found-zh desktop 內容擠在左上角，1440 寬幾乎沒有利用。                                                                                                             |
| 一致性     | 5    | 許願池頁的導覽是「認識我們／產品／常見問題／夥伴徵才／開發日誌」，404 與漫畫頁是「關於我們／產品／FAQ／加入我們／開發日誌」；頁尾在 Ghost 頁寫「Crafted with care by the NYCU LIFE 內容管理」，許願池頁寫「…by the NYCU LIFE」；ghost-down 完全沒有站體外框。                       |
| 資訊密度   | 6.5  | wish-zh mobile 的兩行大標加表單，第一屏只看得到表單；admin-pending-zh desktop 每張卡塞四顆按鈕加一串截斷的 UUID，資訊雜亂。                                                                                                                                                         |
| 導覽       | 6    | 頂部導覽沒有「最新消息」入口（not-found-zh desktop 可見）；404 只提供一個回首頁按鈕；admin-signed-out-zh desktop 有「← 返回公開許願池」算好的做法。                                                                                                                                 |
| 狀態與回饋 | 4    | ghost-down-zh desktop／mobile 是純文字英文訊息；wish-error-zh desktop 列表區顯示「這一池還很安靜，成為第一個許願的人吧」，把錯誤偽裝成空資料；wish-loading-zh desktop 只有一行「正在聽大家的願望…」；admin-error-zh mobile 同時出現紅色錯誤條和綠勾「這裡目前沒有項目」，互相矛盾。 |
| 響應式     | 6.5  | wish-zh mobile 的表單改成直排、分頁改成滿寬膠囊，合理；但 not-found-dark-zh mobile 的 404 區塊只有標題與按鈕，下面接很長的頁尾；ghost-down-zh mobile 只有一行未換行設計的系統字。                                                                                                   |
| 文案       | 5    | 「Content is temporarily unavailable. Please try again shortly.」（ghost-down）、「Page not found」（404）、「Page 1 of 1」（comics-empty）都是英文外露；「WISH POOL / PRODUCT 06」、頁尾「內容管理」是內部用語；admin-signed-out-zh desktop 出現「OAuth token」。                  |
| 無障礙     | 6    | wish-zh desktop 的 +1 按鈕約 70×32px，在手機上偏小；灰色小字「9 人有共鳴」對比偏低；admin-pending-zh desktop 的「下架」與「撰寫回覆」外觀相同，破壞性動作只能靠位置區分。                                                                                                           |
| 動畫與轉場 | 5    | 可見線索少：wish-loading 沒有骨架；wish-supported-zh desktop 的 +1 按下後只是淺紫底；wish-card-open-zh mobile 有「收起詳情 ⌃」箭頭可以表示展開狀態。依據不足，給保守分數。                                                                                                          |

要保留的優點：

- 許願池卡片的膠帶貼角、粗黑描邊與紫色偏移陰影，是辨識度高的手作感元件（wish-zh desktop）。
- 手繪雲朵形「投下願望 ✸」主按鈕和頂部「許願池 ✦」貼紙，品牌語彙鮮明。
- 已實現卡片的綠色「✓ 已實現」徽章、實現日期與團隊回覆框，資訊完整（wish-fulfilled-zh desktop）。
- 管理頁頂部的登入狀態列（綠點、「已登入許願池管理」、重新整理、登出）清楚交代身分（admin-pending-zh desktop）。
- 手機版願望分頁改成滿寬雙段切換，點擊範圍大（wish-zh mobile）。

最重要的五個問題（由嚴重到輕微）：

1. [狀態與回饋] [ghost-down-zh] [兩者] 內容服務掛掉時只顯示一行英文等寬純文字，沒有站體框架、品牌、重試或前往許願池的路 —— 使用者會以為整個網站壞了，也找不到仍然可用的許願池 —— 改成有導覽列與扭蛋機插圖的 503 卡片，提供「重新整理」和「前往許願池」。
2. [狀態與回饋] [wish-error-zh、admin-error-zh] [兩者] 讀取失敗時列表顯示的是空資料文案（「這一池還很安靜」「這裡目前沒有項目 ✓」）—— 誤導使用者以為真的沒有願望，甚至鼓勵重複許願 —— 錯誤和空資料要分開成獨立狀態，錯誤狀態放紅色標題、原因與「重新載入」。
3. [文案] [comics-empty-zh、not-found-zh、footer] [兩者] 漫畫空頁的標題與說明誤用開發日誌的文案，並出現「Page 1 of 1」「Page not found」「Crafted with care by the NYCU LIFE 內容管理」—— 中文使用者會看到英文和內部用語，像是半成品 —— 全面在地化，修正漫畫頁的標題與說明，頁尾改成自然中文。
4. [一致性] [wish-zh vs not-found-zh] [desktop] 同一個導覽列在許願池和 Ghost 頁的用詞不同（認識我們／常見問題／夥伴徵才 vs 關於我們／FAQ／加入我們），而且沒有「最新消息」—— 跨頁時目前位置感混亂，消息也找不到入口 —— 統一成一份導覽資料，並補上最新消息。
5. [間距與版面] [wish-zh] [desktop] 等高格線讓沒有回覆的卡片出現大片空白（第三列左卡）—— 卡片牆看起來鬆散，降低一屏的密度 —— 改成瀑布流或讓卡片依內容自然高度排列，回覆框改成摺疊。

## 組 B

一句話總評：同一套手作品牌語彙延伸到錯誤、空資料、載入與管理流程，每個邊緣狀態都有插圖、說明和下一步，整站的導覽與頁尾也統一了；剩下的多半是瀑布流裝飾和英文眉標之類的細節。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                               |
| ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 8    | not-found-zh desktop：「404」眉標、大標「找不到這個頁面」、說明、主按鈕「回首頁 →」加兩個次要連結，主次分明；wish-zh mobile 的大標縮成一行，第一屏就能看到完整表單。                                                                                                                            |
| 字體排印   | 7.5  | wish-zh desktop 卡片計數字級加大到可讀；wish-form-error-zh desktop 的錯誤改成粗體紅字；但眉標「NYCU LIFE / WISH POOL」「NYCU LIFE / COMICS」在中文頁仍用全大寫英文加寬字距。                                                                                                                    |
| 色彩       | 8    | wish-form-sent-zh mobile 是綠底、綠框、勾選圖示的成功框；wish-error-zh desktop 用紅色標題加中性說明；admin-pending-zh desktop 的「下架」用淡紅底，和「核准公開」藍色主按鈕對比明確；wish-dark-zh mobile 深色卡片、白色 +1 按鈕都成立。                                                          |
| 間距與版面 | 7.5  | wish-zh desktop 改成瀑布流，卡片依內容高度排列、沒有大空洞；ghost-down-zh desktop 的卡片置中。但 wish-fulfilled-zh desktop 第一、二欄卡片下方的膠帶裝飾（約 y≈495）脫離卡片，懸浮在空白處。                                                                                                     |
| 一致性     | 8    | 導覽在 wish、404、admin 都是「關於我們／產品／FAQ／加入我們／開發日誌／最新消息」；頁尾統一寫「由 NYCU LIFE 學生團隊用心打造 · 原始碼」；404、503、漫畫空頁都用同一個扭蛋機插圖加虛線卡片。                                                                                                     |
| 資訊密度   | 7.5  | admin-pending-zh desktop 用「ID 6e553d99」短籤加「更多 ⌄」收納次要動作，每列只剩三顆按鈕；wish-zh desktop 一屏可見的卡片比等高格線多。                                                                                                                                                          |
| 導覽       | 7.5  | not-found-zh desktop 提供回首頁、最新消息、許願池三條路；wish-en desktop 的導覽標「Dev log (中文)」「News (中文)」，事先告知文章只有中文；ghost-down 的頂部只剩「許願池」按鈕，降級合理。                                                                                                       |
| 狀態與回饋 | 8.5  | wish-loading-zh desktop 用三張骨架卡；wish-error-zh desktop 有「暫時連不上許願池」、原因說明和「重新載入」；admin-loading-zh desktop 有旋轉圖示、計數變成「–」、分頁轉灰；admin-error-zh mobile 用驚嘆號圖示加「重新整理」；comics-empty-zh mobile 有「小貢的第一集還在畫」和「看開發日誌 →」。 |
| 響應式     | 8    | admin-pending-dark-zh mobile 把動作改成「更多／下架」並排、「核准公開」滿寬；ghost-down-zh mobile 的插圖與按鈕改成置中直排；wish-zh mobile 的分頁膠囊滿寬。                                                                                                                                     |
| 文案       | 7.5  | 「頁面暫時打不開／網站內容服務沒有回應…許願池不受影響，仍然可以許願」語氣自然又給出路；admin-signed-out-zh desktop 改寫成「用 NYCU LIFE 帳號登入後，就能審核願望、公開或下架內容，並回覆同學」，拿掉了 OAuth 術語；仍有英文眉標「WISH POOL / ADMIN」。                                          |
| 無障礙     | 7    | +1 按鈕放大到約 80×38px（wish-zh desktop）；破壞性的「下架」用顏色加位置區分；但 wish-zh desktop 的「顯示詳情 ⌄」連結字級很小，admin-pending-dark-zh mobile 的淺藍「核准公開」配深色字，對比需要確認。                                                                                          |
| 動畫與轉場 | 6.5  | 有骨架（wish-loading）、spinner（admin-loading）、展開與收合箭頭（wish-card-open-zh mobile 的「收起詳情 ⌃」）、已 +1 狀態（wish-supported-zh desktop 第一張卡的 +1 填紫）；截圖無法驗證過渡本身。                                                                                               |

要保留的優點：

- 503／404／漫畫空頁共用的「扭蛋機插圖 + 虛線卡片 + 主次按鈕」模組（ghost-down-zh、not-found-zh、comics-empty-zh）。
- 許願池的骨架卡沿用真卡片的描邊與膠帶，載入時版面不跳動（wish-loading-zh desktop）。
- 帶圖示的綠色成功框「願望已收到！團隊審核通過後就會出現在許願池」（wish-form-sent-zh mobile）。
- 管理卡片的短 ID 籤、「更多 ⌄」收納和紅色「下架」的動作層級（admin-pending-zh desktop）。
- 英文版導覽列標示「(中文)」，事先告知文章語言（wish-en desktop）。
- 手機許願池把大標縮成一行，讓表單上移到第一屏（wish-zh mobile）。

最重要的五個問題（由嚴重到輕微）：

1. [間距與版面] [wish-fulfilled-zh、wish-zh] [desktop] 瀑布流卡片底部的第二條膠帶在卡片變短後懸浮在空白處（wish-fulfilled-zh 第一、二欄 y≈495；wish-zh 第一、二欄最底部）—— 看起來像錯位的殘片，削弱手作感的精緻度 —— 膠帶只貼在卡片右上角，或用卡片內的相對定位固定在卡片邊緣。
2. [響應式] [wish-zh] [desktop vs mobile] 瀑布流在桌面上依欄排列（第一列是課表、餐廳、校車擁擠度），手機上卻是課表、討論室、博愛接駁，兩者順序不一致 —— 依熱度或時間排序的語意在桌面上被打亂 —— 改成依列優先的 masonry，或在分頁旁明示排序依據。
3. [文案] [comics-empty-zh、admin-signed-out-zh、wish-zh] [兩者] 中文頁的眉標仍是全大寫英文「NYCU LIFE / COMICS」「WISH POOL / ADMIN」—— 對以中文為主的使用者是裝飾性雜訊，也和已在地化的內文不一致 —— 中文介面改成「NYCU LIFE／漫畫」，或縮小並降低對比，只當裝飾。
4. [無障礙] [wish-zh、admin-pending-dark-zh] [兩者] 「顯示詳情 ⌄」是小字連結，點擊範圍小；深色模式「核准公開」的淺藍底配深字需要確認對比 —— 手機上不容易點中，深色可讀性有風險 —— 加大詳情觸控區到 44px 高，並檢查深色主按鈕的對比度。
5. [狀態與回饋] [admin-loading-zh] [desktop] 載入時「重新整理」按鈕和分頁只是轉淡，沒有說明為什麼不能操作 —— 管理者可能會重複點擊 —— 加上 aria-busy 和「載入中」提示文字，或在按鈕內顯示 spinner。

## 組 C

一句話總評：參考組（Linear、Raycast、Canny）的字體、留白和暗色系統成熟、品牌一致，但手機上有被裁切的跑馬燈、蓋住內容的浮動按鈕和大片空白欄，看得到的狀態類型也很少。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                              |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 資訊層級   | 8.5  | linear-home desktop：大標、副標、產品截圖、客戶 logo 依序排列；linear-changelog desktop：日期放左欄、標題放右欄，時間軸清楚；canny-roadmap desktop 的三欄狀態一眼可讀。                                                        |
| 字體排印   | 8.5  | linear-changelog desktop 內文行長約 520px、行高舒適；raycast-blog desktop 卡片標題與摘要層次清楚；但 raycast-blog 的日期用小號等寬灰字，可讀性偏弱。                                                                           |
| 色彩       | 8    | Linear 和 Raycast 的暗色系統一致，Raycast 用紅色斜光帶強化品牌；canny-roadmap 用灰、藍、紫點標示狀態，但光靠小圓點傳達狀態。                                                                                                   |
| 間距與版面 | 7    | raycast-home desktop 在主視覺與「Take shortcuts, not detours.」之間有約 350px 的純黑空白；canny-roadmap mobile 的「Planned」欄只有兩項，卻撐出約 350px 的空白。                                                                |
| 一致性     | 8.5  | linear-home 與 linear-changelog 共用導覽、字體和暗色卡片；raycast-home 與 raycast-blog 共用膠囊導覽和卡片圓角。                                                                                                                |
| 資訊密度   | 8    | raycast-blog desktop 一屏 3×6 張卡片，資訊緊湊不擁擠；canny-roadmap desktop 的欄內清單密度高，但欄底被裁切（「Edit/Delete Merged Comment」下方字被截掉）。                                                                     |
| 導覽       | 7.5  | linear-changelog desktop 有分類分頁、搜尋和訂閱鈴鐺；但 linear-changelog mobile 的分類列在右緣被截成「Fr…」，沒有捲動提示；canny-roadmap mobile 的分頁列沒有標示目前位置。                                                     |
| 狀態與回饋 | 6    | 截圖只有正常資料狀態；canny-roadmap 有投票數方塊，但看不到已投票、載入或錯誤狀態，可評證據有限。                                                                                                                               |
| 響應式     | 7    | linear-home mobile 的客戶 logo 列左右都被裁切（「OpenAI」只剩「penAI」），功能卡片右側被切掉；canny-roadmap mobile 的浮動客服按鈕蓋住「Allow certain tags to be made publ…」；raycast-home mobile 的剪貼簿截圖字小到無法閱讀。 |
| 文案       | 8.5  | 「Your shortcut to everything.」「Take shortcuts, not detours.」短而精準；Linear changelog 條列清楚、口吻一致。                                                                                                                |
| 無障礙     | 6.5  | linear-home desktop 的副標與「POWERING THE COMPANIES…」是深底上的極小灰字；raycast-blog 的日期是小號淡灰等寬字；canny 的狀態只靠彩色圓點。                                                                                     |
| 動畫與轉場 | 6    | 只看到靜態線索：linear-changelog 的「Fixes ›」等摺疊列表示可展開；raycast-home 的 dock 有選中狀態；沒有載入或轉場證據，給保守分數。                                                                                            |

要保留的優點：

- Linear changelog 的「左日期、右內容」時間軸，加上可摺疊的 Fixes／Improvements 子清單。
- Raycast blog 的精選大卡加三欄卡片網格，日期與作者頭像固定在卡片底部。
- Canny roadmap 的投票數方塊放在標題左側，投票行動和計數合而為一。
- Linear 與 Raycast 的整站暗色 token 一致，導覽、卡片、按鈕共用同一套圓角與邊框。

最重要的五個問題（由嚴重到輕微）：

1. [響應式] [canny-roadmap] [mobile] 右下的浮動客服按鈕蓋住清單標題「Allow certain tags to be made publ…」—— 內容無法閱讀，也可能誤觸 —— 為內容區保留底部安全距離，或捲動時把按鈕縮小。
2. [響應式] [linear-home、linear-changelog] [mobile] 客戶 logo 列、功能卡片和分類分頁在右緣被硬性裁切，沒有捲動提示 —— 使用者不知道可以橫向捲動，分類也可能被遺漏 —— 加漸層遮罩或分頁箭頭，分類改成可換行。
3. [間距與版面] [raycast-home] [desktop] 主視覺下方約 350px 的純黑空白 —— 看起來像載入失敗，打斷敘事節奏 —— 縮短間距，或在那段放入過渡內容。
4. [無障礙] [linear-home、raycast-blog] [兩者] 深底上大量極小的淡灰說明字和等寬日期 —— 低視力或戶外使用時難以閱讀 —— 提高次要文字的對比到 4.5:1 以上。
5. [間距與版面] [canny-roadmap] [兩者] 狀態欄固定高度：桌面版欄底內容被截斷，手機版「Planned」欄留下大片空白 —— 浪費空間又藏住內容 —— 欄高改成跟著內容走，或明確提供「查看更多」。

```json
{
	"A": {
		"scores": {
			"資訊層級": 6.5,
			"字體排印": 6.5,
			"色彩": 7,
			"間距與版面": 6,
			"一致性": 5,
			"資訊密度": 6.5,
			"導覽": 6,
			"狀態與回饋": 4,
			"響應式": 6.5,
			"文案": 5,
			"無障礙": 6,
			"動畫與轉場": 5
		},
		"issues": [
			"[狀態與回饋] ghost-down-zh 兩者：內容服務故障時只顯示一行英文等寬純文字，沒有站體、重試或前往許願池的出路",
			"[狀態與回饋] wish-error-zh、admin-error-zh 兩者：讀取失敗時列表顯示空資料文案（這一池還很安靜／這裡目前沒有項目 ✓），錯誤被偽裝成空集合",
			"[文案] comics-empty-zh、not-found-zh、footer 兩者：漫畫空頁誤用開發日誌的標題與說明，並外露 Page 1 of 1、Page not found、『內容管理』等英文與內部字串",
			"[一致性] wish-zh vs not-found-zh desktop：許願池與 Ghost 頁的導覽用詞不同，且缺少最新消息入口",
			"[間距與版面] wish-zh desktop：等高格線讓無回覆的卡片出現大片空白，卡片牆鬆散"
		]
	},
	"B": {
		"scores": {
			"資訊層級": 8,
			"字體排印": 7.5,
			"色彩": 8,
			"間距與版面": 7.5,
			"一致性": 8,
			"資訊密度": 7.5,
			"導覽": 7.5,
			"狀態與回饋": 8.5,
			"響應式": 8,
			"文案": 7.5,
			"無障礙": 7,
			"動畫與轉場": 6.5
		},
		"issues": [
			"[間距與版面] wish-fulfilled-zh、wish-zh desktop：瀑布流卡片底部的膠帶裝飾脫離卡片、懸浮在空白處",
			"[響應式] wish-zh desktop vs mobile：瀑布流依欄排列，桌面與手機的卡片順序不一致，打亂排序語意",
			"[文案] comics-empty-zh、admin-signed-out-zh、wish-zh 兩者：中文頁仍用全大寫英文眉標（NYCU LIFE / COMICS、WISH POOL / ADMIN）",
			"[無障礙] wish-zh、admin-pending-dark-zh 兩者：『顯示詳情』小字連結點擊範圍小，深色模式淺藍主按鈕的對比需確認",
			"[狀態與回饋] admin-loading-zh desktop：載入中按鈕與分頁只是轉淡，沒有說明不可操作的原因"
		]
	},
	"C": {
		"scores": {
			"資訊層級": 8.5,
			"字體排印": 8.5,
			"色彩": 8,
			"間距與版面": 7,
			"一致性": 8.5,
			"資訊密度": 8,
			"導覽": 7.5,
			"狀態與回饋": 6,
			"響應式": 7,
			"文案": 8.5,
			"無障礙": 6.5,
			"動畫與轉場": 6
		},
		"issues": [
			"[響應式] canny-roadmap mobile：浮動客服按鈕蓋住清單標題文字",
			"[響應式] linear-home、linear-changelog mobile：logo 列、功能卡片與分類分頁在右緣被裁切，沒有捲動提示",
			"[間距與版面] raycast-home desktop：主視覺下方約 350px 純黑空白，像載入失敗",
			"[無障礙] linear-home、raycast-blog 兩者：深底上大量極小淡灰字與等寬日期，對比不足",
			"[間距與版面] canny-roadmap 兩者：狀態欄固定高度，桌面截斷內容、手機留下大片空白"
		]
	}
}
```
