# r2 blind review: Claude Opus 5.5 (effort high)

- Date: 2026-11-13
- Brief: `brief.md`, SHA-256 `38706a333a66ce90e7a2f1d36c2cfba51ce2651580ebe6fd7657560245416fd4` (unchanged)
- Reviewer: claude-proxy `claude-opus-5-5`, effort high, fresh thread, no other context
- Mapping (revealed after the review): **A = baseline** (`main` at `d189336`), **B = reference**, **C = new** (round 2)

| Set           | Mean of 12 scores |
| ------------- | ----------------: |
| A (baseline)  |              5.33 |
| C (new)       |              7.42 |
| B (reference) |              7.92 |

Raw reviewer output below, unedited except that the final JSON block is shown on one line.

---

## 組 A

一句話總評：品牌插畫與許願池元件很完整，但 Ghost 內容頁的骨架還沒完成。首頁關於章節的文字被卡片蓋住，產品章節缺少手機框；錯誤、空資料與漫畫頁直接露出英文系統字或套錯模板，整體看起來像半成品。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                        |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 5.5  | home-zh desktop：關於章節的標題「升級…NYCU」與內文被右側藍色大卡片蓋住，只剩「ABO」「升級」等殘字；comics-zh desktop：漫畫列表的大標題卻是「開發日誌」，副標也是開發日誌的介紹，使用者看不出自己在哪一頁。                                                                                                                               |
| 字體排印   | 6    | devlog-post-nocover-zh desktop：標籤「設計」「/」「無障礙」各占一行直排，節奏斷裂；news-zh desktop：卡片摘要「…in the meantime if」在句中截斷，沒有省略號；ghost-down-zh desktop：整頁只有一行左上角的等寬英文系統字。                                                                                                                   |
| 色彩       | 7    | news-dark-zh、products-dark-zh desktop：深色外觀可以成立，卡片底色、品牌藍與文字對比一致；wish-form-sent-zh desktop 的成功訊息用綠字、wish-form-error-zh mobile 的錯誤用紅字，語意色正確。但 wish-error-zh desktop 用紅字報錯的同時，下方又顯示中性的空狀態。                                                                            |
| 間距與版面 | 4.5  | home-zh desktop：藍色卡片與關於文字重疊；產品章節的 App 截圖沒有裝置框，直接貼在 CTA 下方並往下溢出；news-zh desktop 是兩欄高低不一的錯落版面，「11 月 16 日凌晨系統維護」卡片右側留出大片空白；devlog-zh desktop 中「無障礙稽核紀錄」卡片無圖，下方空了約 280 px。                                                                      |
| 一致性     | 4.5  | wish-zh desktop 的導覽是「認識我們／常見問題／夥伴徵才」，Ghost 頁（news-zh）卻是「關於我們／FAQ／加入我們」；麵包屑一邊是「WISH POOL / PRODUCT 06」，另一邊是「NYCU LIFE / NEWS」；Ghost 頁的標籤是純文字，許願池則是膠囊標籤；上一篇／下一篇只是純文字連結，與許願池的手繪按鈕不同調。                                                 |
| 資訊密度   | 6    | news-zh desktop：兩欄大圖卡加上 255 px 高的封面，一屏只看得到約 2.5 則消息；devlog-zh 同樣如此。wish-zh desktop 三欄卡片的密度則恰當。                                                                                                                                                                                                   |
| 導覽       | 5.5  | 所有 Ghost 頁的主導覽都沒有「最新消息」（news-zh desktop 自己頁面上的導覽也沒有）；devlog-post-zh mobile 的上一篇／下一篇是兩行沒有標示方向的文字；404 的回首頁按鈕只寫「NYCU LIFE →」。                                                                                                                                                 |
| 狀態與回饋 | 4    | ghost-down-zh：白底等寬英文「Content is temporarily unavailable」，沒有品牌、沒有下一步；wish-error-zh desktop：連線失敗時卻顯示「這一池還很安靜，成為第一個許願的人吧」；admin-error-zh desktop：紅色錯誤橫幅下方同時出現綠勾「這裡目前沒有項目」，訊息互相矛盾；news-empty-zh 什麼都沒有顯示；news-loading-zh 的封面是純白，沒有骨架。 |
| 響應式     | 5.5  | about-zh mobile 把願景卡片改成左圖右文，處理得合理；但 home-zh desktop 的重疊在寬螢幕上反而出錯；news-zh mobile 標題換到第三行仍沒有截斷，單張卡片超過一屏。                                                                                                                                                                             |
| 文案       | 4.5  | 繁中頁面混著英文：devlog-empty、comics-empty 的「Page 1 of 1」，not-found-zh 的「Page not found」，頁尾的「Crafted with care by the NYCU LIFE 內容管理」；comics-empty-zh mobile 的空狀態是一句沒有前文的「在那之前，可以先到『認識我們』…」。                                                                                           |
| 無障礙     | 6    | wish-zh desktop 的「+1」按鈕約 70×32 px，時間「9 小時前」是很淺的灰色小字；news-zh 卡片內的分類標籤只靠位置辨認，沒有外框或底色；表單錯誤有文字說明，不只靠顏色。                                                                                                                                                                        |
| 動畫與轉場 | 5    | wish-loading-zh 有骨架卡片，admin-loading-zh desktop 有轉圈和說明；但 news-loading-zh 只有空白封面，沒有骨架；FAQ 有展開／收合符號。線索不多，給保守分數。                                                                                                                                                                               |

要保留的優點：

- 許願池的手繪貼紙按鈕「投下願望」、膠帶裝飾卡片與「大家正在敲碗」標題，品牌語彙鮮明（wish-zh 兩種尺寸）。
- 許願池的表單驗證與送出成功都在表單內給即時文字回饋（wish-form-error-zh mobile、wish-form-sent-zh desktop）。
- 已實現分頁的卡片有「✓ Fulfilled」綠色章、團隊回覆框與實現日期，資訊完整（wish-fulfilled-dark-en desktop）。
- 管理頁的待審核卡片把核准公開設為主按鈕，下架等次要動作分級清楚，筆數徽章與搜尋列也很實用（admin-pending-zh desktop）。
- 關於頁的里程碑在手機上改成直式時間軸，進行中與規劃中用空心圓區分（about-milestones-zh mobile）。

最重要的五個問題（由嚴重到輕微）：

1. [間距與版面] [home-zh] [desktop] 關於章節的標題與內文被藍色卡片蓋住，產品章節的 App 截圖沒有手機框並往下溢出 —— 這是首頁第二、三屏，第一印象就是「壞掉」 —— 建議改回左文右圖的雙欄格線，替截圖套上裝置框，並確保它不會壓到文字欄。
2. [狀態與回饋] [ghost-down-zh、wish-error-zh、admin-error-zh] [兩者] 503 只有一行等寬英文；許願池載入失敗時卻顯示「成為第一個許願的人」；管理錯誤與「目前沒有項目」同時出現 —— 會誤導使用者以為沒有資料，管理員也可能做錯判斷 —— 建議做一張有品牌的錯誤卡片，附上重新整理按鈕；錯誤時不要再顯示空狀態。
3. [一致性] [comics-zh、comics-empty-zh] [兩者] 漫畫頁套用了開發日誌的標題與介紹 —— 使用者無法分辨自己在哪個專區 —— 建議每個集合使用自己的標題、介紹與空狀態文案。
4. [一致性／導覽] [wish-zh vs news-zh] [desktop] 許願池與 Ghost 頁的導覽用詞、麵包屑格式、標籤樣式都不同，主導覽也沒有「最新消息」 —— 兩個系統看起來像兩個網站 —— 建議統一導覽項目與名稱，把標籤統一成膠囊樣式。
5. [文案] [devlog-empty-zh、not-found-zh、頁尾] [兩者] 繁中頁面露出「Page 1 of 1」「Page not found」「Crafted with care by the … 內容管理」 —— 看起來不專業，也洩漏了模板字串 —— 建議所有固定字串都在地化，只有一頁時隱藏分頁器。

## 組 B

一句話總評：參考組（產品官網、更新日誌、回饋看板）在排版、格線與一致性上完成度很高。截圖能看到的互動狀態有限，深色系也是品牌本身的選擇，不能當成自適應外觀的證據。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                           |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 8.5  | linear-home desktop：首屏大標、副標與主 CTA 一眼可辨；linear-changelog desktop：日期放在左欄，標題與配圖在右，時間軸主次分明。              |
| 字體排印   | 9    | linear-changelog desktop 與 mobile：字重層級少而一致，行長控制得宜；raycast-blog desktop 的卡片標題與摘要字級比例穩定。                     |
| 色彩       | 8.5  | raycast-home desktop：深色底搭配單一強調色，漸層只用在重點視覺；canny-roadmap 用狀態欄位與顏色區分規劃中與已完成。                          |
| 間距與版面 | 8.5  | raycast-blog desktop 的卡片格線對齊，留白節奏一致；linear-home desktop 的區塊之間有固定的大間距；canny-roadmap desktop 內容偏少，畫面較空。 |
| 一致性     | 9    | linear-home 與 linear-changelog 兩種尺寸的導覽、字體、按鈕完全一致；raycast-home 與 raycast-blog 也一樣。                                   |
| 資訊密度   | 8    | linear-changelog desktop 一屏可見完整一則更新；raycast-blog desktop 一屏約可見 6 張卡片；canny-roadmap 偏稀疏。                             |
| 導覽       | 8    | 各站頁首導覽都很精簡，手機版收成選單（linear-home mobile、raycast-home mobile）；canny-roadmap mobile 欄位改成直向堆疊。                    |
| 狀態與回饋 | 6    | 截圖只有正常資料狀態，看不到載入、錯誤或空資料；canny-roadmap 的投票數有呈現，但沒有互動後的狀態，給保守分數。                              |
| 響應式     | 8    | linear-home mobile 與 raycast-home mobile 都重新排版成單欄，不是單純縮小；raycast-home mobile 的長頁面視覺仍然完整。                        |
| 文案       | 8.5  | linear-changelog 的標題精準、具體；raycast-blog 的摘要長度一致。                                                                            |
| 無障礙     | 7    | 深色底上的次要灰字對比偏低（linear-home desktop 的輔助說明、raycast-blog 的日期）；連結與按鈕尺寸足夠。                                     |
| 動畫與轉場 | 6    | raycast-home 與 linear-home 的首屏有動態視覺的痕跡，但截圖中看不到展開、載入等狀態的線索，給保守分數。                                      |

要保留的優點：

- 更新日誌用「左日期、右內容」的時間軸，掃讀效率高（linear-changelog desktop）。
- 文章卡片格線一致，標題與摘要固定行數（raycast-blog desktop）。
- 品牌色只用在 CTA 與重點，其餘大面積維持中性色（raycast-home、linear-home）。
- 手機版確實重排成單欄，不只是縮小（linear-home mobile、raycast-home mobile）。

最重要的五個問題（由嚴重到輕微）：

1. [狀態與回饋] [canny-roadmap] [兩者] 截圖中看不到投票後、空欄或載入的狀態 —— 無法評估回饋設計 —— 對照時只能參考它的版面，不能參考互動。
2. [無障礙] [linear-home、raycast-blog] [desktop] 深色底上的灰色輔助字對比偏低 —— 小字不易閱讀 —— 次要文字應該保持 4.5:1 的對比。
3. [間距與版面] [canny-roadmap] [desktop] 1440 寬螢幕下欄位內容稀少，留白過多 —— 空間利用率低 —— 可以加寬卡片或顯示更多欄位。
4. [資訊密度] [raycast-home] [mobile] 長頁面的大型視覺占去好幾屏才看到具體功能 —— 手機使用者要捲很久 —— 可以提早放功能摘要。
5. [色彩] [linear-home、raycast-home] [兩者] 單一深色主題沒有淺色對照 —— 不能當成「深色／淺色雙外觀」的參考 —— NYCU LIFE 只應借鏡它的強調色用法。

## 組 C

一句話總評：Ghost 頁與許願池的元件和導覽已經統一。卡片格線、膠囊標籤、上一篇／下一篇卡片、空狀態與錯誤卡片都做到位，首頁各章節排版正確；剩下的是影片佔位、產品卡片留白、小字對比與管理後台的內部資訊這些細節。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                             |
| ---------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 8    | home-zh desktop：扭蛋機首屏之後，「ABOUT US／升級你的 NYCU 的 LIFE」左文右圖排列清楚；NYCU BUS 章節左邊是功能清單與「前往使用」，右邊是手持手機插圖。news-post-zh desktop 的日期、標題、摘要、標籤依序排列。                                                                                                                                  |
| 字體排印   | 7.5  | news-zh desktop：卡片標題最多三行，摘要固定兩行並加省略號；devlog-post-nocover-zh desktop 的標籤改成一排膠囊。但 products-zh desktop 的「NYCU BUS」用細體大字，和其他頁的粗體標題不一致；about-milestones-zh desktop 弧線時間軸的說明文字很小（約 12 px）。                                                                                   |
| 色彩       | 8    | news-dark-zh mobile 的膠囊標籤在深色底仍然清楚；not-found-dark-zh mobile 主按鈕改成淺藍底配深字；admin-error-zh desktop 用紅色虛線框加「!」圖示，語意明確；about-dark-zh desktop 的影片區幾乎和背景融在一起。                                                                                                                                 |
| 間距與版面 | 7.5  | news-zh、devlog-zh、comics-zh desktop 都是三欄等高卡片，善用 1440 寬度；但 products-zh desktop 每張產品卡右半邊約 40% 是空白；home-zh 與 about-zh desktop 的影片位是一塊沒有內容的純色大方塊。                                                                                                                                                |
| 一致性     | 7.5  | wish-zh 與 news-zh desktop 的導覽同樣是「關於我們／產品／FAQ／加入我們／開發日誌／最新消息」，麵包屑都用「NYCU LIFE / …」；空狀態都用扭蛋機小插圖加虛線框（news-empty-zh、comics-empty-zh、devlog-empty-zh mobile、ghost-down-zh）。不過管理頁的麵包屑仍是「WISH POOL / ADMIN」，about-en desktop 的英文導覽只有 4 項，少了 Dev log 與 News。 |
| 資訊密度   | 7    | news-zh desktop 一屏可見 6 則消息；comics-zh desktop 可見 9 集。但產品頁每張卡約 490 px 高，一屏只容得下 1.5 項產品；wish-zh desktop 中「希望校車能顯示即時擁擠度」卡片被同列有回覆的卡片撐高，中間空白很大。                                                                                                                                 |
| 導覽       | 7.5  | news-post-zh desktop 的上一篇／下一篇改成帶「← 上一篇／下一篇 →」標示的卡片；not-found-dark-zh mobile 提供回首頁、最新消息、許願池三個出口；ghost-down-zh desktop 頁首只剩 logo，失去主導覽。                                                                                                                                                 |
| 狀態與回饋 | 8    | ghost-down-zh：「503 頁面暫時打不開」附重新整理按鈕，並說明「許願池不受影響」；wish-error-zh desktop 寫明「暫時連不上許願池」與原因，附重新載入按鈕；news-loading-zh desktop 的封面用灰色佔位；admin-loading-zh desktop 讀取時卻顯示「待審核 0」，可能讓人誤以為沒有資料。                                                                    |
| 響應式     | 7.5  | devlog-post-zh mobile 的上一篇／下一篇卡片改成上下排列並維持全寬；devlog-empty-zh mobile 空狀態置中，按鈕夠大；products-en mobile 的長英文標題換行正常；手機頁首只有許願池貼紙和選單，語言與外觀切換要進選單才找得到。                                                                                                                        |
| 文案       | 7.5  | 空狀態文案各有情境：「還沒有新消息」「小貢的第一集還在畫」「第一篇日誌整理中」；頁尾改成「由 NYCU LIFE 學生團隊用心打造 · 原始碼 · 編輯登入」。admin-signed-out-zh mobile 仍寫「任何成功通過 NYCU LIFE OAuth 的帳號」「OAuth token」，對一般管理員太技術化。                                                                                  |
| 無障礙     | 6.5  | wish-zh desktop 的「+1」按鈕偏小（約 70×32 px），「9 小時前」淺灰小字的對比不足；admin-reply-zh mobile 的操作按鈕高度足夠（約 44 px）；狀態除了顏色還有「✓ 已實現」文字。                                                                                                                                                                     |
| 動畫與轉場 | 6.5  | wish-loading-zh desktop 有骨架卡片；admin-loading-zh desktop 有轉圈加說明；news-loading-zh 有灰色封面佔位；FAQ 有「—」收合符號；home-zh desktop 產品章節有左右切換箭頭，暗示輪播。都只是靜態線索。                                                                                                                                            |

要保留的優點：

- Ghost 列表頁三欄等高卡片，摘要截斷加上膠囊標籤，列表整齊易掃（news-zh、devlog-zh、comics-zh desktop）。
- 統一的空狀態與錯誤卡片：扭蛋機小插圖、標題、說明加一個下一步按鈕（news-empty-zh、comics-empty-zh、ghost-down-zh、not-found-dark-zh mobile）。
- 文章底部的上一篇／下一篇卡片有方向標示與完整標題（news-post-zh desktop、devlog-post-zh mobile）。
- 首頁產品章節的手持手機插圖與左右切換箭頭，延續手繪語彙（home-zh desktop）。
- 許願池載入失敗時說明「願望都還在」並附重新載入，管理錯誤也有獨立的錯誤卡片（wish-error-zh、admin-error-zh desktop）。
- 全站導覽與麵包屑統一，許願池與 Ghost 頁之間切換沒有斷層（wish-zh vs news-zh desktop）。

最重要的五個問題（由嚴重到輕微）：

1. [間距與版面] [about-zh、about-dark-zh、home-zh] [兩者] 「看看我們怎麼工作」與首頁關於章節的影片位置是一塊沒有封面、沒有播放鍵的純色方塊；深色外觀下幾乎看不見 —— 占了約 500 px，卻不傳達任何內容 —— 建議放影片封面加播放按鈕，載入前用帶插圖的佔位。
2. [資訊密度／間距與版面] [products-zh、products-dark-zh] [desktop] 每張產品卡右側約 40% 空白，一屏只看得到 1.5 項產品；功能條列又比標題縮排一層，對齊不齊 —— 產品頁是轉換頁，捲動成本太高 —— 建議縮小卡高，讓文字欄更寬；把功能條列與標題對齊，或改成兩欄卡片。
3. [狀態與回饋] [admin-loading-zh] [desktop] 讀取時「待審核」計數顯示 0 —— 管理員可能誤以為沒有待審核項目 —— 讀取中應該隱藏計數或顯示「–」。
4. [導覽] [about-en、products-en、home-en] [desktop] 英文導覽只有 4 項，少了 Dev log 與 News；ghost-down-zh 頁首只有 logo —— 不同語系與錯誤頁的動線不一致 —— 建議各語系的導覽項目一致（英文可以連到中文文章並標示「中文」）；503 頁至少保留許願池入口。
5. [文案／無障礙] [admin-signed-out-zh、admin-reply-zh、wish-zh] [兩者] 管理頁露出「OAuth token」與截斷的 UUID；許願卡的「9 小時前」淺灰小字與 +1 按鈕偏小 —— 內部術語增加理解成本，小字與小按鈕不利觸控和弱視 —— 建議用白話說明登入方式，ID 收進「複製 ID」按鈕；時間字提高對比，+1 的點擊範圍至少 44 px。

```json
{
	"A": {
		"scores": {
			"資訊層級": 5.5,
			"字體排印": 6,
			"色彩": 7,
			"間距與版面": 4.5,
			"一致性": 4.5,
			"資訊密度": 6,
			"導覽": 5.5,
			"狀態與回饋": 4,
			"響應式": 5.5,
			"文案": 4.5,
			"無障礙": 6,
			"動畫與轉場": 5
		},
		"issues": [
			"[間距與版面] home-zh desktop：關於章節的文字被藍色卡片覆蓋，產品章節截圖沒有手機框並往下溢出",
			"[狀態與回饋] ghost-down-zh、wish-error-zh、admin-error-zh：503 只有等寬英文；載入失敗卻顯示空狀態；錯誤與「沒有項目」同時出現",
			"[一致性] comics-zh、comics-empty-zh：漫畫頁套用開發日誌的標題與介紹",
			"[一致性／導覽] wish-zh vs news-zh：導覽用詞、麵包屑、標籤樣式不一致，主導覽缺少最新消息",
			"[文案] devlog-empty-zh、not-found-zh、頁尾：繁中頁面露出 Page 1 of 1、Page not found、Crafted with care 等英文模板字串"
		]
	},
	"B": {
		"scores": {
			"資訊層級": 8.5,
			"字體排印": 9,
			"色彩": 8.5,
			"間距與版面": 8.5,
			"一致性": 9,
			"資訊密度": 8,
			"導覽": 8,
			"狀態與回饋": 6,
			"響應式": 8,
			"文案": 8.5,
			"無障礙": 7,
			"動畫與轉場": 6
		},
		"issues": [
			"[狀態與回饋] canny-roadmap：看不到投票後、空欄或載入狀態，無法評估回饋設計",
			"[無障礙] linear-home、raycast-blog desktop：深色底上的灰色輔助字對比偏低",
			"[間距與版面] canny-roadmap desktop：寬螢幕下欄位內容稀少、留白過多",
			"[資訊密度] raycast-home mobile：大型視覺占去多屏才看到具體功能",
			"[色彩] linear-home、raycast-home：只有深色主題，不能當成雙外觀的參考"
		]
	},
	"C": {
		"scores": {
			"資訊層級": 8,
			"字體排印": 7.5,
			"色彩": 8,
			"間距與版面": 7.5,
			"一致性": 7.5,
			"資訊密度": 7,
			"導覽": 7.5,
			"狀態與回饋": 8,
			"響應式": 7.5,
			"文案": 7.5,
			"無障礙": 6.5,
			"動畫與轉場": 6.5
		},
		"issues": [
			"[間距與版面] about-zh、about-dark-zh、home-zh：影片位置是沒有封面與播放鍵的純色方塊，深色下幾乎看不見",
			"[資訊密度] products-zh desktop：產品卡右側約 40% 空白，一屏只見 1.5 項產品，功能條列縮排沒有對齊",
			"[狀態與回饋] admin-loading-zh desktop：讀取中顯示「待審核 0」，可能誤導管理員",
			"[導覽] about-en、home-en desktop：英文導覽少了 Dev log 與 News；ghost-down-zh 頁首沒有導覽",
			"[文案／無障礙] admin-signed-out-zh、admin-reply-zh、wish-zh：露出 OAuth token 與 UUID，時間灰字與 +1 按鈕過小"
		]
	}
}
```
