// Fill the local review Wish API with fake wishes in every admin state.
//   WISH_URL=http://127.0.0.1:13011 WISH_ADMIN_TOKEN=… node seed-wishes.mjs
// Local only: refuses any non-loopback URL.
const base = (process.env.WISH_URL ?? 'http://127.0.0.1:13011').replace(/\/$/, '');
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname))
	throw new Error('local Wish API only');
const admin = { authorization: `Bearer ${process.env.WISH_ADMIN_TOKEN}` };

const WISHES = [
	[
		'想知道健身房現在有多少人',
		'出發前就能判斷要不要換個時段。',
		'life',
		'published',
		'open',
		'我們正在和體育室討論人流資料的串接方式，有進度會第一時間更新！',
		42
	],
	['希望校車能顯示即時擁擠度', '', 'transport', 'published', 'open', '', 31],
	['想找有插座的自習空間', '希望地圖上也能標示開放時間。', 'learning', 'published', 'open', '', 18],
	['希望失物招領資訊可以整合', '', 'life', 'published', 'open', '', 55],
	['想知道餐廳今天有沒有營業', '', 'life', 'published', 'open', '', 7],
	[
		'博愛校區到光復校區的接駁車可以增加晚上班次嗎？期末考週常常搭不到車，只好叫計程車回宿舍',
		'',
		'transport',
		'published',
		'open',
		'',
		26
	],
	[
		'希望可以預約討論室',
		'目前只能現場登記，常常跑過去才發現沒位子。',
		'space',
		'published',
		'open',
		'',
		12
	],
	['課表可以顯示教室在地圖上的位置', '', 'learning', 'published', 'open', '', 9],
	[
		'希望校車可以看到即時位置',
		'',
		'transport',
		'published',
		'fulfilled',
		'校車即時位置已經在 NYCU LIFE App 上線！打開「交通」分頁就能看到每一班車目前的位置與預估到站時間。',
		128
	],
	[
		'想在一個地方看到各餐廳的營業時間',
		'',
		'life',
		'published',
		'fulfilled',
		'餐廳資訊頁已整合二餐、女二餐與小木屋的營業時間，假日與連假也會同步更新。',
		64
	],
	['希望可以把課表匯出到手機行事曆', '', 'learning', 'published', 'fulfilled', '', 37],
	[
		'請聯絡 0912345678 一起做專案',
		'這則內容包含可能的私人資訊，需要先審核。',
		'other',
		'pending',
		'open',
		'',
		1
	],
	['宿舍洗衣機可以線上看空位嗎', '每次下樓都滿。', 'life', 'pending', 'open', '', 1],
	['希望 App 有英文版的校車站名', '', 'transport', 'pending', 'open', '', 1],
	['廣告：代寫報告請私訊', '', 'other', 'hidden', 'open', '', 1]
];

async function call(method, path, body, headers = {}) {
	const response = await fetch(base + path, {
		method,
		headers: { 'content-type': 'application/json', origin: base, ...headers },
		body: body ? JSON.stringify(body) : undefined
	});
	const json = await response.json().catch(() => ({}));
	if (!response.ok)
		throw new Error(`${method} ${path} → ${response.status} ${JSON.stringify(json)}`);
	return json;
}

const existing = await call('GET', '/api/wishes/admin?visibility=published', null, admin);
if (existing.data.length) {
	console.log('wishes already seeded');
	process.exit(0);
}
for (const [title, detail, category, visibility, status, reply, supports] of WISHES) {
	// Each create needs a fresh anonymous visitor so the rate limit does not trip.
	const { data } = await call(
		'POST',
		'/api/wishes',
		{ title, detail, category },
		{
			'x-forwarded-for': `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`
		}
	);
	const update = { visibility };
	if (status === 'fulfilled') update.status = 'fulfilled';
	if (reply) update.reply = reply;
	if (visibility !== 'pending') await call('PATCH', `/api/wishes/admin/${data.id}`, update, admin);
	for (let i = 1; i < supports && visibility === 'published' && status === 'open'; i++) {
		await fetch(`${base}/api/wishes/${data.id}/support`, {
			method: 'POST',
			headers: { origin: base, 'x-forwarded-for': `10.8.${Math.floor(i / 250)}.${i % 250}` }
		});
	}
	console.log(`• ${visibility}/${status} ${title}`);
}
