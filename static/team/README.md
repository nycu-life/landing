# 團隊成員照片 / Team member photos

成員資料的單一來源是 [`src/lib/content/team.ts`](../../src/lib/content/team.ts)。
每位成員會在 build 時自動產生一頁 `/(team)/<slug>` 的靜態頁面。

## 加照片（最簡單）

把檔案放在這個資料夾，檔名用成員的 `slug`：

```
static/team/<slug>.jpg      # 大頭照（會用在團隊列表與個人頁；放了就自動顯示，沒放則用名字首字頭像）
```

例如 `游宗易`（slug `you-zongyi`）→ `static/team/you-zongyi.jpg`。

## 補其他欄位

在 `src/lib/content/team.ts` 對應成員加上：

**身份**與**組別歸屬**是分開的（一個人可同時在多個組，都連到同一頁）。

1) 在 `members` 加這個人的「身份」（不含組別/職責）：

```ts
{
  slug: 'you-zongyi',
  name: '游宗易',
  program: '資工系',
  intro: '想對大家說的一段話…',          // 個人簡介
  photo: '/team/you-zongyi.jpg',          // 可省略，預設就是這個路徑
  gallery: ['/team/you-zongyi/1.jpg', '/team/you-zongyi/2.jpg'],  // 2–3 張其他照片
  socials: [
    { kind: 'github', url: 'https://github.com/...' },
    { kind: 'linkedin', url: 'https://linkedin.com/in/...' },
    { kind: 'website', url: 'https://...' },
    { kind: 'instagram', url: 'https://instagram.com/...' },
    { kind: 'email', url: 'mailto:someone@nycu.one' }
  ]
}
```

2) 在 `assignments` 加他屬於哪些組（可多筆，每組各自的職責）：

```ts
{ member: 'you-zongyi', department: 'engineering', role: '開發' },
{ member: 'you-zongyi', department: 'admin', role: '行政' }   // 同一人也出現在行政組
```

`socials.kind` 支援：`github` / `linkedin` / `website` / `instagram` / `threads` / `x` / `facebook` / `youtube` / `email`。
`gallery` 圖片建議放在 `static/team/<slug>/` 底下。
