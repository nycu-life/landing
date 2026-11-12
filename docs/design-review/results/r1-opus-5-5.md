# r1 blind review: Claude Opus 5.5 (effort high)

- Date: 2026-11-13
- Brief: `brief.md`, SHA-256 `38706a333a66ce90e7a2f1d36c2cfba51ce2651580ebe6fd7657560245416fd4`
- Reviewer: claude-proxy `claude-opus-5-5`, effort high, fresh thread, no other context
- Mapping (revealed after the review): **A = baseline** (`main` at `d189336`), **B = reference**, **C = new** (round 1)
- Sets: 64 states (128 images) per site set; 5 reference pages × 2 sizes

| Set           | Mean of 12 scores |
| ------------- | ----------------: |
| A (baseline)  |              5.46 |
| C (new)       |              6.75 |
| B (reference) |              8.33 |

Raw reviewer output below, unedited except that the final JSON block is shown on one line.

---

## 組 A

一句話總評：品牌識別強烈，許願池的手繪貼紙語彙很有特色。不過首頁「關於」區塊有元件互相覆蓋。錯誤、空資料與 404 狀態幾乎沒有設計，甚至出現英文的系統訊息與錯誤文案，整體還停在「能動但未完成」。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 資訊層級   | 6    | home-zh desktop：扭蛋機首屏清楚傳達品牌，但「ABOUT US／升級你的 NYCU 的 LIFE」標題與內文被右側藍色大卡片蓋住，只露出「升級」「NYCU」與半行字。wish-zh desktop：標題、表單、願望卡片的主次分明。news-post-zh desktop：日期、標題、摘要、標籤的順序清楚。                                                                                                                                                            |
| 字體排印   | 6.5  | devlog-post-zh desktop：內文行長與行高舒適，中英混排（Liquid Glass、token）自然。devlog-post-nocover-zh mobile：標籤「設計 / 無障礙」被拆成三行（設計、/、無障礙）。wish-zh desktop：卡片內的時間與「x 人有共鳴」字級極小。                                                                                                                                                                                        |
| 色彩       | 6.5  | 藍色主色在 TopBar、許願池貼紙、按鈕間一致。wish-dark-zh desktop：深色外觀下，表單與願望卡仍是純白底，像亮色元件直接貼在深色頁面上。not-found-dark-zh mobile：淺藍按鈕配白字「NYCU LIFE →」，對比偏低。成功（綠）與錯誤（紅）語意色只用在小字上。                                                                                                                                                                   |
| 間距與版面 | 5    | home-zh desktop：關於區塊卡片與文字重疊；產品章節的手機截圖被堆到文字正下方，1440 寬右半部整片空白。news-zh desktop：沒有封面的文章卡片保留整塊白色空圖區。devlog-zh desktop：「無障礙稽核紀錄」卡片被拉長到與鄰卡同高，下半部全空。                                                                                                                                                                               |
| 一致性     | 5    | 導覽文字在 Ghost 頁（關於我們／產品／FAQ／加入我們）與許願池頁（認識我們／產品／常見問題／夥伴徵才）不同（devlog-zh vs wish-zh desktop）。許願池是手繪貼紙卡，最新消息與日誌卻是一般圓角卡。404 與 503 頁和其他頁完全不同調。                                                                                                                                                                                      |
| 資訊密度   | 6    | admin-pending-zh desktop：每列一則，動作按鈕齊全，密度合理。wish-zh desktop：三欄卡片一屏可看 6–8 則。news-zh desktop：空白封面讓一屏只剩約 4 則。                                                                                                                                                                                                                                                                 |
| 導覽       | 6    | menu-open-zh mobile：選單列出六個入口，語言與主題切換也放在裡面，點擊區大。TopBar 沒有標示目前所在頁（devlog-zh desktop 的「開發日誌」沒有高亮）。「最新消息」不在主導覽裡。devlog-post-zh desktop：上一篇／下一篇連結的對齊不在左右兩端，「期中考週 →」浮在中間。                                                                                                                                                 |
| 狀態與回饋 | 4    | ghost-down-zh desktop：整頁只剩左上角一行等寬英文「Content is temporarily unavailable…」，沒有頁首和下一步。wish-error-zh desktop：列表區顯示「這一池還很安靜／成為第一個許願的人吧」，把錯誤當成空資料。admin-error-zh desktop：紅色錯誤橫幅下方是綠勾「這裡目前沒有項目」，前後矛盾。wish-loading-zh desktop 只有一行「正在聽大家的願望…」。正面例子：wish-form-error-zh mobile 有紅字提示「請用至少 4 個字…」。 |
| 響應式     | 6    | 手機版排版大致合理：wish-zh mobile 的表單改成上下排列，admin-reply-zh mobile 的按鈕改成兩欄。桌面首頁產品章節沒有善用寬度（home-zh desktop）。devlog-post-nocover-zh mobile 的標籤斷行異常。手機截圖中沒有看到橫向溢出。                                                                                                                                                                                           |
| 文案       | 4.5  | not-found-zh desktop：繁中頁面顯示英文「Page not found」，按鈕只寫「NYCU LIFE →」。comics-zh desktop 與 comics-empty-zh mobile：漫畫頁的大標寫「開發日誌」，副標也是日誌的描述。devlog-empty-zh desktop：空狀態文案以「在那之前，…」開頭，缺少前一句，下方還有英文「Page 1 of 1」。頁尾的「Crafted with care by the NYCU LIFE 內容管理」中英混雜，並外露「內容管理」字樣。                                         |
| 無障礙     | 5.5  | wish-zh desktop：卡片 meta 與「公開匿名顯示」說明字級很小、顏色偏淡。not-found-dark-zh mobile：按鈕對比不足。已實現狀態用文字加勾號，不只靠顏色（wish-fulfilled-dark-en mobile），這是優點。截圖中看不到焦點樣式。                                                                                                                                                                                                 |
| 動畫與轉場 | 4.5  | 線索很少：wish-loading 只有文字，沒有骨架；admin-loading-zh desktop 有圓形 spinner；wish-card-open-zh mobile 有「收起詳情 ⌃」的展開收合指示；wish-supported-zh desktop 的 +1 按鈕會改成實心淺紫，回饋偏弱。分數保守。                                                                                                                                                                                              |

要保留的優點：

- 首頁扭蛋機首屏插畫（home-zh desktop）：品牌辨識度高，膠囊上的「選不上的通識課／消失的公車」直接點出用途。
- 許願池的手繪框表單、紙膠帶卡片與「投下願望 ✸」貼紙按鈕（wish-zh desktop/mobile），語彙獨特又一致。
- 已實現願望卡片（wish-fulfilled-dark-en mobile）：綠色「✓ Fulfilled」徽章、團隊回覆框、實現日期，資訊完整。
- 管理後台的列表與動作按鈕分層（admin-pending-zh desktop）：撰寫回覆、標記為已實現、下架、核准公開由弱到強排列。
- 文章頁的閱讀版面（devlog-post-zh desktop）：行長、標題層級、引用與程式碼區塊都清楚。

最重要的五個問題（由嚴重到輕微）：

1. [狀態與回饋] [ghost-down-zh] [兩者] 內容服務失效時只顯示一行英文等寬純文字，沒有品牌、導覽或下一步 —— 使用者會以為網站壞了而離開，也不知道許願池仍可使用 —— 套用站內頁首，用中文說明狀況，並提供「重新整理」與「前往許願池」。
2. [狀態與回饋] [wish-error-zh、admin-error-zh] [兩者] 載入失敗時列表顯示「這一池還很安靜」或綠勾「這裡目前沒有項目」 —— 把錯誤偽裝成空資料，會誤導使用者與管理員 —— 列表區改為錯誤狀態（紅色圖示、原因、重新載入按鈕），不要與空狀態共用。
3. [間距與版面] [home-zh] [desktop] 關於章節的藍色卡片蓋住標題與內文，產品章節的手機截圖堆在文字下方，右半部空白 —— 這是首頁第一個捲動段落，重疊的視覺像是壞掉 —— 改為左右兩欄的固定格線，確保文字層不被覆蓋。
4. [文案] [comics-zh、comics-empty-zh、not-found-zh、devlog-empty-zh] [兩者] 漫畫頁沿用「開發日誌」的標題與描述；404 頁用英文「Page not found」；空狀態文案缺前句，又夾著「Page 1 of 1」 —— 頁面身分錯誤、語言不一致 —— 每個 Ghost 集合各自給標題、描述與空狀態文案，404 改成中文並附上去處。
5. [一致性] [wish-zh vs devlog-zh、wish-dark-zh] [兩者] 主導覽在許願池與 Ghost 頁用不同詞（認識我們／關於我們、常見問題／FAQ、夥伴徵才／加入我們）；深色模式下許願池卡片與表單仍是白底 —— 使用者會懷疑是否進了另一個網站 —— 統一導覽字串，並讓許願池元件吃深色 token。

## 組 B

一句話總評：參考組的版面、字體與資訊密度都很成熟，深色系產品官網與部落格、回饋看板各司其職。少數地方有內容裁切與低對比的小字。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                   |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 9    | linear-home desktop：大標、副標、產品截圖、客戶標誌、三欄特色，順序清楚。canny-roadmap desktop：Boards（含數量）→ Roadmap 三欄狀態，一眼看懂。                      |
| 字體排印   | 9    | linear-home desktop：大標緊湊，第二句用灰色做層次。raycast-blog mobile：標題字重與行高穩定，日期用等寬大寫，和內文區隔清楚。                                        |
| 色彩       | 8.5  | canny-roadmap desktop：狀態用不同顏色的圓點（灰、藍、紫）標示，並附文字。Linear 與 Raycast 都以深色為主，品牌色只做點綴。linear-home 有部分灰字對比偏低。           |
| 間距與版面 | 9    | linear-home desktop：12 欄對齊，三欄 FIG 區塊間距一致。canny-roadmap desktop：三欄等寬、內距統一。                                                                  |
| 一致性     | 9    | raycast-blog mobile：所有卡片的圓角、內距、日期位置一致。Linear 首頁與更新日誌共用同一套深色樣式。                                                                  |
| 資訊密度   | 8.5  | canny-roadmap desktop：一屏可見約 11 則需求與票數。raycast-blog mobile：每張卡含標題、摘要、作者、日期，不冗長。                                                    |
| 導覽       | 8.5  | canny-roadmap desktop：Roadmap 分頁有底線與藍色標示目前位置，旁邊附搜尋。raycast-blog mobile：分類標籤列「All Posts／News／Company／Craft」，並以實心標示目前分類。 |
| 狀態與回饋 | 7    | 截圖幾乎沒有載入、錯誤或表單狀態可評。canny-roadmap 的票數按鈕有向上箭頭，但看不到投票後的狀態。保守評分。                                                          |
| 響應式     | 8.5  | raycast-blog mobile：改成單欄卡片，標籤列可橫向捲動。不過置頂卡片的封面圖文字「Ask anything, @ t」被裁在卡片右緣。                                                  |
| 文案       | 9    | linear-home desktop 文案精準一致；canny-roadmap 的分類標籤（FEATURE REQUESTS／INTEGRATIONS）清楚。                                                                  |
| 無障礙     | 7.5  | linear-home desktop：「FIG 0.1」標籤與客戶列說明「POWERING THE COMPANIES…」是極淡的灰色小字。canny 的票數按鈕約 36 px 見方，可接受。                                |
| 動畫與轉場 | 7    | 只有靜態截圖：canny 右下角有客服浮動按鈕；Raycast 首頁有光暈視覺。看不到骨架或展開收合，保守評分。                                                                  |

要保留的優點：

- Canny 的 Roadmap 三欄狀態加票數按鈕（canny-roadmap desktop），可借鏡到許願池的「審核中／已實現」呈現。
- Raycast 部落格的置頂文章加分類標籤列（raycast-blog mobile），適合最新消息與開發日誌。
- Linear 首頁的大標搭配實際產品截圖（linear-home desktop），一屏說清楚產品是什麼。
- 日期用等寬或大寫小字與標題區隔（raycast-blog mobile）。

最重要的五個問題（由嚴重到輕微）：

1. [響應式] [raycast-blog] [mobile] 置頂卡片的封面圖文字「Ask anything, @ t」被卡片右緣裁切 —— 看起來像排版失誤 —— 封面改用安全區，或依容器縮放。
2. [間距與版面] [canny-roadmap] [desktop] Under Review 欄內容被欄高截斷，「Edit/Delete Merged Comment」只露出一半 —— 使用者不易察覺欄內可以捲動 —— 加上漸層遮罩或「查看更多」。
3. [無障礙] [linear-home] [desktop] FIG 標籤、客戶列說明與大段灰色副標對比偏低 —— 小字在深色底上不易閱讀 —— 提高次要文字的亮度。
4. [狀態與回饋] [canny-roadmap] [兩者] 票數按鈕看不出已投或未投的差異 —— 投票回饋不明確 —— 已投狀態加實心與色彩變化。
5. [導覽] [linear-home] [desktop] 頂部導覽字級小、顏色淡，主行動只有一顆小小的「Sign up」 —— 首屏缺少明確的主 CTA —— 在大標下方加一個主按鈕。

## 組 C

一句話總評：版面與狀態設計明顯比較完整，首頁章節排版正確，錯誤、空資料、404 與 503 都有品牌化的卡片與下一步。最大的缺陷是開發日誌與漫畫的封面圖文字變成無法辨識的小方塊。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                       |
| ---------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 7.5  | home-zh desktop：扭蛋機首屏之後，「ABOUT US／升級你的 NYCU 的 LIFE」與右側藍色媒體卡並排；產品章節左文右圖，手機與手部插畫完整；FAQ 筆記本緊接在後。comics-zh desktop：標題正確為「小貢的校園日常」，並說明「點選任一集開始閱讀」。                                                     |
| 字體排印   | 7    | devlog-post-zh desktop 的閱讀版面良好。devlog-zh desktop 與 comics-zh desktop：封面上的標題變成極小的豆腐方塊（例如 EP 卡中央只剩「□□□□」兩行），排印崩壞。devlog-post-nocover 的標籤斷成「設計／/／無障礙」三行，與 A 相同。                                                           |
| 色彩       | 7    | 主色一致。ghost-down-zh 與 not-found-zh：藍色主按鈕配文字連結，層級分明。not-found-dark-zh mobile：深色下按鈕改成淺藍底深色字，對比正確。wish-dark-zh desktop：許願池卡片在深色下仍是白底，與 A 相同。                                                                                  |
| 間距與版面 | 7    | home-zh desktop：兩欄格線正確，沒有重疊。404、503 與各空狀態都是置中的虛線卡片，留白適當。news-zh 無封面卡片的大塊空白與 devlog-zh「無障礙稽核紀錄」被拉長的空卡仍在。                                                                                                                  |
| 一致性     | 6.5  | 錯誤與空狀態共用「扭蛋機小圖＋標題＋說明＋主按鈕」模板（devlog-empty、comics-empty、not-found、ghost-down），一致性好。但 Ghost 頁與許願池的導覽用詞仍不同；admin-error 的紅色虛線錯誤卡與許願池錯誤卡樣式略有差異。                                                                    |
| 資訊密度   | 6.5  | 與 A 相近。admin-loading-zh desktop 直接顯示後台外框與載入中的列表區，比單一確認登入卡片多提供脈絡。news-zh desktop 空白封面造成的浪費仍在。                                                                                                                                            |
| 導覽       | 6.5  | not-found-zh desktop 提供回首頁、最新消息、許願池三個去處。ghost-down-zh 提供重新整理與前往許願池。TopBar 依然沒有目前位置的標示，最新消息也不在主導覽。menu-open-zh mobile 與 A 相同。                                                                                                 |
| 狀態與回饋 | 7.5  | wish-loading-zh desktop/mobile：三張骨架卡沿用手繪卡框。wish-error-zh desktop：列表區顯示紅字「暫時連不上許願池」、原因與「重新載入」按鈕。admin-error-zh desktop：錯誤卡帶「!」與重新整理（但橫幅與卡片重複同一句話）。comics-empty mobile：「小貢的第一集還在畫」加「看開發日誌 →」。 |
| 響應式     | 7    | ghost-down-zh mobile：503 卡改為置中直排，按鈕並排可點。admin-pending-dark-zh mobile：動作按鈕改成 2×2 格。桌面首頁產品章節善用寬度。封面文字的豆腐問題在手機上也存在（comics-dark-zh mobile）。                                                                                        |
| 文案       | 6.5  | 404 改為「找不到這個頁面」並說明原因；503 寫明「許願池不受影響，仍然可以許願」，很貼心。devlog-empty 有完整標題「第一篇日誌整理中」。頁尾「Crafted with care by the NYCU LIFE 內容管理」與許願池眉標「WISH POOL / PRODUCT 06」仍外露內部用語。                                          |
| 無障礙     | 6    | 深色 404 按鈕的對比正確；錯誤狀態用「!」圖示加文字，不只靠紅色。wish 卡片 meta 小字偏淡，與 A 相同。封面的豆腐方塊對所有人都不可讀。截圖中看不到焦點樣式。                                                                                                                              |
| 動畫與轉場 | 6    | 有骨架（wish-loading）、行內 spinner（admin-loading「正在讀取許願池…」）、載入中分頁變淡（admin-loading 的「公開中／已下架」變灰）、展開收合指示。仍無法判斷實際動態，分數保守。                                                                                                        |

要保留的優點：

- 品牌化的 503 頁（ghost-down-zh desktop/mobile）：扭蛋機小圖、「頁面暫時打不開」、說明許願池仍可用、兩個明確動作。
- 404 頁（not-found-zh desktop、not-found-dark-zh mobile）：中文說明，附回首頁、最新消息、許願池三個出口，深色按鈕對比正確。
- 許願池骨架卡（wish-loading-zh desktop/mobile）：保留手繪框與紙膠帶，載入時版面不跳動。
- 首頁關於與產品章節的兩欄排版（home-zh desktop）：手機加手部插畫與左右切換箭頭，符合品牌插畫語彙。
- 空集合狀態（devlog-empty-zh desktop、comics-empty-zh mobile）：有標題、說明與導向其他內容的 CTA。

最重要的五個問題（由嚴重到輕微）：

1. [字體排印] [devlog-zh、devlog-dark-zh、comics-zh、comics-dark-zh] [兩者] 封面圖上的標題與 EP 編號變成幾個極小的方塊字（豆腐字），例如 comics-zh desktop 每張 EP 卡中央只剩兩行「□□□□」 —— 列表最大面積的視覺元素等於壞圖，漫畫也失去集數辨識 —— 確保封面圖在伺服器端能載入中文字型，或改由 HTML 疊字。
2. [一致性] [wish-zh vs devlog-zh、wish-dark-zh] [兩者] 導覽用詞在許願池與 Ghost 頁不同；深色模式下許願池表單與卡片仍為白底 —— 兩個系統看起來像不同網站 —— 統一導覽字串，並讓許願池元件套用深色 token。
3. [間距與版面] [news-zh、devlog-zh] [desktop] 沒有封面的文章保留整塊白色圖片區，或被拉長成大半空白的卡片 —— 浪費版面，也像圖片載入失敗 —— 無封面時改用品牌預設封面，或改成緊湊的純文字卡並取消等高拉伸。
4. [文案] [全站頁尾、wish-zh] [兩者] 頁尾「Crafted with care by the NYCU LIFE 內容管理」中英混雜並外露後台名稱；許願池眉標「WISH POOL / PRODUCT 06」像內部編號 —— 降低完成度 —— 依語系給完整的頁尾署名，眉標改成有意義的麵包屑。
5. [導覽] [devlog-zh、news-zh、devlog-post-nocover-zh] [兩者] TopBar 沒有標示目前頁面，最新消息也不在主導覽；文章頁的標籤在手機上斷成三行，上一篇／下一篇在桌面沒有左右對齊 —— 使用者難以定位與連續閱讀 —— 加上目前頁的樣式，把最新消息納入導覽，標籤改成 chip，上一篇與下一篇各自靠左右對齊。

```json
{
	"A": {
		"scores": {
			"資訊層級": 6,
			"字體排印": 6.5,
			"色彩": 6.5,
			"間距與版面": 5,
			"一致性": 5,
			"資訊密度": 6,
			"導覽": 6,
			"狀態與回饋": 4,
			"響應式": 6,
			"文案": 4.5,
			"無障礙": 5.5,
			"動畫與轉場": 4.5
		},
		"issues": [
			"ghost-down-zh 兩者：內容服務失效時只顯示一行英文等寬純文字，無頁首、無下一步",
			"wish-error-zh / admin-error-zh 兩者：載入錯誤被顯示為空資料（「這一池還很安靜」、綠勾「這裡目前沒有項目」）",
			"home-zh desktop：關於章節藍色卡片蓋住標題與內文；產品章節手機截圖堆在文字下方，右半部空白",
			"comics-zh / comics-empty-zh 標題誤用「開發日誌」；not-found-zh 顯示英文 Page not found；devlog-empty 文案缺前句並夾著 Page 1 of 1",
			"許願池與 Ghost 頁導覽用詞不一致；wish-dark 深色模式下卡片與表單仍是白底"
		]
	},
	"B": {
		"scores": {
			"資訊層級": 9,
			"字體排印": 9,
			"色彩": 8.5,
			"間距與版面": 9,
			"一致性": 9,
			"資訊密度": 8.5,
			"導覽": 8.5,
			"狀態與回饋": 7,
			"響應式": 8.5,
			"文案": 9,
			"無障礙": 7.5,
			"動畫與轉場": 7
		},
		"issues": [
			"raycast-blog mobile：置頂卡片封面文字被右緣裁切",
			"canny-roadmap desktop：Under Review 欄內容被欄高截斷，缺少可捲動提示",
			"linear-home desktop：FIG 標籤與次要灰字對比偏低",
			"canny-roadmap：投票按鈕看不出已投或未投狀態",
			"linear-home desktop：首屏缺少明確主 CTA，導覽字小色淡"
		]
	},
	"C": {
		"scores": {
			"資訊層級": 7.5,
			"字體排印": 7,
			"色彩": 7,
			"間距與版面": 7,
			"一致性": 6.5,
			"資訊密度": 6.5,
			"導覽": 6.5,
			"狀態與回饋": 7.5,
			"響應式": 7,
			"文案": 6.5,
			"無障礙": 6,
			"動畫與轉場": 6
		},
		"issues": [
			"devlog-zh / comics-zh（含深色、手機）：封面標題與 EP 編號變成無法辨識的小方塊字",
			"許願池與 Ghost 頁導覽用詞不一致；wish-dark 深色模式下許願池元件仍是白底",
			"news-zh / devlog-zh desktop：無封面文章保留大塊空白圖區或被拉長成空卡",
			"頁尾「Crafted with care by the NYCU LIFE 內容管理」與「WISH POOL / PRODUCT 06」外露內部用語",
			"TopBar 無目前頁標示、最新消息不在導覽；文章頁標籤在手機斷成三行，上一篇／下一篇未對齊"
		]
	}
}
```
