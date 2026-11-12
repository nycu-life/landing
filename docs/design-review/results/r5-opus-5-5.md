# r5 blind review: Claude Opus 5.5 (effort high)

- Date: 2026-11-13
- Brief: `brief.md`, SHA-256 `38706a333a66ce90e7a2f1d36c2cfba51ce2651580ebe6fd7657560245416fd4` (unchanged)
- Reviewer: claude-proxy `claude-opus-5-5`, effort high, fresh thread, no other context
- Mapping (revealed after the review): **A = reference**, **B = new** (round 5), **C = baseline** (`main` at `d189336`, re-shot for this round with the pointer-parking capture tool; per-image sizes within ±15 % of the earlier baseline)

| Set           | Mean of 12 scores |
| ------------- | ----------------: |
| C (baseline)  |              5.96 |
| B (new)       |              7.71 |
| A (reference) |              7.96 |

Raw reviewer output below, unedited except that the final JSON block is shown on one line.

---

## 組 A

一句話總評：這組是成熟的產品官網與更新日誌，字體、層級與深色視覺都很精緻。但截圖只有列表和首頁，幾乎看不到狀態回饋，部分灰字對比偏低。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                     |
| ---------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 8.5  | linear-home desktop：首屏是大標題、一句副標和主要按鈕，下方緊接產品介面截圖，主次分明。linear-changelog desktop：每則更新先看到日期與標題，再看到配圖與內文。         |
| 字體排印   | 9    | linear-changelog desktop／mobile：標題、內文與日期的字級差距清楚，行長控制在易讀範圍。raycast-blog desktop：卡片標題字重一致，沒有異常斷行。                          |
| 色彩       | 8.5  | linear-home、raycast-home 兩種尺寸都是深色底配單一強調色，品牌感強烈。canny-roadmap desktop 的狀態欄用不同顏色區分。整體顏色有系統，但除了 Canny 都只有深色一種外觀。 |
| 間距與版面 | 8.5  | raycast-blog desktop：卡片格線整齊、留白節奏穩定。canny-roadmap desktop：三欄看板在 1440 寬下兩側留白過多，內容集中在中間。                                           |
| 一致性     | 8    | 同一品牌的 linear-home 與 linear-changelog 圓角、按鈕和深色底一致。raycast-home 與 raycast-blog 共用頁首與卡片語彙。                                                  |
| 資訊密度   | 8    | linear-changelog desktop 一屏約一則完整更新，偏疏但合理。canny-roadmap desktop 卡片只有標題與票數，密度適中。raycast-home mobile 大量裝飾圖拉長頁面。                 |
| 導覽       | 8    | 各頁頂部導覽固定且精簡。linear-home mobile 收合為選單圖示。canny-roadmap 用欄位標示狀態，目前位置清楚。截圖中沒有看到上一篇／下一篇。                                 |
| 狀態與回饋 | 6.5  | 只有正常資料狀態，沒有載入、空、錯誤畫面。canny-roadmap 的票數與狀態標籤是唯一可見的回饋，證據不足，給保守分數。                                                      |
| 響應式     | 8.5  | linear-changelog mobile、raycast-blog mobile 都改為單欄，沒有橫向溢出。canny-roadmap mobile 的三欄改為上下堆疊，可用但頁面很長。                                      |
| 文案       | 8.5  | linear-changelog 的標題精準、動詞開頭。raycast-blog 標題清楚。沒有看到內部術語外露。                                                                                  |
| 無障礙     | 7    | linear-home、raycast-home 兩種尺寸都有大量深灰底上的中灰小字（次要說明、頁尾），對比偏低。canny-roadmap 的狀態除了顏色也有文字標籤。                                  |
| 動畫與轉場 | 6.5  | raycast-home 有發光與漸層等可見動態暗示，但截圖中沒有骨架、展開或按鈕狀態等線索，給保守分數。                                                                         |

要保留的優點：

- linear-changelog：日期、標題、配圖、內文的固定閱讀順序很清楚。
- raycast-blog：卡片格線一致，標題長度與圖片比例統一。
- linear-home：首屏一句話說清產品，並緊接真實介面截圖。
- canny-roadmap：用欄位、標籤和票數同時表達狀態，不只靠顏色。

最重要的五個問題（由嚴重到輕微）：

1. [無障礙] [linear-home、raycast-home] [兩者] 深色底上大量次要文字用中灰色、字級偏小 —— 低視力或在戶外看手機的人難以閱讀 —— 次要文字提高到至少 4.5:1 的對比。
2. [狀態與回饋] [全部] [兩者] 截圖中沒有任何載入、空資料、錯誤狀態 —— 無法確認失敗時有沒有說明與下一步 —— 補上對應的狀態畫面。
3. [響應式] [canny-roadmap] [mobile] 三欄看板直接上下堆疊，要捲很長才看到「完成」欄 —— 手機上難以比較各狀態 —— 改用分頁籤或可橫向切換的欄位。
4. [間距與版面] [canny-roadmap] [desktop] 1440 寬下看板集中在中間，兩側留白大、卡片資訊少 —— 寬螢幕空間利用率低 —— 加寬欄位，或在卡片放入摘要與分類。
5. [資訊密度] [raycast-home] [mobile] 裝飾圖與大段留白使頁面極長，主要內容被稀釋 —— 手機使用者要捲很久才看到重點 —— 手機版縮減或延後載入裝飾區塊。

## 組 B

一句話總評：品牌語彙（扭蛋機、手繪框、貼紙按鈕）在 Ghost 頁面、許願池與管理端都用得一致。載入、空資料、錯誤、成功的狀態幾乎都有圖示、說明和下一步。剩下的是卡片排列、按鈕取捨與小字對比等細節。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                   |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 8    | wish-zh desktop：麵包屑「NYCU LIFE / WISH POOL」、大標題「一起改造 NYCU 的 LIFE」、表單、「大家正在敲碗」的順序清楚。not-found-zh desktop：404 標記、大標題、說明，再接「回首頁」主按鈕與兩個次要連結，主次分明。                                                                                                   |
| 字體排印   | 7.5  | 中文標題粗黑、層級清楚（admin-pending-zh desktop 的「許願池管理」）。但卡片的「9 小時前」「9 人有共鳴」與表單下方的匿名說明（wish-zh desktop）字級約 12–13px，偏小。                                                                                                                                                |
| 色彩       | 8    | 主色藍貫穿按鈕、標籤與貼紙按鈕。語意色有系統：wish-form-sent-zh 用綠底加勾選橫幅，wish-form-error-zh 用紅色粗體，admin-error-zh 用紅色虛線框加驚嘆號。admin-pending-dark-zh、news-dark-zh 的深色外觀成立。                                                                                                          |
| 間距與版面 | 7.5  | admin-pending-zh desktop 對齊整齊。但 wish-zh desktop 的三欄卡片高度不一（「博愛校區…」卡比左右兩張高），底部參差，第三欄最後留下大片空白。                                                                                                                                                                         |
| 一致性     | 8    | 扭蛋機插圖在 not-found-zh、ghost-down-zh、devlog-empty-zh、news-empty-zh、wish-empty-zh 重複出現。虛線圓角框統一用於空、錯誤、404。導覽在每頁都是「關於我們／產品／FAQ／加入我們／開發日誌／最新消息」。                                                                                                            |
| 資訊密度   | 7    | news-dark-zh desktop 三欄卡片，一屏約 6 則，適中。但 wish-zh mobile 的大標題加表單占了前約 770 CSS px，第一張願望卡要捲過一屏多才出現。                                                                                                                                                                             |
| 導覽       | 8    | news-post-zh mobile 底部用帶「← 上一篇／下一篇 →」標籤的卡片。admin-signed-out-zh 有「← 返回公開許願池」。ghost-down-zh 保留許願池入口。手機頁首有醒目的許願池按鈕和選單鍵。                                                                                                                                        |
| 狀態與回饋 | 8.5  | 狀態齊全：wish-loading-zh 是三張骨架卡；wish-error-zh 有「暫時連不上許願池」、原因說明與「重新載入」；wish-empty-zh 有插圖和「寫下第一個願望」；wish-supported-zh mobile 按過的 +1 改為填色、人數 +1；admin-empty-zh mobile 顯示勾選圖示與「這裡目前沒有項目」；products-loading-zh mobile 是無圖純文字的穩定版面。 |
| 響應式     | 8    | admin-reply-zh mobile 的操作改為兩欄加整列「下架」，沒有溢出。wish-zh mobile 的分頁籤滿寬。news-loading-zh mobile 圖片位置用灰色占位，版面不跳動。                                                                                                                                                                  |
| 文案       | 8    | 用詞自然有溫度：「這一池還很安靜」「頁面暫時打不開」「許願池不受影響，仍然可以許願」，錯誤訊息都說明了原因與下一步。缺點是公開頁尾露出「原始碼 · 編輯登入」（news-empty-zh mobile、not-found-dark-zh mobile）。                                                                                                     |
| 無障礙     | 7    | 主按鈕對比足夠，手機上按鈕高度約 44px 以上。但淺色外觀下，頁首「許願池」貼紙是淺紫底配藍字（wish-zh desktop），對比偏弱，卡片的灰色中繼資訊也偏淡。                                                                                                                                                                 |
| 動畫與轉場 | 7    | 看得到骨架（wish-loading-zh、news-loading-zh）、「顯示詳情／收起詳情 ⌃」的展開收合（wish-card-open-zh mobile）、+1 的按下狀態（wish-supported-zh），以及手寫框與手機選單開啟狀態。截圖中沒有實際過場可評。                                                                                                          |

要保留的優點：

- 錯誤與 503 頁（ghost-down-zh）：保留品牌頁首、說明許願池不受影響，並同時給「重新整理」與「前往許願池」。
- 許願池狀態全套：骨架卡、帶重新載入的錯誤框、帶 CTA 的空狀態、綠色成功橫幅、+1 的填色狀態。
- 空集合（devlog-empty-zh、news-empty-zh mobile）：扭蛋機插圖、標題、說明、單一 CTA 的固定結構。
- 文章頁上一篇／下一篇（news-post-zh mobile）做成帶方向標籤的卡片，點擊範圍大。
- 管理端（admin-pending-zh）把 ID 縮成短代碼膠囊，「下架」用紅色調區分破壞性操作。
- 導覽列在所有頁面一致，最新消息與開發日誌都能直接進入。

最重要的五個問題（由嚴重到輕微）：

1. [間距與版面] [wish-zh] [desktop] 三欄願望卡高度不一，每列底部參差，最後一列右側留下大塊空白 —— 看起來像排版壞掉，也讓視線難以逐列掃讀 —— 改為真正的瀑布流（逐欄緊接），或統一每列高度並把 +1 列固定在卡片底部。
2. [狀態與回饋] [admin-pending-zh] [兩者] 待審核的每一筆都並排「撰寫回覆／標記為已實現／下架／核准公開」四個同尺寸按鈕，還沒公開就能標記已實現 —— 管理者容易誤按，流程語意也不清楚 —— 待審核只保留「核准公開」主按鈕和「下架」，其餘收進更多選單，或公開後才出現。
3. [資訊密度] [wish-zh] [mobile] 標題與表單占了第一屏以上，進來的人要捲動才看得到別人的願望 —— 手機是主要流量，看別人的願望並 +1 是核心互動 —— 手機上縮小標題、把表單收成一個「許願」按鈕或底部抽屜，讓第一屏露出至少一張願望卡。
4. [無障礙] [wish-zh] [desktop] 卡片的「9 小時前」「x 人有共鳴」、表單的匿名說明、頁首淺紫底藍字「許願池」貼紙，字小且對比偏低 —— 匿名與隱私提醒是重要資訊，卻最不容易被讀到 —— 中繼字級提高到 13–14px、加深灰階，匿名說明至少用一般內文字級。
5. [文案] [news-empty-zh、not-found-dark-zh] [mobile] 公開頁尾直接露出「原始碼 · 編輯登入」 —— 一般同學不需要編輯登入，像內部入口外露 —— 移到不顯眼的位置，或改為只在管理端出現。

## 組 C

一句話總評：主視覺與許願池卡片沿用同一套品牌語彙，但系統狀態和全站一致性有多處破洞：503 是裸文字、錯誤被顯示成空狀態、導覽名稱各頁不同、空集合沒有說明，還有內部標籤與英文字串外露。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                          |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 6.5  | wish-zh desktop 的標題與表單結構清楚。但 not-found-zh desktop 只有左上角「404 / Page not found」和「NYCU LIFE →」按鈕，下方整片空白。devlog-empty-zh mobile 在標題後直接接「在那之前，可以先到『認識我們』…」，前一句不見了。                                                                              |
| 字體排印   | 6.5  | products-en mobile、products-loading-zh mobile 的產品名「NYCU BUS」變成細字重，條列沒有項目符號，縮排懸空。news-dark-zh desktop 的分類標籤是貼在摘要後的純文字（「News」「合作」）。news-loading-zh mobile 的摘要沒有截斷。                                                                                |
| 色彩       | 7    | 主色藍與深色外觀大致成立（comics-dark-zh、news-dark-zh desktop）。但 wish-form-sent-zh 的成功訊息只是一行小綠字，wish-form-error-zh 的錯誤是一行細紅字，語意色存在感弱。管理端「下架」是灰色（admin-pending-zh），沒有破壞性提示。                                                                         |
| 間距與版面 | 6.5  | news-dark-zh desktop 改成兩欄，卡片高度差很大，「11 月 16 日凌晨系統維護」是一張沒有圖的矮卡，與左欄錯位。wish-zh desktop 用等高列，「希望校車能顯示即時擁擠度」卡中間空出約 150px。                                                                                                                       |
| 一致性     | 5    | 導覽名稱不一致：wish-zh、admin-signed-out-zh 是「認識我們／常見問題／夥伴徵才」，not-found-zh、news-dark-zh、comics-empty-dark-zh 是「關於我們／FAQ／加入我們」。comics-dark-zh desktop 的眉標是「NYCU LIFE / COMICS」，標題卻寫「開發日誌」。404 與 503 的視覺和其他頁完全不同。                          |
| 資訊密度   | 6.5  | news-dark-zh desktop 兩欄大圖，一屏只看到 2–3 則。news-empty-zh mobile 在標題與頁尾之間沒有任何內容。admin-pending-zh 的 ID 是長串 UUID，占空間又難以辨識。                                                                                                                                                |
| 導覽       | 6    | 所有頁面的導覽列都沒有「最新消息」（例：wish-zh desktop 只有五項）。news-post-zh mobile 的上一篇／下一篇只是兩行純文字連結，沒有方向標籤。devlog-empty-zh 出現英文「Page 1 of 1」分頁。                                                                                                                    |
| 狀態與回饋 | 4.5  | ghost-down-zh desktop 是白底等寬英文單行「Content is temporarily unavailable. Please try again shortly.」，沒有品牌、導覽和行動。wish-error-zh desktop 讀取失敗時，清單卻顯示空狀態「這一池還很安靜／成為第一個許願的人吧」。wish-empty-zh 沒有插圖和 CTA。wish-loading-zh 只有一行「正在聽大家的願望…」。 |
| 響應式     | 6.5  | 沒有橫向溢出，admin-reply-zh mobile 的按鈕也有重排。但 news-empty-zh mobile 整個內容區消失，news-loading-zh mobile 的圖片占位是純白（和卡片同色，看起來像壞圖），products 手機版條列失去符號。                                                                                                             |
| 文案       | 5    | 內部或英文字串外露：wish-zh 麵包屑「WISH POOL / PRODUCT 06」；繁中頁面的 404 是「Page not found」；頁尾「Crafted with care by the NYCU LIFE 內容管理」中英夾雜；admin-signed-out-zh 寫「任何成功通過 NYCU LIFE OAuth 的帳號都可以進入」「OAuth token」。                                                   |
| 無障礙     | 6    | wish-zh desktop 的 +1 按鈕比另一版小。管理端 ID 是 10px 左右的淺灰等寬字（admin-published-en）。表單錯誤只靠細紅字，沒有圖示或欄位框標示（wish-form-error-zh）。                                                                                                                                           |
| 動畫與轉場 | 5.5  | 可見線索少：wish-loading-zh 沒有骨架，news-loading-zh mobile 圖片位置是白塊。admin-loading-zh 有轉圈指示，還有「顯示詳情」展開。                                                                                                                                                                           |

要保留的優點：

- 許願池表單的手繪框、「投下願望」貼紙按鈕與分類選單（wish-zh desktop），品牌感完整。
- 許願池卡片的分類膠囊、膠帶裝飾和團隊回覆框（wish-zh、wish-fulfilled-dark-en）。
- 已實現卡片右上的綠色「✓ 已實現」標章與實現日期（wish-fulfilled-dark-en desktop）。
- 管理端登入前的說明卡與「返回公開許願池」連結（admin-signed-out-zh）。
- 管理端載入時的轉圈與「正在確認登入狀態…」說明（admin-loading-zh）。

最重要的五個問題（由嚴重到輕微）：

1. [狀態與回饋] [ghost-down-zh] [兩者] 內容服務無法連線時，只剩白底等寬字體的英文單行，沒有品牌、導覽、重新整理或前往許願池 —— 繁中使用者會以為網站壞了，也不知道許願池其實還能用 —— 改成帶品牌頁首的中文 503 頁，提供「重新整理」與「前往許願池」。
2. [狀態與回饋] [wish-error-zh] [desktop] 許願池讀取失敗時，清單顯示「這一池還很安靜，成為第一個許願的人吧」，錯誤只是表單下方一行小紅字 —— 錯把故障說成沒有資料，使用者會誤以為大家沒許願或重複送出 —— 清單區顯示明確的錯誤狀態、原因與「重新載入」，並與空狀態分開。
3. [一致性] [wish-zh、not-found-zh、comics-dark-zh] [兩者] 導覽在不同頁面互換「認識我們／關於我們」「常見問題／FAQ」「夥伴徵才／加入我們」，導覽列沒有「最新消息」，漫畫頁標題寫成「開發日誌」 —— 使用者無法建立穩定的位置感，也找不到最新消息 —— 統一一份導覽字串，補上最新消息，並修正漫畫頁標題。
4. [狀態與回饋] [devlog-empty-zh、comics-empty-dark-zh、news-empty-zh] [兩者] 空集合沒有空狀態元件：開發日誌只剩一句沒頭沒尾的「在那之前…」和英文「Page 1 of 1」，最新消息手機版在標題與頁尾之間完全空白 —— 看起來像載入失敗或版面壞掉 —— 每個集合都用一致的空狀態卡（插圖、說明、單一 CTA），沒有內容時隱藏分頁。
5. [文案] [wish-zh、not-found-zh、admin-pending-zh、頁尾] [兩者] 內部或英文字串外露：「WISH POOL / PRODUCT 06」、繁中頁的「Page not found」、「Crafted with care by the NYCU LIFE 內容管理」、管理端的長 UUID 與「OAuth token」 —— 降低完成度與信任感，還讓同學看到系統術語 —— 全面改用在地化字串，ID 縮成短代碼，登入說明改為一般用語。

```json
{
	"A": {
		"scores": {
			"資訊層級": 8.5,
			"字體排印": 9,
			"色彩": 8.5,
			"間距與版面": 8.5,
			"一致性": 8,
			"資訊密度": 8,
			"導覽": 8,
			"狀態與回饋": 6.5,
			"響應式": 8.5,
			"文案": 8.5,
			"無障礙": 7,
			"動畫與轉場": 6.5
		},
		"issues": [
			"[無障礙] linear-home／raycast-home 兩者：深色底上大量中灰小字，對比偏低",
			"[狀態與回饋] 全部：截圖中沒有載入、空、錯誤狀態，無法確認失敗時的說明與下一步",
			"[響應式] canny-roadmap mobile：三欄看板直接堆疊，頁面過長，難以比較狀態",
			"[間距與版面] canny-roadmap desktop：1440 寬下兩側留白大、卡片資訊少",
			"[資訊密度] raycast-home mobile：裝飾圖與留白使頁面極長，重點被稀釋"
		]
	},
	"B": {
		"scores": {
			"資訊層級": 8,
			"字體排印": 7.5,
			"色彩": 8,
			"間距與版面": 7.5,
			"一致性": 8,
			"資訊密度": 7,
			"導覽": 8,
			"狀態與回饋": 8.5,
			"響應式": 8,
			"文案": 8,
			"無障礙": 7,
			"動畫與轉場": 7
		},
		"issues": [
			"[間距與版面] wish-zh desktop：三欄願望卡高度不一、底部參差，最後一列右側留下大塊空白",
			"[狀態與回饋] admin-pending-zh 兩者：待審核每筆並排四個同尺寸按鈕，未公開就能標記已實現，容易誤按",
			"[資訊密度] wish-zh mobile：標題與表單占滿第一屏，要捲動才看到第一張願望卡",
			"[無障礙] wish-zh desktop：卡片中繼資訊、匿名說明、淺紫底藍字的許願池貼紙字小且對比偏低",
			"[文案] news-empty-zh／not-found-dark-zh mobile：公開頁尾露出「原始碼 · 編輯登入」內部入口"
		]
	},
	"C": {
		"scores": {
			"資訊層級": 6.5,
			"字體排印": 6.5,
			"色彩": 7,
			"間距與版面": 6.5,
			"一致性": 5,
			"資訊密度": 6.5,
			"導覽": 6,
			"狀態與回饋": 4.5,
			"響應式": 6.5,
			"文案": 5,
			"無障礙": 6,
			"動畫與轉場": 5.5
		},
		"issues": [
			"[狀態與回饋] ghost-down-zh 兩者：503 只剩白底等寬英文單行，沒有品牌、導覽與行動",
			"[狀態與回饋] wish-error-zh desktop：讀取失敗時清單顯示「這一池還很安靜」空狀態，錯誤只有一行小紅字",
			"[一致性] wish-zh／not-found-zh／comics-dark-zh：各頁導覽名稱不同、缺最新消息，漫畫頁標題寫成「開發日誌」",
			"[狀態與回饋] devlog-empty-zh／comics-empty-dark-zh／news-empty-zh：空集合沒有空狀態卡，只剩殘句、英文 Page 1 of 1 或整片空白",
			"[文案] wish-zh／not-found-zh／admin-pending-zh／頁尾：WISH POOL / PRODUCT 06、Page not found、Crafted with care…內容管理、長 UUID 與 OAuth token 外露"
		]
	}
}
```
