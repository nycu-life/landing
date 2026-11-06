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

編輯後用 `/`、`/about/`，再用導覽列的語系切換（語系仍使用 cookie）、手機與深色模式各看一次。若要新增一般公開頁，建立不以 `site-` 開頭且visibility 為 Public 的 Page，它會以 `/pages/<slug>/` 顯示並列入 sitemap。
