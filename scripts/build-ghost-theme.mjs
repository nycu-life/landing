#!/usr/bin/env node
import { readFile, writeFile, mkdir, cp, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { zipSync } from 'fflate';
import { build } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'theme');
const output = path.join(root, 'dist/ghost-theme');
const read = (file) => readFile(path.join(source, file), 'utf8');
const escape = (s) =>
	s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'assets'), { recursive: true });
const styles = ['src/routes/layout.css'];
for (const component of [
	'src/lib/components/landing/TopBar.svelte',
	'src/lib/components/landing/LocaleSwitch.svelte',
	'src/lib/components/landing/PrototypeStory.svelte',
	'src/routes/+page.svelte',
	'src/lib/components/landing/SiteFooter.svelte',
	'src/routes/devlog/+page.svelte',
	'src/routes/devlog/[slug]/+page.svelte',
	'src/routes/about/+page.svelte'
]) {
	const text = await readFile(path.join(root, component), 'utf8');
	let css = text.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1].replace(/:global\(([^)]+)\)/g, '$1');
	if (component.endsWith('/PrototypeStory.svelte'))
		css = css.replace(/\.faq-item button/g, ':is(.faq-item button, .faq-item summary)');
	// Svelte scoped the About artwork classes. Keep that isolation in the native theme.
	if (component === 'src/routes/about/+page.svelte')
		css = css.replace(/\.wish-(art|copy|card|link)\b/g, '.about-wish-$1');
	styles.push(css);
}
const generatedCss = path.join(source, '.generated.css');
await writeFile(
	generatedCss,
	`@import '../${styles.shift()}';\n@source './**/*.hbs';\n${styles.join('\n')}\n${await read('site.css')}`
);
try {
	await build({
		configFile: false,
		// Ghost serves this CSS and its bundled fonts from the same /assets directory.
		base: './',
		plugins: [tailwindcss()],
		build: {
			outDir: path.join(output, 'assets'),
			emptyOutDir: false,
			cssCodeSplit: true,
			rollupOptions: {
				input: generatedCss,
				output: {
					assetFileNames: (asset) =>
						asset.names.some((n) => n.endsWith('.css')) ? 'site.css' : '[name]-[hash][extname]'
				}
			}
		}
	});
} finally {
	await rm(generatedCss, { force: true });
}
await cp(path.join(root, 'static'), path.join(output, 'assets'), { recursive: true });
await writeFile(
	path.join(output, 'assets/site.js'),
	`${await read('site.js')}\n${await read('story.js')}\n${await read('about.js')}`
);
for (const file of ['package.json', 'default.hbs', 'post.hbs', 'routes.yaml'])
	await cp(path.join(source, file), path.join(output, file));
await mkdir(path.join(output, 'partials'), { recursive: true });
for (const file of ['card', 'store-play', 'store-apple', 'appearance'])
	await cp(path.join(source, `partials/${file}.hbs`), path.join(output, `partials/${file}.hbs`));

for (const locale of ['zh-tw', 'en']) {
	const english = locale === 'en';
	const copy = JSON.parse(await readFile(path.join(root, `messages/${locale}.json`), 'utf8'));
	const values = {
		locale,
		lang: locale,
		prefix: english ? '/en' : '',
		otherHome: english ? '/' : '/en/',
		otherLocale: english ? 'zh-tw' : 'en',
		otherLabel: english ? '繁中' : 'EN',
		introTitle: JSON.stringify(`${copy.story_about_title_1} ${copy.story_about_title_2}`),
		zhCurrent: english ? 'false' : 'true',
		enCurrent: english ? 'true' : 'false',
		navigation: english ? '{{navigation type="secondary"}}' : '{{navigation}}',
		previousProduct: english ? 'Previous product' : '上一個產品',
		nextProduct: english ? 'Next product' : '下一個產品',
		enableFilmSound: english ? 'Play with sound' : '開啟聲音',
		// Articles (dev log, comics, news) are written in Chinese only; English covers
		// the home and About pages and never links to an English article list.
		devlogMore: english
			? ''
			: `<p class="milestone-more"><a href="/devlog/">${escape(copy.about_milestone_devlog_link)} →</a></p>`,
		section: 'DEVLOG',
		sectionTitle: copy.devlog_page_title,
		sectionDescription: copy.devlog_page_lede,
		emptyTitle: copy.devlog_empty_title,
		emptyBody: copy.devlog_empty_body,
		emptyHref: '/about/#milestones',
		emptyCta: copy.devlog_empty_cta
	};
	const render = (input, overrides = {}) => {
		const result = input
			.replace(
				/\[\[(\w+)\]\]/g,
				(_, key) =>
					overrides[key] ??
					values[key] ??
					(() => {
						throw new Error(`Missing theme value: ${key}`);
					})()
			)
			.replace(/\{\{copy\s+["']([^"']+)["']\s*\}\}/g, (_, key) => {
				if (typeof copy[key] !== 'string') throw new Error(`Missing translation: ${locale}/${key}`);
				return escape(copy[key]);
			});
		if (/\{\{copy\b|\[\[\w+\]\]/.test(result))
			throw new Error(`Unresolved theme translation marker for ${locale}.`);
		return result;
	};
	await mkdir(path.join(output, `partials/${locale}`), { recursive: true });
	for (const partial of ['home', 'header', 'footer', 'machine'])
		await writeFile(
			path.join(output, `partials/${locale}/${partial}.hbs`),
			render(await read(`partials/${partial}.hbs`))
		);
	for (const file of english
		? ['home', 'page', 'about', 'products']
		: ['home', 'page', 'index', 'about', 'products'])
		await writeFile(
			path.join(output, `${file}${english ? '-en' : ''}.hbs`),
			render(await read(`${file}.hbs`))
		);
	// Custom templates are selectable for normal English Pages in Admin.
	await writeFile(path.join(output, `custom-${locale}.hbs`), render(await read('page.hbs')));
	if (english) continue;
	await writeFile(
		path.join(output, 'comics.hbs'),
		render(await read('index.hbs'), {
			section: 'COMICS',
			sectionTitle: copy.comics_title,
			sectionDescription: copy.comics_lede,
			emptyTitle: copy.comics_empty_title,
			emptyBody: copy.comics_empty_body,
			emptyHref: '/devlog/',
			emptyCta: copy.comics_empty_cta
		})
	);
	await writeFile(path.join(output, 'news.hbs'), render(await read('news.hbs')));
	// Ghost renders error.hbs for every locale; articles and errors are Chinese first.
	await writeFile(path.join(output, 'error.hbs'), render(await read('error.hbs')));
}
await rm(path.join(root, 'dist/nycu-life.zip'), { force: true });
const archive = {};
async function collect(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const file = path.join(directory, entry.name);
		if (entry.isDirectory()) await collect(file);
		else
			archive[path.relative(output, file).split(path.sep).join('/')] = new Uint8Array(
				await readFile(file)
			);
	}
}
await collect(output);
await writeFile(path.join(root, 'dist/nycu-life.zip'), zipSync(archive));
console.log('Built dist/nycu-life.zip (Ghost theme); no credentials or CMS connection used.');
