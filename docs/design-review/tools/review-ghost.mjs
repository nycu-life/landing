#!/usr/bin/env node
// Local design-review Ghost helper. Never point it at production.
//
//   node review-ghost.mjs session            # owner session → $REVIEW_DIR/session.json (0600)
//   node review-ghost.mjs seed               # extra fake news / dev log posts with raster covers
//   node review-ghost.mjs posts draft|published [comics|devlog|news|all]
//
// Environment: GHOST_ADMIN_URL (must be 127.0.0.1/localhost), GHOST_OWNER_EMAIL,
// GHOST_OWNER_PASSWORD, REVIEW_DIR (default /tmp/nycu-hc).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, chmodSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const base = (process.env.GHOST_ADMIN_URL ?? 'http://127.0.0.1:2379').replace(/\/$/, '');
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname))
	throw new Error('review-ghost only talks to a local Ghost.');
const dir = process.env.REVIEW_DIR ?? '/tmp/nycu-hc';
const api = `${base}/ghost/api/admin`;
let cookie = '';

async function call(method, route, { json, body } = {}) {
	const response = await fetch(api + route, {
		method,
		headers: {
			Origin: new URL(base).origin,
			'Accept-Version': 'v6.0',
			...(cookie ? { Cookie: cookie } : {}),
			...(json ? { 'Content-Type': 'application/json' } : {})
		},
		body: json ? JSON.stringify(json) : body
	});
	const set = response.headers.getSetCookie?.() ?? [];
	if (set.length) cookie = set.map((c) => c.split(';')[0]).join('; ');
	const text = await response.text();
	if (!response.ok)
		throw new Error(`${method} ${route} → ${response.status} ${text.slice(0, 300)}`);
	try {
		return text ? JSON.parse(text) : {};
	} catch {
		return { text };
	}
}

async function signIn() {
	await call('POST', '/session/', {
		json: { username: process.env.GHOST_OWNER_EMAIL, password: process.env.GHOST_OWNER_PASSWORD }
	});
}

function cover(name, from, to, shape) {
	const out = path.join(mkdtempSync(path.join(tmpdir(), 'cover-')), `${name}.jpg`);
	execFileSync('magick', [
		'-size',
		'1600x900',
		`gradient:${from}-${to}`,
		'-fill',
		'rgba(255,255,255,0.28)',
		'-draw',
		shape,
		'-fill',
		'rgba(255,255,255,0.16)',
		'-draw',
		'circle 1300,200 1300,420',
		'-quality',
		'86',
		out
	]);
	return out;
}

async function upload(file) {
	const form = new FormData();
	form.set('file', new Blob([readFileSync(file)], { type: 'image/jpeg' }), path.basename(file));
	form.set('purpose', 'image');
	return (await call('POST', '/images/upload/', { body: form })).images[0].url;
}

const paragraphs = (...items) => items.map((p) => `<p>${p}</p>`).join('');
const NEWS = [
	{
		slug: 'fall-2026-recruiting',
		title: '115 學年度上學期夥伴招募開跑',
		tags: ['公告'],
		from: '#2f6bff',
		to: '#7fb2ff',
		shape: 'roundrectangle 140,520 760,780 40,40',
		excerpt: '前端、後端、設計與營運，四個職缺同時開放，11 月 30 日截止。',
		html: paragraphs(
			'NYCU LIFE 正在招募新夥伴。這學期開放前端、後端、產品設計與社群營運四個職缺，歡迎對校園服務有想法的同學加入。',
			'報名表填寫約 10 分鐘，我們會在一週內回覆面談時間。'
		)
	},
	{
		slug: 'app-v3-release',
		title: 'NYCU LIFE App 3.0：首頁小工具與深色模式',
		tags: ['產品更新'],
		from: '#0b1f5c',
		to: '#2f6bff',
		shape: 'roundrectangle 980,180 1240,720 48,48',
		excerpt: '重新設計的首頁可以自由排列校車、課表與活動小工具。',
		html: paragraphs(
			'3.0 版把最常用的資訊都搬到首頁：下一班校車、今天的課、附近的活動。',
			'每個小工具都可以長按調整位置，也支援系統的深色模式。'
		)
	},
	{
		slug: 'campus-tour-booth',
		title: '校慶園遊會：來 NYCU LIFE 攤位轉扭蛋',
		tags: ['活動'],
		from: '#ff8a3d',
		to: '#ffd166',
		shape: 'circle 520,450 520,700',
		excerpt: '11 月 22 日光復校區博愛路，現場下載 App 就能轉一次扭蛋。',
		html: paragraphs(
			'今年校慶，我們把首頁的扭蛋機搬到現場了。',
			'攤位在博愛路中段，下午 1 點到 5 點。'
		)
	},
	{
		slug: 'maintenance-nov',
		title: '11 月 16 日凌晨系統維護',
		tags: ['公告'],
		excerpt: '凌晨 2:00–4:00 校車與課表資料暫停更新。',
		html: paragraphs(
			'為了升級資料庫，11 月 16 日凌晨 2:00 到 4:00 之間，校車即時位置與課表同步會暫停。維護完成後會自動恢復，不需要更新 App。'
		)
	},
	{
		slug: 'nycu-maps-beta',
		title: 'NYCU MAPS 公開測試：室內地圖、無障礙路線與即時開放狀態一次到位，歡迎同學一起回報錯誤',
		tags: ['產品更新'],
		from: '#1b998b',
		to: '#8fe3cf',
		shape: 'polygon 200,800 600,260 1000,800',
		excerpt: '第一批涵蓋工程三館、浩然圖書館與學生活動中心。',
		html: paragraphs(
			'NYCU MAPS 開放公開測試，先從三棟建築的室內地圖開始。',
			'找不到路或資訊錯誤時，可以直接在地圖上長按回報。'
		)
	},
	{
		slug: 'partner-library',
		title: '與圖書館合作：座位即時空位上線',
		tags: ['合作'],
		from: '#6c5ce7',
		to: '#a29bfe',
		shape: 'rectangle 220,260 700,760',
		excerpt: '浩然圖書館各樓層的空位數，每 5 分鐘更新一次。',
		html: paragraphs('感謝圖書館提供資料，現在可以在 App 裡看到各樓層的空位數。')
	}
];
const DEVLOG = [
	{
		slug: 'design-system-glass',
		title: '把 Liquid Glass 設計系統搬進 Ghost',
		tags: ['設計'],
		from: '#2f6bff',
		to: '#c3d7ff',
		shape: 'roundrectangle 300,240 1300,660 60,60',
		excerpt: '從 Svelte 元件抽出 token，讓佈景主題和許願池共用同一套顏色與圓角。',
		html: `<p>官網改成 Ghost 原生主題後，我們需要讓兩套程式使用同一套設計 token。</p><h2>為什麼不直接複製 CSS</h2><p>複製一次很快，但之後每次調整顏色都要改兩個地方。我們改成在建置時從 Svelte 元件抽出樣式。</p><ul><li>顏色與圓角都定義在 <code>layout.css</code></li><li>主題建置時一起打包</li><li>許願池直接使用同一份檔案</li></ul><blockquote>設計 token 是團隊之間的合約，不是實作細節。</blockquote><h2>下一步</h2><p>接下來會把字型載入也整理成同一套，減少首頁需要下載的檔案。</p><pre><code>pnpm cms:theme-build\npnpm cms:theme-check</code></pre>`
	},
	{
		slug: 'bus-data-pipeline',
		title: '校車資料管線：從 PDF 時刻表到即時位置',
		tags: ['校園公車', '後端'],
		from: '#0b1f5c',
		to: '#4f7cff',
		shape: 'roundrectangle 160,560 1440,700 30,30',
		excerpt: '我們如何把三種格式的時刻表整理成一份 API。',
		html: paragraphs(
			'校車資料原本散落在 PDF、網頁表格與 GPS 回傳三個地方。',
			'這篇記錄我們如何把它們整合成一份每 15 秒更新的 API。'
		)
	},
	{
		slug: 'accessibility-audit',
		title: '無障礙稽核紀錄：對比、焦點與螢幕閱讀器',
		tags: ['設計', '無障礙'],
		excerpt: '用 VoiceOver 和 TalkBack 把 App 主要流程走過一遍。',
		html: paragraphs(
			'這學期我們邀請兩位視障同學一起測試 App。',
			'最大的問題是自訂按鈕缺少標籤，已經在 3.0.2 修正。'
		)
	},
	{
		slug: 'wishpool-moderation',
		title: '許願池審核流程：匿名但不失控',
		tags: ['許願池'],
		from: '#ff6b9a',
		to: '#ffc2d4',
		shape: 'circle 800,450 800,700',
		excerpt: '新願望先進審核佇列，管理員用 NYCU One 登入處理。',
		html: paragraphs(
			'匿名許願讓大家敢說真話，但也需要防止洗版與個資外洩。',
			'我們用簽章 cookie 限制重複 +1，並讓所有新願望先經過審核。'
		)
	},
	{
		slug: 'semester-retro-114-2',
		title: '114-2 學期回顧：12 次發版、3 個新功能',
		tags: ['回顧'],
		from: '#1b998b',
		to: '#b8f2e6',
		shape: 'polygon 300,760 800,200 1300,760',
		excerpt: '這學期的數字、踩過的坑，以及下學期想做的事。',
		html: paragraphs(
			'這學期我們發了 12 個版本，新增 NYCU EVENTS、課表匯出與校車擁擠度。',
			'下學期的重點是地圖與無障礙路線。'
		)
	}
];

async function ensurePosts(entries, tagName) {
	for (const [index, entry] of entries.entries()) {
		const existing = await call('GET', `/posts/slug/${entry.slug}/`).catch(() => null);
		if (existing?.posts?.length) {
			console.log(`• ${entry.slug} exists`);
			continue;
		}
		const feature = entry.from
			? await upload(cover(entry.slug, entry.from, entry.to, entry.shape))
			: null;
		const published = new Date(Date.UTC(2026, 9, 1 + index * 5, 4)).toISOString();
		await call('POST', '/posts/?source=html', {
			json: {
				posts: [
					{
						title: entry.title,
						slug: entry.slug,
						html: entry.html,
						status: 'published',
						published_at: published,
						custom_excerpt: entry.excerpt,
						feature_image: feature,
						feature_image_alt: feature ? entry.title : null,
						tags: [...(tagName ? [{ name: tagName }] : []), ...entry.tags.map((name) => ({ name }))]
					}
				]
			}
		});
		console.log(`• created ${entry.slug}`);
	}
}

const FILTERS = {
	comics: 'tag:hash-comics',
	devlog: 'tag:hash-devlog+tag:-hash-comics',
	news: 'tag:-[hash-devlog,hash-comics]',
	all: ''
};

async function setPosts(status, which) {
	const from = status === 'draft' ? 'published' : 'draft';
	const filter = [`status:${from}`, FILTERS[which]].filter(Boolean).join('+');
	const { posts } = await call(
		'GET',
		`/posts/?limit=all&fields=id,updated_at,slug&filter=${encodeURIComponent(filter)}`
	);
	for (const post of posts)
		await call('PUT', `/posts/${post.id}/`, {
			json: { posts: [{ status, updated_at: post.updated_at }] }
		});
	console.log(`${posts.length} ${which} posts → ${status}`);
}

const [command, ...args] = process.argv.slice(2);
await signIn();
if (command === 'session') {
	const file = path.join(dir, 'session.json');
	const host = new URL(base).hostname;
	writeFileSync(
		file,
		JSON.stringify({
			cookies: cookie.split('; ').map((pair) => {
				const [name, ...value] = pair.split('=');
				return {
					name,
					value: value.join('='),
					domain: host,
					path: '/',
					expires: -1,
					secure: false
				};
			})
		}),
		{ mode: 0o600 }
	);
	chmodSync(file, 0o600);
	console.log(file);
} else if (command === 'seed') {
	await ensurePosts(NEWS, null);
	await ensurePosts(DEVLOG, '#devlog');
} else if (command === 'posts') {
	await setPosts(args[0], args[1] ?? 'all');
} else {
	console.error('usage: session | seed | posts draft|published [comics|devlog|news|all]');
	process.exit(2);
}
