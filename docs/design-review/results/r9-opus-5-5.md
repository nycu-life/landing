# r9 blind review: Claude Opus 5.5 (effort high)

- Date: 2026-11-13
- Brief: `brief.md`, SHA-256 `38706a333a66ce90e7a2f1d36c2cfba51ce2651580ebe6fd7657560245416fd4` (unchanged)
- Reviewer: claude-proxy `claude-opus-5-5`, effort high, fresh thread, no other context
- Mapping (revealed after the review): **A = new** (round 9), **B = reference**, **C = baseline** (`main` at `d189336`)

| Set           | Mean of 12 scores |
| ------------- | ----------------: |
| C (baseline)  |              5.79 |
| A (new)       |              7.96 |
| B (reference) |              8.50 |

Raw reviewer output below, unedited except that the final JSON block is shown on one line.

---

## 組 A

一句話總評：這一組最完整、最成熟。扭蛋機首屏、手繪許願池和玻璃卡片的語彙在 Ghost 頁面和許願池之間大致一致，載入、空資料和錯誤狀態都有品牌化的說明與下一步。剩下的問題集中在內容服務錯誤頁的外框，以及卡片重複資訊。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 8.5  | home-zh desktop：扭蛋機下方有一句標語「把校園裡的麻煩一顆一顆解掉。」，主按鈕「下載 App ↓」和次按鈕「許願池 ✦」並排，一眼看得懂這是誰、能做什麼。news-post-zh desktop：日期、粗體大標、摘要、分類膠囊依序排下來，主次清楚。admin-pending-zh desktop：每張卡片右下是藍色實心「核准公開」，是唯一的主行動。                                                                                                   |
| 字體排印   | 8    | wish-zh desktop：「一起改造 NYCU 的 LIFE」中英混排的大標字重一致。devlog-post-zh desktop：內文行長約 720px，H2「為什麼不直接複製 CSS」的字級差距明確，`layout.css` 用等寬字加淡藍底呈現。扣分：news-zh desktop 卡片標題「NYCU MAPS 公開測試：室內地圖、無障礙路線…」在三欄窄卡裡折成三行，標點落在行首附近；comics-zh desktop 卡片內 EP 大字和標題又重複一次。                                              |
| 色彩       | 8.5  | 品牌藍貫穿 TopBar 的許願池貼紙、主按鈕和分類膠囊。news-dark-zh desktop：卡片底色是深海軍藍，日期與摘要仍清楚；wish-fulfilled-dark-en desktop：綠色「✓ Fulfilled」膠囊在深色下成立。語意色清楚：wish-form-error 是紅框加驚嘆號圖示，wish-form-sent 是綠底加勾，admin 的「下架」用淡紅。                                                                                                                      |
| 間距與版面 | 8    | news-loading 和 news-dark desktop：三欄等高卡片，分類膠囊對齊卡片底部。devlog-zh desktop：三欄格線整齊。扣分：wish-zh desktop 的願望用瀑布流排列，左欄和中欄底部各留下大片空白（約 140–300px），右欄最長；home-zh desktop 首屏和 ABOUT 之間有約 120px 空帶。                                                                                                                                                |
| 一致性     | 8    | 各頁的麵包屑都是「NYCU LIFE / 最新消息」「許願池 / 管理」格式；空狀態（news-empty、devlog-empty、comics-empty）和 404 都是同一個虛線卡片加扭蛋機插圖加藍色膠囊按鈕。扣分：ghost-down-zh desktop 的頁首沒有導覽和語言切換，主題按鈕換成 ◐ 圖示，字體也像另一套（Noto 黑體），頁尾是單行深色條，和其他頁不同。                                                                                                |
| 資訊密度   | 7.5  | admin-pending-zh desktop 一屏約 5 筆，每筆的 ID、共鳴數、時間都看得到。wish-zh desktop 第一屏就能看到表單加 3 欄願望。扣分：devlog-zh 和 comics-zh 的封面圖已經印著標題（「許願池：看見已實現的願望」「EP.10 期末與寒假」），卡片內文又重複一次；comics 卡的摘要全是「小貢的校園日常第 N 集」，資訊量低。                                                                                                   |
| 導覽       | 8    | TopBar 包含 關於我們／產品／FAQ／加入我們／開發日誌／最新消息 和許願池貼紙，在 news、devlog、wish、admin 各頁都一樣。menu-open-zh mobile：選單列出 7 個大字項目，下方是中／EN 和主題切換，每列約 50px 高，好點。news-post-zh desktop：「← 上一篇／下一篇 →」做成兩張卡片並顯示標題。扣分：目前所在頁在 TopBar 沒有高亮（wish-zh 時只有許願池貼紙變淡紫）。                                                  |
| 狀態與回饋 | 8.5  | wish-loading-zh desktop：三張骨架卡沿用手繪卡片外框。wish-error-zh desktop：紅字「暫時連不上許願池」、說明文字加「重新載入」按鈕。wish-form-error：輸入框變紅並在下方提示「請用至少 4 個字描述你的願望。」。wish-form-sent：綠色成功橫幅。wish-supported mobile：按過的「+1」變成實心淡紫。ghost-down：503 頁面有「重新整理」和「前往許願池 →」兩條出路。admin 有登入狀態列（綠點加「已登入許願池管理」）。 |
| 響應式     | 8    | wish-zh mobile：表單改成直排，分類下拉和投下願望並排，願望卡單欄。admin-pending-dark-zh mobile：「核准公開」改成整列寬按鈕。news-zh mobile：卡片單欄，標籤膠囊放大。扣分：ghost-down-zh mobile 的頁首 Logo 過大（約佔 60% 寬），許願池貼紙和主題按鈕上下疊在右側、沒有對齊。                                                                                                                                |
| 文案       | 8    | 語氣自然在地：「大家正在敲碗」「這一池」「小貢的第一集還在畫」「第一篇日誌整理中」，每個空狀態都附下一步。404 寫「這個網址不存在，或頁面已經下架」。英文版：wish-fulfilled-dark-en 的「Wishes that came true」「37 people agree」很自然。扣分：EN TopBar「Dev log (中文)」「News (中文)」有點笨重；admin-signed-out 寫「使用 NYCU LIFE 帳號登入」，但狀態列說「由 NYCU LIFE SSO 驗證」，用詞略不一致。      |
| 無障礙     | 7.5  | 表單錯誤同時用紅框、圖示和文字，不只靠顏色；+1 按鈕約 80×38px，選單項目點擊範圍大。扣分：admin-pending-zh desktop 的 ID 膠囊和「1 人有共鳴」是約 12px 的淺灰字；footer 灰字在 #3a4150 底上偏淡；截圖中看不到任何焦點樣式的線索。                                                                                                                                                                            |
| 動畫與轉場 | 7    | 看得到的線索有：骨架載入（wish-loading，news-loading 圖片區灰色佔位）、「顯示詳情 ⌄」展開提示、admin「更多 ⌄」下拉、選單展開時下方內容有半透明遮罩。動畫已關閉，無法判斷實際轉場，保守給分。                                                                                                                                                                                                                |

要保留的優點：

- 首頁扭蛋機首屏加一句標語加「下載 App／許願池」雙按鈕（home-zh desktop），品牌記憶點和行動入口同時成立。
- 統一的空狀態模組：虛線卡片、扭蛋機插圖、情境文案加單一行動按鈕（news-empty、devlog-empty、comics-empty、not-found）。
- 許願池手繪卡片系統：膠帶、分類膠囊、「NYCU LIFE 團隊回覆」框、+1 實心回饋（wish-zh、wish-supported）。
- 503 頁明確說「許願池不受影響」並直接導過去（ghost-down），降低使用者的挫折。
- 文章頁上一篇／下一篇做成帶標題的卡片（news-post、devlog-post），點擊範圍大、資訊完整。
- 管理後台的登入狀態列、待審核計數徽章，以及每筆一個主行動的按鈕層級（admin-pending）。

最重要的五個問題（由嚴重到輕微）：

1. [一致性／響應式] [ghost-down-zh] [兩者] 503 頁的頁首和頁尾是另一套樣式：沒有導覽和語言切換，字體不同，主題按鈕是 ◐ 圖示。手機版 Logo 過大，許願池貼紙和主題按鈕上下疊放沒對齊 —— 使用者在故障時最需要信任感，外框突然換掉會像跑到別的網站 —— 改用同一份 TopBar 和頁尾（至少保留 Logo 尺寸、貼紙和切換按鈕的排列），手機版改成單列排列。
2. [間距與版面] [wish-zh、wish-form-sent-zh] [desktop] 願望卡用瀑布流排列，三欄高度差很大：左欄和中欄下方各空出 140–300px，右欄最長，整區看起來沒有收尾 —— 這是許願池最主要的瀏覽面，參差的底部會讓人以為內容沒載完 —— 改成依列對齊的格線（每列等高），或讓欄高平衡。
3. [資訊密度] [devlog-zh、comics-zh] [兩者] 封面圖上已經印著標題或「EP.10 期末與寒假」，卡片內文再重複一次標題；漫畫摘要全是「第 N 集」 —— 一屏能看到的不同資訊變少，列表顯得冗長 —— 封面上有標題時，卡片只留日期和摘要；漫畫改用主題摘要，或縮小封面比例。
4. [狀態與回饋／無障礙] [admin-pending-zh、admin-pending-dark-zh] [兩者] 待審核卡片把「撰寫回覆」和「標記已實現」收進「更多 ⌄」，而紅色「下架」緊貼「核准公開」。手機版「下架」排在左上第一個 —— 管理員最常用的是核准，危險動作離太近容易誤觸 —— 把「下架」移到「更多」裡或和主行動拉開距離，並加二次確認。
5. [導覽／文案] [home-en、wish-fulfilled-dark-en] [desktop] EN TopBar 的「Dev log (中文)」「News (中文)」括號標註讓導覽列變長、不整齊；TopBar 也沒有標示目前所在頁 —— 使用者很難一眼知道自己在哪 —— 語言標註改成連結旁的小 badge 或 hover 提示，並為目前所在頁加底線或品牌色高亮。

## 組 B

一句話總評：參考組。Linear、Raycast 和 Canny 的產品官網、更新日誌與回饋看板，各自的版面、字體和深色系統都非常成熟，但截圖幾乎沒有載入、錯誤、表單等狀態可評。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                           |
| ---------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 9    | linear-home desktop：首屏大標加一句說明加主要 CTA，下方緊接產品介面截圖。raycast-home desktop：深色首屏中央是大標和下載按鈕。linear-changelog desktop：每則更新以日期加標題起頭，掃讀容易。 |
| 字體排印   | 9    | linear-home 和 linear-changelog：無襯線字重階層分明，內文行長控制得好。raycast-blog：卡片標題和日期的字級差明確。                                                                           |
| 色彩       | 9    | Linear 和 Raycast 都是深色為主、有系統的中性灰加單一強調色；raycast-home 的紅色光暈是品牌識別。Canny 是淺色加狀態色欄位。                                                                   |
| 間距與版面 | 9    | linear-home desktop：大區塊留白節奏一致，1440 寬下內容置中、寬度合理。raycast-blog desktop：卡片格線整齊。                                                                                  |
| 一致性     | 9    | 同一品牌內 Linear 首頁和 changelog、Raycast 首頁和部落格的導覽、按鈕和卡片圓角一致。                                                                                                        |
| 資訊密度   | 8.5  | linear-changelog：一屏可見完整一則更新加配圖。canny-roadmap desktop：畫面相對空，看板欄位的資訊量偏少。                                                                                     |
| 導覽       | 8.5  | 各站頂部導覽清楚，手機版收成漢堡選單（linear-home mobile、raycast-home mobile）；截圖中沒有分頁或上一篇的範例。                                                                             |
| 狀態與回饋 | 7    | 截圖只有正常資料的狀態，看不到載入、空資料、錯誤和表單驗證；canny-roadmap 有投票數，但沒有看到 +1 後的回饋。證據不足，保守給分。                                                            |
| 響應式     | 9    | linear-home mobile、raycast-home mobile：版面改成單欄重排，不是單純縮放，沒看到橫向溢出。raycast-blog mobile：卡片改單欄。                                                                  |
| 文案       | 9    | 產品語言精準、簡短，沒有內部術語外露（linear-changelog 標題、raycast-home 標語）。                                                                                                          |
| 無障礙     | 7.5  | 深色底上的次要灰字偏淡（linear-home、raycast-home 的說明文字）；截圖看不到焦點樣式。                                                                                                        |
| 動畫與轉場 | 7.5  | 截圖可見精緻的光暈和漸層（raycast-home），暗示有動態設計，但沒有展開、選單或狀態切換的線索，保守給分。                                                                                      |

要保留的優點：

- linear-changelog：以日期為錨點的更新日誌結構，掃讀效率高。
- linear-home：首屏到產品截圖的敘事節奏，以及克制的留白。
- raycast-home：深色加單一品牌強調色的光暈，識別度強且有系統。
- raycast-blog：卡片格線整齊，標題和日期的層級清楚。
- canny-roadmap：依狀態分欄的公開路線圖，和許願池的「已實現」概念相近，可以參考。

最重要的五個問題（由嚴重到輕微）：

1. [狀態與回饋] [canny-roadmap] [兩者] 看板只呈現正常資料，截圖中看不到空欄、投票後回饋或錯誤處理 —— 回饋看板的核心是互動回饋 —— 可以參考它的分欄，但狀態設計要另外補強。
2. [資訊密度] [canny-roadmap] [desktop] 1440 寬下欄位內容稀疏，大面積留白 —— 一屏能看到的有用資訊少 —— 欄內卡片可以加摘要或投票數的層級。
3. [無障礙] [linear-home、raycast-home] [兩者] 深色底上的次要說明文字對比偏低 —— 小字在手機上難讀 —— 提高次要文字的亮度。
4. [導覽] [linear-changelog、raycast-blog] [兩者] 截圖中看不到分頁、上一篇或返回列表的設計 —— 長期內容需要回溯路徑 —— 補上分頁或日期跳轉。
5. [動畫與轉場] [raycast-home] [mobile] 大量裝飾性光暈和插圖拉長手機首屏，CTA 位置偏下 —— 手機使用者需要捲動才能行動 —— 縮短手機首屏的裝飾高度。

## 組 C

一句話總評：基本外觀和 A 相同，但多處壞掉或未完成：首頁「關於」章節的文字被藍色色塊蓋住，漫畫頁沿用開發日誌的標題，錯誤狀態偽裝成空資料，503 是一行純文字，導覽用詞前後不一，整體可用但可信度明顯不足。

| 項目       | 分數 | 證據（狀態 ID、尺寸、看到的事實）                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 資訊層級   | 6    | home-zh desktop：扭蛋機首屏下方只有「SCROLL TO EXPLORE」，沒有標語，也沒有下載或許願池按鈕；ABOUT 區塊的標題和內文被藍色色塊遮住，只露出「升級」「NYCU」。comics-zh desktop：頁面大標竟是「開發日誌」，說明文字也是開發日誌的。                                                                                                                                                                                                     |
| 字體排印   | 7    | news-zh 和 devlog-zh desktop：分類標籤是和內文同級的黑字（「News」「回顧」），層級不清楚；摘要 12px 偏小。devlog-post-zh desktop：程式碼顯示成「\`layout.css\`」，Markdown 反引號外露。                                                                                                                                                                                                                                             |
| 色彩       | 7.5  | 品牌藍和深色模式大致成立（news-dark-zh、wish-fulfilled-dark-en）。news-loading-zh desktop 的圖片區是純白，和卡片同色。wish-form-error-zh 的錯誤只用一行小紅字表示。                                                                                                                                                                                                                                                                 |
| 間距與版面 | 5.5  | home-zh desktop：ABOUT 的文字和藍色影片色塊重疊、被截斷；NYCU BUS 的手機框和手部插圖不見，地圖截圖以原始方圖塞在清單下方。news-zh desktop：兩欄卡片，有圖和無圖混排，高度差很大（「11 月 16 日凌晨系統維護」那張卡右下是大片空白）。devlog-zh desktop：「無障礙稽核紀錄」卡片高約 400px，但只有三行字。                                                                                                                             |
| 一致性     | 5    | wish-zh 和 admin desktop 的 TopBar 是「認識我們／常見問題／夥伴徵才」，其他頁是「關於我們／FAQ／加入我們」。麵包屑有「NYCU LIFE / NEWS」英文大寫和「WISH POOL / PRODUCT 06」兩種寫法。404 和 503 沒有空狀態插圖。上一篇／下一篇在 news-post 是純文字連結。                                                                                                                                                                          |
| 資訊密度   | 6.5  | comics-zh desktop：兩欄巨大的 EP 封面，一屏只看得到約 4 集。news-zh desktop：兩欄寬卡加 256px 高封面，一屏約 3 則。admin-pending-zh desktop：一屏約 5 筆，四顆按鈕都攤開。                                                                                                                                                                                                                                                          |
| 導覽       | 6    | TopBar 沒有「最新消息」入口（news-zh desktop 也沒有）。menu-open-zh mobile：選單只有 6 項，少了最新消息。devlog-post-zh：上一篇／下一篇是文字連結，點擊範圍小。404 唯一的出路是「NYCU LIFE →」，沒有說明。                                                                                                                                                                                                                          |
| 狀態與回饋 | 4    | wish-error-zh desktop：列表區顯示「這一池還很安靜，成為第一個許願的人吧」，真正的錯誤只是表單內一行小紅字「暫時連不上許願池」，錯誤偽裝成空資料。news-empty-zh desktop：完全沒有內容和提示。devlog-empty 和 comics-empty：只有一句話加英文「Page 1 of 1」。news-loading：圖片區純白、沒有骨架。ghost-down-zh desktop：整頁只有一行等寬英文「Content is temporarily unavailable. Please try again shortly.」，沒有樣式、頁首或出路。 |
| 響應式     | 6    | wish-zh mobile 表單排列合理；admin-reply-zh mobile 按鈕兩欄排列。menu-open-zh mobile：選單下方露出被截斷的扭蛋機。home-zh desktop 的產品區在桌面就已經是手機式直排（地圖圖片堆在清單下方），左右版面失衡。                                                                                                                                                                                                                          |
| 文案       | 4.5  | 內部術語外露：「WISH POOL / PRODUCT 06」、頁尾「Crafted with care by the NYCU LIFE 內容管理」（中英混雜）。404 在中文頁顯示「Page not found」。「Page 1 of 1」未翻譯。admin-signed-out-zh 寫「任何成功通過 NYCU LIFE OAuth 的帳號都可以進入」，系統術語和權限說明外露。                                                                                                                                                             |
| 無障礙     | 6.5  | wish-form-error-zh 的錯誤只用小紅字，放在隱私說明下方，離輸入框遠，輸入框也沒有紅框。admin 顯示截斷的完整 UUID 等寬灰字，難讀。文章頁上一篇／下一篇的點擊範圍小。                                                                                                                                                                                                                                                                   |
| 動畫與轉場 | 5    | 載入只有一行「正在聽大家的願望…」文字（wish-loading-zh desktop），news-loading 是空白圖片區。看得到的線索只有「顯示詳情 ⌄」和選單展開；狀態切換的視覺回饋少，保守給分。                                                                                                                                                                                                                                                             |

要保留的優點：

- 扭蛋機首屏插圖本身完整，品牌識別強（home-zh desktop 頂部）。
- 許願池手繪卡片、膠帶和分類膠囊的視覺語彙和 +1 實心回饋（wish-supported-zh mobile）。
- 管理後台手機版把「撰寫回覆／標記已實現／下架／核准公開」做成兩欄大按鈕，點擊範圍足夠（admin-pending-dark-zh mobile）。
- 文章頁的閱讀版面、行長和封面比例（devlog-post-zh desktop）。
- 深色模式的卡片和文字對比大致成立（news-dark-zh desktop）。

最重要的五個問題（由嚴重到輕微）：

1. [間距與版面] [home-zh] [desktop] ABOUT 章節的藍色影片色塊蓋住標題和內文（只露出「升級」「NYCU」）；NYCU BUS 章節的手機框不見，地圖原圖堆在清單下方 —— 首頁是第一印象，重疊和截斷會直接被當成網站壞了 —— 修正影片區的尺寸和層級，恢復雙欄加手機框插圖。
2. [狀態與回饋] [wish-error-zh、ghost-down-zh] [兩者] 許願池載入失敗時列表顯示「這一池還很安靜」的空狀態；內容服務故障時整頁只有一行無樣式英文 —— 使用者會誤以為沒人許願，或以為網站掛了而離開 —— 錯誤必須有獨立狀態（標題、說明、重新載入），503 要保留網站外框並提供前往許願池的出路。
3. [文案／資訊層級] [comics-zh、comics-empty-zh] [desktop] 漫畫專區的大標和說明顯示「開發日誌」；空狀態也和開發日誌完全一樣 —— 使用者無法確認自己在哪個頁面 —— 改用漫畫自己的標題、說明和空狀態文案。
4. [一致性／導覽] [wish-zh、admin-pending-zh、news-zh] [兩者] TopBar 用詞在許願池頁和其他頁不同（認識我們 vs 關於我們、夥伴徵才 vs 加入我們），且全站沒有「最新消息」入口 —— 同一個網站換頁就換詞，最新消息也找不到 —— 統一導覽標籤並補上最新消息。
5. [文案／狀態] [news-empty-zh、devlog-empty-zh、not-found-zh、devlog-post-zh] [兩者] 最新消息空狀態完全空白；開發日誌空狀態出現「Page 1 of 1」；中文 404 顯示「Page not found」；程式碼外露反引號；頁尾「內容管理」和「PRODUCT 06」等內部字樣外露 —— 未翻譯和系統字串會降低可信度 —— 每個空或錯誤狀態補上中文說明、插圖和下一步，並清掉內部字串。

```json
{
	"A": {
		"scores": {
			"資訊層級": 8.5,
			"字體排印": 8,
			"色彩": 8.5,
			"間距與版面": 8,
			"一致性": 8,
			"資訊密度": 7.5,
			"導覽": 8,
			"狀態與回饋": 8.5,
			"響應式": 8,
			"文案": 8,
			"無障礙": 7.5,
			"動畫與轉場": 7
		},
		"issues": [
			"[一致性/響應式] ghost-down-zh 兩者：503 頁頁首頁尾換成另一套樣式（無導覽、字體不同、◐ 圖示），手機版 Logo 過大、許願池貼紙與主題按鈕上下錯位",
			"[間距與版面] wish-zh desktop：願望卡瀑布流三欄高度不齊，左與中欄底部留下 140–300px 空白",
			"[資訊密度] devlog-zh、comics-zh 兩者：封面已印標題，卡片內又重複標題；漫畫摘要只有『第 N 集』",
			"[狀態與回饋/無障礙] admin-pending-zh 兩者：撰寫回覆與標記已實現收在『更多』，紅色『下架』緊貼『核准公開』，手機版排第一，易誤觸",
			"[導覽/文案] home-en、wish-fulfilled-dark-en desktop：EN 導覽『Dev log (中文)』『News (中文)』冗長，且 TopBar 沒有標示目前所在頁"
		]
	},
	"B": {
		"scores": {
			"資訊層級": 9,
			"字體排印": 9,
			"色彩": 9,
			"間距與版面": 9,
			"一致性": 9,
			"資訊密度": 8.5,
			"導覽": 8.5,
			"狀態與回饋": 7,
			"響應式": 9,
			"文案": 9,
			"無障礙": 7.5,
			"動畫與轉場": 7.5
		},
		"issues": [
			"[狀態與回饋] canny-roadmap 兩者：只呈現正常資料，看不到空欄、投票回饋或錯誤處理",
			"[資訊密度] canny-roadmap desktop：1440 寬下欄位內容稀疏、留白過多",
			"[無障礙] linear-home、raycast-home 兩者：深色底上的次要說明文字對比偏低",
			"[導覽] linear-changelog、raycast-blog 兩者：看不到分頁或上一篇／下一篇的回溯路徑",
			"[動畫與轉場] raycast-home mobile：裝飾光暈拉長首屏，CTA 位置偏下"
		]
	},
	"C": {
		"scores": {
			"資訊層級": 6,
			"字體排印": 7,
			"色彩": 7.5,
			"間距與版面": 5.5,
			"一致性": 5,
			"資訊密度": 6.5,
			"導覽": 6,
			"狀態與回饋": 4,
			"響應式": 6,
			"文案": 4.5,
			"無障礙": 6.5,
			"動畫與轉場": 5
		},
		"issues": [
			"[間距與版面] home-zh desktop：ABOUT 的藍色影片色塊蓋住標題與內文；NYCU BUS 的手機框消失，地圖原圖堆在清單下方",
			"[狀態與回饋] wish-error-zh、ghost-down-zh 兩者：載入失敗顯示成『這一池還很安靜』的空狀態；503 只有一行無樣式英文純文字",
			"[文案/資訊層級] comics-zh、comics-empty-zh desktop：漫畫專區大標與說明是『開發日誌』，空狀態也與開發日誌相同",
			"[一致性/導覽] wish-zh、admin、news-zh 兩者：導覽在不同頁用不同詞（認識我們/關於我們、夥伴徵才/加入我們），且全站沒有『最新消息』入口",
			"[文案/狀態] news-empty、devlog-empty、not-found、devlog-post 兩者：最新消息空狀態空白、『Page 1 of 1』與『Page not found』未翻譯、反引號外露、『PRODUCT 06』『內容管理』等內部字串外露"
		]
	}
}
```
