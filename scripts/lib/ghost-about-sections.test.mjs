import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aboutSections } from './ghost-about-sections.mjs';

test('preserves edited paragraphs, links, images and milestone dates when splitting Ghost HTML', () => {
	const html =
		'<p>編輯後的介紹 &amp; more</p><p>第二段</p><h2>願景</h2><figure><img src="https://example.org/art.png" alt="作品"></figure><p><a href="/wishpool/">許願</a></p><h2 id="ghost-generated-id">一路走來</h2><h3>2026 — 上線 — 新版本</h3><p>原來的內容</p>';
	const source = { slug: 'theme-en-about', title: 'Edited About', html };
	const result = aboutSections(source, 'en', 'https://example.org');
	assert.equal(source.html, html);
	assert.equal(result.length, 3);
	assert.match(result[0].html, /第二段/);
	assert.match(result[1].html, /alt="作品"/);
	assert.match(result[1].html, /href="\/wishpool\/"/);
	assert.equal(result[1].feature_image, 'https://example.org/art.png');
	assert.equal(result[2].title, '上線 — 新版本');
	assert.equal(result[2].custom_excerpt, '2026');
	assert.ok(result.every((p) => p.canonical_url === 'https://example.org/en/about/'));
});

test('rejects an unfamiliar structure before any writes can start', () => {
	assert.throws(
		() =>
			aboutSections(
				{ slug: 'edited', html: '<p>A custom article</p>' },
				'en',
				'https://example.org'
			),
		/Unrecognized/
	);
	assert.throws(
		() =>
			aboutSections(
				{
					slug: 'edited',
					html: '<p>Intro</p><h2>Vision</h2><p>Body</p><h2>History</h2><p>Custom preface</p><h3>No date</h3><p>Body</p>'
				},
				'en',
				'https://example.org'
			),
		/Unrecognized/
	);
});
