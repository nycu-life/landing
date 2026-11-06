# Ghost 整站內容編輯速查

這份文件給網站管理員使用。Ghost 是內容資料庫，SvelteKit 保留版面、動畫、互動與 API；發布後不需要 GitHub 或重新部署。

## 你可以改什麼

| Ghost Page 類型                                | 會改變的地方                            |
| ---------------------------------------------- | --------------------------------------- |
| `site-zh-tw-home` / `site-en-home`             | 首頁標題、簡介、Hero、章節標籤          |
| `site-*-home-about`, `products`, `faq`, `join` | 首頁各章節文案                          |
| `site-*-about`                                 | About 頁標題、願景、里程碑區塊標題      |
| `site-*-footer`, `navigation`, `settings`      | 導覽、頁尾、聯絡連結、影片 ID、招募開關 |
| `site-*-product-*`                             | 產品名稱、簡介、特色、狀態、連結、畫面  |
| `site-*-faq-*`                                 | FAQ 問題、答案與排序                    |
| `site-*-role-*`                                | 招募職缺、組別、說明、表單連結          |
| `site-*-vision-*`, `site-*-milestone-*`        | About 卡片與時間軸項目                  |

## 編輯一筆資料

集合與一般頁面的標題是畫面標題；固定區段 Page 的標題只是後台辨識名稱。內文中每個 H2 是欄位名稱，下面的段落是欄位內容。例如產品頁需要：

```text
H2 簡介
一段產品簡介
H2 英文副標
Campus shuttle
H2 特色（每行一項）
即時到站
路線查詢
收藏常用站點
H2 配色（blue／lime／sun）
blue
H2 狀態（live／soon／dev）
live
H2 圖示（bus／coz／activity／map）
bus
H2 連結
https://bus.nycu.one
H2 排序
1
```

FAQ、職缺和里程碑用同樣方式編輯。集合項目是獨立 Page：複製一筆、改成唯一 slug、修改排序，即可新增；下架該 Page 即可移除。頁面必須是 **Published** 才會被網站讀到。

## 不能改什麼

Ghost 不控制 SvelteKit 的 CSS、滾動動畫、Wish Pool API、登入與權限。內文欄位會驗證連結與必要欄位，錯誤內容會暫時沿用最近成功版本並記錄伺服器錯誤；修正後等快取更新即可。

編輯後用 `/`、`/about/`，再用導覽列的語系切換（語系仍使用 cookie）、手機與深色模式各看一次。若要新增一般公開頁，建立不以 `site-` 開頭且 visibility 為 Public 的 Page，它會以 `/pages/<slug>/` 顯示並列入 sitemap。

## 中文文案排版

固定文案、Ghost Page、開發日誌與漫畫說明遵循[中文文案排版指北](https://github.com/sparanoid/chinese-copywriting-guidelines)。編輯時直接在原文排好格式，讓搜尋摘要、替代文字與複製後的內容也一致：

- 中文與英文、阿拉伯數字之間留半形空格，例如「使用 NYCU LIFE」、「115 學年」、「共 10 集」。中文數字仍寫「第一集」。
- 數字與計量單位分開，例如「20 MB」；百分比與角度維持「15%」、「90°」。
- 中文句子使用全形標點與「直角引號」，標點前後不另外加空格，例如「開啟 App，即可查詢。」；完整英文句子、網址與程式碼保留原本標點。
- 數字及英文字母使用半形；避免連續的驚嘆號或問號。省略號、破折號等標點依其用途保留。
- 產品名稱依官方大小寫，例如 NYCU LIFE、NYCozU、GitHub、YouTube、iOS；不要對品牌名稱做全域替換。
- 中文連結前後不額外插入空格；若連結文字是英文或數字，仍遵守中英與數字間距。
- 全站原始碼與文案不使用 U+00B7 或 U+30FB 作為分隔符。依語意改用冒號、頓號、斜線或完整語句，英文標籤使用半形標點。

本機固定文案在 `messages/zh-tw.json` 與 `src/lib/content/`。日期與阿拉伯數字集數由 `src/lib/typography.ts` 補上實際空格，沿用各畫面的語系、日期格式與時區設定。

全站的 `text-autospace: normal` 是動態內容的顯示補強：支援的瀏覽器會在中文與英數之間補上視覺間距，也能處理行內連結。它不修改 Ghost／許願池原文、HTML、複製文字或 SEO 摘要，不能校正標點、品牌大小寫，也不能替代舊瀏覽器需要的原文空格。程式碼及輸入欄位停用此設定。

`cms:seed-site` 只新增尚不存在的 Page，**不會更新已發布文案**。已有的 Ghost Page 須由編輯者修正文案並發布；不要用重新匯入覆蓋既有內容。修正後依 `AGENTS.md` 執行中英文、明暗模式及桌機／平板／手機的完整視覺驗證。
