# r8 blind review: Claude Opus 5.5 (effort high)

- Date: 2026-11-13
- Brief: `brief.md`, SHA-256 `38706a333a66ce90e7a2f1d36c2cfba51ce2651580ebe6fd7657560245416fd4` (unchanged)
- Reviewer: claude-proxy `claude-opus-5-5`, effort high, fresh thread, no other context
- Mapping (revealed after the review): **A = new** (round 8), **B = reference**, **C = baseline** (`main` at `d189336`)

| Set           | Mean of 12 scores |
| ------------- | ----------------: |
| C (baseline)  |              5.75 |
| A (new)       |              7.42 |
| B (reference) |              7.71 |

Maintainer notes: the new set changed little from round 7 (8.00), so the −0.58 is judge
variance; this reviewer raised a hero CTA issue that applies to both versions. 「審查用管理員」
is the mocked reviewer account name in the fixture data, not an interface string.

Raw reviewer output below, unedited except that the final JSON block is shown on one line.

---

## 組 A

一句話總評：品牌語彙（扭蛋機、貼紙按鈕、紙膠帶卡片）在官網、Ghost 頁面和許願池之間用得一致。錯誤、空資料、404、服務中斷都有設計過的狀態和下一步，是三組裡最完整的。剩下的問題集中在首屏缺少說明文字與行動按鈕、深色模式按鈕對比、少數中英文字串混用，以及表單錯誤沒有標在欄位上。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                                                       |
| ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 7.5  | home-zh desktop：第一屏只有扭蛋機插圖加上極小的「SCROLL TO EXPLORE」，沒有一句話說明產品，也沒有下載或許願的行動按鈕，要捲到 About 才知道「升級你的 NYCU 的 LIFE」。wish-zh desktop：大標「一起改造 NYCU 的 LIFE」→ 表單 →「大家正在敲碗」，主次清楚。news-zh desktop：每張卡片依日期、標題、摘要、標籤的順序排列，日期一眼可見。                                       |
| 字體排印   | 7.5  | devlog-post-zh desktop：內文行長約 720px，H2「為什麼不直接複製 CSS」與內文的層級分明，中英混排的字距自然。news-zh desktop：長標題「NYCU MAPS 公開測試：室內地圖、無障礙路線…」在三欄卡片裡斷成三行，仍可讀。admin-published-en desktop：12px 的按鈕字與 11px 的 ID chip 偏小。devlog-post 內文仍顯示反引號「`layout.css`」。                                            |
| 色彩       | 7.5  | 藍色主色加白色卡片、淡紫陰影成一套系統。語意色有區分：wish-error 的「暫時連不上許願池」用紅色標題，admin-published-en 的「✓ Fulfilled」用綠色 chip，「Hide」用紅色淡底。admin-signed-out-en（深色）的「Sign in with NYCU LIFE」是白字配淺藍底，對比不足。                                                                                                               |
| 間距與版面 | 7.5  | wish-zh desktop：三欄瀑布流，卡片沒有被拉長留白，但右欄比左欄長約 150px，底部參差。about-zh desktop：Vision 三卡與影片的寬度對齊同一條格線。not-found-zh desktop：404 卡片置中、留白適中。admin 頁面的內容寬度約 840px，在 1440 寬螢幕上兩側很空。                                                                                                                      |
| 一致性     | 7.5  | not-found、ghost-down、devlog-empty 都用同一個「虛線卡片＋小扭蛋機插圖＋藍色主按鈕」模式。許願池用貼紙按鈕「投下願望 ✸」，管理後台改用乾淨的 SaaS 按鈕（admin-published-en），兩者風格不同，但後台屬於內部工具，可以接受。news-zh 與 devlog-post 的標籤 pill 樣式統一。                                                                                                 |
| 資訊密度   | 7    | news-zh desktop：一屏約 6 張卡片，密度合理。admin-published-en desktop：每筆約 150px 高，11 筆要長捲動；按鈕、ID、人數擠在同一行的右下角。wish-zh desktop：卡片緊湊，「顯示詳情」把長內容收起來。                                                                                                                                                                       |
| 導覽       | 8    | 頂欄有 關於我們／產品／FAQ／加入我們／開發日誌／最新消息，加上許願池貼紙。menu-open-zh mobile：全寬列表加語言、主題切換，點擊範圍大。devlog-post-zh desktop：上一篇／下一篇是兩張卡片，標示清楚。admin 頁面有「← 返回公開許願池」。缺點：目前所在頁面在頂欄沒有高亮。                                                                                                   |
| 狀態與回饋 | 8    | wish-error desktop：錯誤標題、原因說明（「願望都還在」）和「重新載入」按鈕齊全。admin-error desktop：紅色虛線框、驚嘆號、「重新整理」。ghost-down desktop：品牌化的 503 卡片，有「重新整理」和「前往許願池」，並說明許願池不受影響。devlog-empty：「第一篇日誌整理中」加上「看里程碑 →」。wish-form-error：錯誤文字放在免責說明下方，輸入框沒有紅框，也沒有和欄位關聯。 |
| 響應式     | 8    | menu-open-zh mobile 的選單與首頁 About 置中排列合理。admin 在手機上的按鈕改成 2＋1 的全寬排列（見 admin-published 的相同模式）。桌面版首頁的 About 與產品區是左文右圖兩欄，沒有溢出。                                                                                                                                                                                   |
| 文案       | 7.5  | 語氣在地、溫暖，例如「大家正在敲碗」、「這一池還很安靜」、「願望都還在，稍後再試就好」。英文頂欄寫成「Dev log (中文)」「News (中文)」，事先告知內容只有中文，很貼心。不足：admin-published-en 的身分列仍顯示「審查用管理員 / Verified by NYCU LIFE SSO」，中英混用。                                                                                                    |
| 無障礙     | 6.5  | admin-signed-out-en（深色）的主按鈕是白字配淺藍底，估計對比約 2.5:1。admin-published-en 的動作按鈕高約 32px、字 12px，偏小。「SCROLL TO EXPLORE」淺灰小字的對比很低。優點：wish-error 除了紅色還有文字與按鈕，已實現狀態也有「✓」符號，不只靠顏色。                                                                                                                     |
| 動畫與轉場 | 6.5  | 可見的線索有：wish-zh 的「▶ 補充一點細節」disclosure、「顯示詳情 ⌄」的 chevron；menu-open 用覆蓋面板開啟並保留陰影；+1 之後有填色狀態。截圖已關閉動畫，沒有更多轉場證據，所以給保守分數。                                                                                                                                                                               |

要保留的優點：

- 錯誤與空狀態用同一套「虛線卡片＋扭蛋機小插圖＋主按鈕＋次要連結」模板（not-found、ghost-down、devlog-empty、wish-error），品牌感一致，也都有下一步。
- 503 頁面明確告訴使用者「許願池不受影響，仍然可以許願」，並直接附上入口。
- 英文頂欄的「Dev log (中文)」「News (中文)」事先管理語言期待。
- 許願池卡片的貼紙語彙：紙膠帶、手繪 +1 按鈕、分類 chip、團隊回覆的淡藍框。
- 開發日誌文章頁的上一篇／下一篇卡片，以及標籤 pill。
- 管理後台的 ID 縮成「ID 0f5d6023」chip，不外露完整 UUID。

最重要的五個問題（由嚴重到輕微）：

1. [資訊層級] [home-zh / home-en] [兩者] 首屏只有扭蛋機插圖和「SCROLL TO EXPLORE」，沒有一句話的產品定位，也沒有下載 App 或許願的 CTA —— 第一次來的同學 3 秒內無法知道這是校園 App、能做什麼 —— 建議在插圖下方或側邊加一行定位文案，再加主要 CTA（下載）與次要 CTA（許願池）。
2. [無障礙] [admin-signed-out-en 深色、admin-pending-dark-zh] [兩者] 深色模式的主按鈕是白字配淺藍底，對比不足；後台動作按鈕約 32px 高、12px 字 —— 管理者頻繁點擊，誤觸和可讀性都受影響 —— 建議深色模式的主按鈕改用深字或更深的藍，按鈕至少 40px 高。
3. [狀態與回饋] [wish-form-error-zh] [兩者] 字數不足的錯誤只是一行紅字，放在免責說明之後，輸入框本身沒有錯誤樣式 —— 使用者的視線在輸入框和按鈕上，容易漏看 —— 建議輸入框加紅框，錯誤訊息緊貼欄位下方並用 aria-describedby 關聯。
4. [文案] [admin-published-en、devlog-post-zh] [兩者] 英文後台的身分列仍顯示「審查用管理員」；文章內文出現原始的反引號「`layout.css`」 —— 系統字串和 Markdown 語法外露，降低品質感 —— 建議補齊角色名稱的 i18n，並修正 inline code 的渲染。
5. [間距與版面] [wish-zh、admin-published-en] [desktop] 許願池瀑布流的三欄底部高度落差大；後台內容寬約 840px，兩側大量留白，每筆卡片又佔很多高度 —— 寬螢幕空間沒有被用在管理效率上 —— 建議後台改成較寬的表格／列表模式或可切換密度，許願池可考慮依欄高平衡。

## 組 B

一句話總評：參考組（Linear、Raycast、Canny）的字體、配色與層級非常成熟，是一流產品官網的水準。不過截圖幾乎沒有錯誤或載入狀態可評，手機版也有元素遮擋與大片空白。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                          |
| ---------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 8.5  | linear-home desktop：大標「The product development system for teams and agents」，副標，接著是產品截圖，一屏讀懂。raycast-home desktop：標語、副標、唯一的「Download for Mac」CTA，置中、焦點集中。canny-roadmap desktop：Boards、Roadmap 三欄的狀態分明。 |
| 字體排印   | 8.5  | linear-changelog desktop：日期放在左側時間軸，內文行長約 520px，行高寬鬆。raycast-blog mobile：標題字距稍寬，日期用等寬全大寫，層級分明。linear-home 的 FIG 0.1 等標註字級極小、灰階淡，近乎難讀。                                                         |
| 色彩       | 8.5  | Linear 是黑底灰階加少量強調色，Raycast 是黑底加品牌紅，各自系統化。canny-roadmap 的狀態點分成灰綠（Under Review）、藍（Planned）、紫（In Progress）。linear-home 導覽用灰字配黑底，對比偏低。                                                              |
| 間距與版面 | 8    | linear-home desktop：12 欄格線，三欄 FIG 區塊對齊精準。raycast-home desktop：hero 與「Take shortcuts」之間約 350px 的空黑區。canny-roadmap mobile：「Planned」欄只有兩筆，卻佔約 400px 空白。                                                              |
| 一致性     | 8.5  | linear-home 與 linear-changelog 共用同一個頂欄、字體與黑底；raycast-home 與 raycast-blog 共用膠囊頂欄和卡片圓角。                                                                                                                                          |
| 資訊密度   | 8    | canny-roadmap desktop：一屏三欄十餘筆，加上票數。linear-changelog：Fixes／Improvements 等收成手風琴，控制長度。raycast-blog mobile：一屏約 3 張卡片，偏鬆。                                                                                                |
| 導覽       | 8    | linear-changelog desktop：All／Changelog／Product launches 分類、搜尋、通知鈴。canny-roadmap desktop：Roadmap 頁籤有底線和藍字標示目前位置。raycast-blog mobile：分類列在 390 寬被截到只剩 RSS 圖示，需要橫向捲動。                                        |
| 狀態與回饋 | 6    | 截圖中幾乎沒有載入、空資料、錯誤、表單驗證等狀態。canny-roadmap 的投票按鈕只看得到預設狀態。依保守原則給 6。                                                                                                                                               |
| 響應式     | 7.5  | raycast-blog mobile：卡片改成單欄，字級合理。canny-roadmap mobile：右下 Intercom 浮動按鈕蓋住「Allow certain tags to be made publ…」，桌面版欄位用固定高度把「Edit/Delete Merged Comment」裁掉一半。                                                       |
| 文案       | 8.5  | raycast-home 的「Take shortcuts, not detours.」簡潔有記憶點；linear-changelog 用具體動詞描述變更（BYOK 說明包含適用方案與設定位置）。                                                                                                                      |
| 無障礙     | 6.5  | linear-home 的導覽、FIG 標註、「POWERING THE COMPANIES…」都是低對比小字；raycast-home 的「macOS Tahoe and Apple Silicon required」為約 10px 深灰字配黑底；canny 的投票按鈕約 36px，接近下限。                                                              |
| 動畫與轉場 | 6    | linear-changelog 的手風琴箭頭「›」、raycast-home 的 dock 圖示選取態與 tooltip「Clipboard History」，暗示有互動回饋，但截圖沒有更多證據，所以給保守分數。                                                                                                   |

要保留的優點：

- linear-home 的首屏結構：一句定位、副標，再用實際產品介面證明價值。
- linear-changelog 的左側日期時間軸，加上可收合的次要變更分類。
- canny-roadmap 用顏色點加文字標示三種狀態，投票數放在固定位置的方框內。
- raycast-home 只有一個主 CTA，並附安裝需求說明。
- raycast-blog 的分類頁籤加 RSS 入口。

最重要的五個問題（由嚴重到輕微）：

1. [響應式] [canny-roadmap] [mobile] Intercom 浮動按鈕蓋住列表文字，「Allow certain tags to be made publ…」被遮住 —— 手機上的內容無法完整閱讀 —— 建議為浮動元件預留安全區，或捲動時自動縮小。
2. [無障礙] [linear-home、raycast-home] [desktop] 導覽、標註、安裝需求等使用很淡的灰字配黑底，字級又小 —— 低視力使用者難以閱讀 —— 建議次要文字對比至少提高到 4.5:1。
3. [間距與版面] [canny-roadmap] [兩者] 欄位固定高度，桌面裁掉內容、手機留下大片空白 —— 版面浪費又截斷 —— 建議依內容自適應高度或加明確的「更多」。
4. [導覽] [raycast-blog] [mobile] 分類列被截斷，沒有可橫向捲動的提示 —— 使用者不知道還有更多分類 —— 建議加漸層遮罩或改成下拉選單。
5. [間距與版面] [raycast-home] [desktop] hero 與下一段之間約 350px 空黑區 —— 捲動時像頁面已經結束 —— 建議縮短間距，或放入過渡內容。

## 組 C

一句話總評：許願池本體和組 A 同樣有完整的品牌語彙，但官網與 Ghost 頁面多處壞掉。首頁桌面版 About 區的藍色區塊蓋住文字，內容服務中斷時只剩一行英文純文字，漫畫空頁顯示開發日誌的標題，錯誤狀態又和「空資料」訊息同時出現，可信度明顯受損。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 6    | home-zh desktop：首屏同樣只有扭蛋機，沒有定位文案或 CTA；About 區被一塊純藍矩形蓋住，「ABO…」「升級…」「NYCU…」只露出一半。wish-zh desktop：許願池的層級清楚。comics-empty-zh desktop：麵包屑寫「COMICS」，大標卻是「開發日誌」。                                                                                                                                                                                         |
| 字體排印   | 7    | wish-zh、admin-pending-zh 的字級與行高合理。devlog-post-zh desktop：分類「設計」是無樣式的純文字，緊貼在副標下方。ghost-down-zh desktop：瀏覽器預設的等寬字。not-found-zh：「404 / Page not found」是英文小字。                                                                                                                                                                                                           |
| 色彩       | 7    | 許願池的藍、綠色「✓ 已實現」、紅色錯誤文字各有語意。wish-dark-zh desktop：深藍底上的卡片與表單維持純白加淡紫陰影，深色模式下顯得刺眼。admin-pending-dark：「核准公開」白字配淺藍底，對比不足。                                                                                                                                                                                                                            |
| 間距與版面 | 5    | home-zh desktop：About 藍色區塊和文字重疊；產品區的手機外框與手部插圖消失，地圖截圖掉到左欄 CTA 下方，右欄整片空白。wish-zh desktop：卡片採等高網格，「希望校車能顯示即時擁擠度」卡片被拉長，中間約 170px 空白。not-found-zh：內容貼在左上，下方大片空白。                                                                                                                                                                |
| 一致性     | 5    | wish-en desktop／mobile：英文的「Drop a wish」是一般雙框藥丸按鈕，中文的「投下願望 ✸」是手繪貼紙按鈕，同一元件在兩種語言長得不同。news-zh 的分類是純文字，devlog-post 的分類又是另一種樣式。ghost-down 完全沒有站台外框。                                                                                                                                                                                                 |
| 資訊密度   | 6    | devlog-empty-zh desktop：整頁只有一行「在那之前，可以先到…」和「Page 1 of 1」。admin-published-zh desktop：每筆只顯示截斷的完整 UUID「0f5d6023-0969-4987-acfe…」，佔位卻沒有用處。news-zh 兩欄瀑布流的密度尚可。                                                                                                                                                                                                          |
| 導覽       | 6    | 頂欄與 menu-open-zh mobile 都沒有「最新消息」，news 頁存在卻沒有入口。devlog-post-zh desktop：上一篇／下一篇是兩個純文字連結，「期中考週 →」浮在中間，沒有對齊右邊。admin 有「← 返回公開許願池」。                                                                                                                                                                                                                        |
| 狀態與回饋 | 4.5  | ghost-down-zh desktop：白底黑字一行英文「Content is temporarily unavailable. Please try again shortly.」，沒有頁首頁尾，也沒有下一步。wish-error-zh：表單內出現紅字「暫時連不上許願池」，列表區卻同時顯示「這一池還很安靜，成為第一個許願的人吧」。admin-error-zh：紅色橫幅與綠勾「這裡目前沒有項目」並存。wish-loading 只有「正在聽大家的願望…」文字，沒有骨架。優點：admin-loading 有 spinner 和「正在確認登入狀態…」。 |
| 響應式     | 6    | home-zh mobile 的 About 影片縮圖正常，但 desktop 的同一區塊壞掉，代表桌面斷點版面有問題。admin-pending-zh mobile：按鈕 2×2 排列，點擊範圍足夠。wish-zh mobile：表單卡片下方多出約 80px 空白。                                                                                                                                                                                                                             |
| 文案       | 5    | 中文頁尾顯示英文「Crafted with care by the NYCU LIFE 內容管理」，語句不完整，還外露 CMS 入口。wish-zh 的眉標是「WISH POOL / PRODUCT 06」，屬於內部編號。admin-published-en 仍是「審查用管理員」。devlog-empty 的「在那之前」沒有前文。不過許願池本身的「大家正在敲碗」、「這一池還很安靜」很自然。                                                                                                                        |
| 無障礙     | 6    | admin-signed-out-en（深色）與 admin-pending-dark 的主按鈕是白字配淺藍底；wish-supported：+1 後只把按鈕填成淡紫，沒有「已 +1」文字或圖示變化，主要靠顏色傳達。ghost-down 雖是純文字，但沒有任何可操作元素。                                                                                                                                                                                                                |
| 動畫與轉場 | 5.5  | wish-card-open 的「收起詳情 ⌃」展開後內容直接出現；admin-loading 有 spinner；wish-loading 只有靜態文字、沒有骨架；about-zh desktop 的影片區是一塊深藍空白，看不出是在載入還是已失敗。                                                                                                                                                                                                                                     |

要保留的優點：

- 許願池卡片的貼紙語彙（紙膠帶、手繪 +1、分類 icon chip、團隊回覆框）和已實現頁的綠色「✓ 已實現」徽章加上實現日期。
- 送出成功的確認文案「願望已收到！團隊審核通過後就會出現在許願池」，清楚說明接下來的流程。
- 管理後台的撰寫回覆：內嵌文字框附「0 / 1000」字數與「回覆會在願望公開時顯示於許願池」說明。
- admin-loading 的 spinner 加說明文字。
- 手機版後台把動作按鈕改成全寬 2×2 排列。

最重要的五個問題（由嚴重到輕微）：

1. [間距與版面] [home-zh、about-zh] [desktop] 首頁 About 區的純藍矩形蓋住標題與內文；產品區的手機外框與插圖消失，地圖截圖掉到左欄；About 頁的團隊影片是一塊空的深藍區 —— 首頁是門面，壞掉的版面直接傷害信任 —— 影片與插圖載入失敗時要有縮圖或 fallback，且不可覆蓋文字欄。
2. [狀態與回饋] [ghost-down-zh] [兩者] 內容服務中斷時只回傳一行英文等寬純文字，沒有品牌、導覽，也沒有「前往許願池」 —— 使用者會以為整站掛了 —— 建議改成帶站台外框的 503 頁，說明許願池仍可用並附重試按鈕。
3. [狀態與回饋] [wish-error-zh、admin-error-zh] [兩者] 讀取失敗時同時顯示錯誤和「這一池還很安靜／這裡目前沒有項目 ✓」 —— 互相矛盾的訊息會讓人以為真的沒有資料 —— 錯誤時隱藏空狀態，改顯示錯誤說明加「重新載入」。
4. [一致性] [comics-empty-zh、devlog-empty-zh、not-found-zh] [兩者] 漫畫空頁的標題寫「開發日誌」；空集合只剩一行孤立的「在那之前…」加英文「Page 1 of 1」；404 是英文的「Page not found」 —— 空頁與錯誤頁是內容尚少時最常被看到的畫面 —— 建議為每個集合設計正確標題的空狀態卡片，並把 404 中文化、加回扭蛋機插圖與出口連結。
5. [文案／導覽] [全站頁尾、wish-zh、menu-open-zh] [兩者] 中文頁尾是「Crafted with care by the NYCU LIFE 內容管理」，眉標「PRODUCT 06」外露內部編號，頂欄和手機選單都沒有「最新消息」入口 —— 混語與內部字串降低專業感，新聞頁也難以被找到 —— 建議頁尾完整在地化並移除 CMS 連結，眉標改成「NYCU LIFE / 許願池」，導覽補上最新消息。

```json
{
	"A": {
		"scores": {
			"資訊層級": 7.5,
			"字體排印": 7.5,
			"色彩": 7.5,
			"間距與版面": 7.5,
			"一致性": 7.5,
			"資訊密度": 7,
			"導覽": 8,
			"狀態與回饋": 8,
			"響應式": 8,
			"文案": 7.5,
			"無障礙": 6.5,
			"動畫與轉場": 6.5
		},
		"issues": [
			"首頁首屏只有扭蛋機插圖與 SCROLL TO EXPLORE，缺一句產品定位與下載／許願 CTA（home-zh/home-en，兩者）",
			"深色模式主按鈕白字配淺藍底對比不足，後台動作按鈕約 32px 高、12px 字（admin-signed-out-en 深色、admin-pending-dark-zh）",
			"表單字數錯誤只是一行紅字放在免責說明後，輸入框無錯誤樣式也未關聯（wish-form-error-zh）",
			"英文後台仍顯示「審查用管理員」，文章內文顯示原始反引號 `layout.css`（admin-published-en、devlog-post-zh）",
			"許願池瀑布流欄高參差，後台內容僅約 840px 寬、每筆過高，寬螢幕利用不佳（wish-zh、admin-published-en desktop）"
		]
	},
	"B": {
		"scores": {
			"資訊層級": 8.5,
			"字體排印": 8.5,
			"色彩": 8.5,
			"間距與版面": 8,
			"一致性": 8.5,
			"資訊密度": 8,
			"導覽": 8,
			"狀態與回饋": 6,
			"響應式": 7.5,
			"文案": 8.5,
			"無障礙": 6.5,
			"動畫與轉場": 6
		},
		"issues": [
			"Intercom 浮動按鈕在手機上遮住列表文字（canny-roadmap mobile）",
			"導覽、標註、安裝需求等大量低對比小灰字（linear-home、raycast-home desktop）",
			"Roadmap 欄位固定高度，桌面裁切內容、手機留大片空白（canny-roadmap 兩者）",
			"手機分類頁籤被截斷且無可橫向捲動提示（raycast-blog mobile）",
			"hero 與下一段之間約 350px 空黑區，像頁面已結束（raycast-home desktop）"
		]
	},
	"C": {
		"scores": {
			"資訊層級": 6,
			"字體排印": 7,
			"色彩": 7,
			"間距與版面": 5,
			"一致性": 5,
			"資訊密度": 6,
			"導覽": 6,
			"狀態與回饋": 4.5,
			"響應式": 6,
			"文案": 5,
			"無障礙": 6,
			"動畫與轉場": 5.5
		},
		"issues": [
			"首頁 About 純藍矩形蓋住文字、產品區插圖消失且截圖錯位，About 頁影片為空白深藍區（home-zh、about-zh desktop）",
			"內容服務中斷時只回一行英文等寬純文字，無站台外框與下一步（ghost-down-zh 兩者）",
			"讀取錯誤與「這一池還很安靜／這裡目前沒有項目 ✓」空狀態同時出現，訊息矛盾（wish-error-zh、admin-error-zh）",
			"漫畫空頁標題誤為「開發日誌」，空集合只剩孤立句與英文 Page 1 of 1，404 為英文小字（comics-empty、devlog-empty、not-found）",
			"中文頁尾英文殘句加「內容管理」連結、眉標 PRODUCT 06、導覽缺最新消息、英文按鈕非貼紙樣式（全站、wish-zh、wish-en、menu-open-zh）"
		]
	}
}
```
