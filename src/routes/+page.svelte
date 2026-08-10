<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { base } from '$app/paths';
	import FoxMark from '$lib/components/glass/FoxMark.svelte';
	import ProductIcon from '$lib/components/landing/ProductIcon.svelte';
	import Icon from '$lib/components/landing/Icon.svelte';
	import { products, INSTAGRAM_URL, type Product } from '$lib/content/landing';

	const productTags: Record<Product['id'], string> = {
		bus: 'TRANSIT',
		coz: 'ACADEMIC',
		activity: 'LIFE',
		map: 'CAMPUS'
	};
	const courses = [
		{
			level: '入門',
			icon: '✦',
			title: 'Figma 介面設計工作坊',
			date: '2026.03.14 (六)',
			teacher: '設計組 · 小雨',
			seats: '餘 8 / 30 席',
			action: '報名'
		},
		{
			level: '中階',
			icon: '</>',
			title: 'React 前端入門實作',
			date: '2026.03.21 (六)',
			teacher: '工程組 · 阿哲',
			seats: '餘 3 / 24 席',
			action: '報名'
		},
		{
			level: '入門',
			icon: '◌',
			title: '使用者研究基礎',
			date: '2026.04.02 (三)',
			teacher: '研究組 · Nina',
			seats: '額滿候補',
			action: '候補'
		}
	];
	const roles = ['# 行政組', '# 工程組', '# 設計組', '# 法務組'];
	const featuredStories = [
		{
			icon: '✦',
			kicker: 'Feature story',
			meta: '本月專題 · 8 min read',
			title: '我們如何打造 NYCU LIFE',
			excerpt: '從一次校園觀察，到真正被學生使用的產品。'
		},
		{
			icon: '◌',
			kicker: "Editor's pick",
			meta: '設計觀察 · 6 min read',
			title: '從校園問題開始設計',
			excerpt: '不是增加更多功能，而是更靠近使用者。'
		},
		{
			icon: '</>',
			kicker: 'Engineering',
			meta: '技術筆記 · 7 min read',
			title: '把校車資料變得可靠',
			excerpt: '定位漂移、訊號中斷，我們如何讓預估到站站得住腳。'
		}
	];

	const productHref = () => `${base}/products/`;
</script>

<svelte:head>
	<title>{m.meta_title()}</title>
	<meta name="description" content={m.meta_description()} />
</svelte:head>

<div class="marketing-page">
	<section class="marketing-hero" aria-labelledby="hero-title">
		<div class="hero-inner">
			<div class="hero-copy">
				<h1 id="hero-title">Debug your<br /><em>NYCU LIFE</em><br />problems</h1>
				<p>校園生活 交給我們 Debug</p>
				<div class="hero-stats">
					<div><strong>3+</strong><span>上線產品</span></div>
					<div><strong>30</strong><span>團隊組員</span></div>
				</div>
			</div>
			<div class="hero-orbit" aria-hidden="true">
				<div class="orbit-ring orbit-ring-large"></div>
				<div class="orbit-ring orbit-ring-small"></div>
				<div class="orbit-center"><FoxMark size={88} light /></div>
				<div class="orbit-tile orbit-one"><Icon name="book" class="h-7 w-7" /></div>
				<div class="orbit-tile orbit-two"><Icon name="pin" class="h-7 w-7" /></div>
				<div class="orbit-tile orbit-three"><Icon name="spark" class="h-7 w-7" /></div>
				<div class="orbit-tile orbit-four"><Icon name="route" class="h-7 w-7" /></div>
			</div>
		</div>
	</section>

	<section
		id="products"
		class="marketing-section products-section"
		aria-labelledby="products-title"
	>
		<div class="section-heading">
			<div>
				<span class="section-kicker">01 — All products</span>
				<h2 id="products-title">所有產品</h2>
				<p>從學生角度出發，我們打造了這些超~好用的產品</p>
			</div>
		</div>
		<div class="product-cards">
			{#each products as product (product.id)}
				<a class="product-card" href={productHref()}>
					<div class="product-card-top">
						<ProductIcon kind={product.glyph} size={52} variant="soft" /><span
							>{productTags[product.id]}</span
						>
					</div>
					<div>
						<h3>{product.name()}</h3>
						<p class="product-latin">{product.latin}</p>
					</div>
					<p class="product-summary">{product.summary()}</p>
					<div class="product-more">了解產品 <Icon name="arrow" class="h-4 w-4" /></div>
				</a>
			{/each}
		</div>
		<a class="round-more" href="{base}/products/" aria-label="查看更多產品">＋</a>
	</section>

	<section id="about" class="about-section" aria-labelledby="about-title">
		<div class="marketing-section about-inner">
			<div class="about-copy">
				<span class="section-kicker">02 — About us</span>
				<div class="about-title-row">
					<h2 id="about-title">認識我們</h2>
					<a class="round-more small" href="{base}/about/">＋</a>
				</div>
				<p>一群陽明交大學生組成的數位團隊。白天上課，晚上燃燒生命，立志打造最順暢的校園生活</p>
				<p>讓校園生活少一點麻煩 Debug your NYCU LIFE problems</p>
				<div class="role-pills">
					{#each roles as role (role)}<a href="{base}/about/">{role}</a>{/each}
				</div>
			</div>
			<div class="video-placeholder">
				<span>▶</span><strong>團隊介紹影片</strong><small>16 : 9 · Team reel</small>
			</div>
		</div>
	</section>

	<section id="courses" class="marketing-section courses-section" aria-labelledby="courses-title">
		<span class="section-kicker">03 — Courses</span>
		<h2 id="courses-title">課程專區</h2>
		<p class="section-lede">我們也把做產品學到的知識技術，開成工作坊分享給大家</p>
		<div class="course-cards">
			{#each courses as course (course.title)}
				<article class="course-card">
					<div class="course-cover"><span>{course.level}</span><strong>{course.icon}</strong></div>
					<div class="course-body">
						<h3>{course.title}</h3>
						<p>◷ {course.date}</p>
						<p>♙ {course.teacher}</p>
						<div><small>{course.seats}</small><button type="button">{course.action}</button></div>
					</div>
				</article>
			{/each}
		</div>
		<a class="round-more" href="{base}/courses/" aria-label="查看更多課程">＋</a>
	</section>

	<section id="devlog" class="devlog-section" aria-labelledby="devlog-title">
		<div class="marketing-section">
			<span class="section-kicker">04 — Devlog</span>
			<h2 id="devlog-title">開發日誌</h2>
			<p class="section-lede">育兒日記，這裡紀錄我們如何從胚胎開始養育產品</p>
			<div class="story-cards">
				{#each featuredStories as story (story.title)}
					<a class="story-card" href="{base}/devlog/"
						><div class="story-cover"><span>{story.icon}</span><small>{story.kicker}</small></div>
						<p>{story.meta}</p>
						<h3>{story.title}</h3>
						<span>{story.excerpt}</span></a
					>
				{/each}
			</div>
			<a class="round-more" href="{base}/devlog/" aria-label="查看更多開發日誌">＋</a>
		</div>
	</section>

	<footer id="join" class="marketing-footer">
		<div class="marketing-section">
			<div class="footer-cta">
				<div>
					<h2>有想解決的校園麻煩？來找我們一起 debug</h2>
					<p>加入團隊，或把你的點子丟給我們</p>
				</div>
				<div>
					<a class="footer-button light" href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
						>加入我們 ↗</a
					><a class="footer-button outline" href="mailto:hello@nycu.life">許願池 ✦</a>
				</div>
			</div>
			<div class="footer-main">
				<div>
					<div class="footer-brand">
						<img src="{base}/brand/logo.svg" alt={m.brand_name()} /><strong>{m.brand_name()}</strong
						>
					</div>
					<p>{m.footer_tagline()}</p>
				</div>
				<div class="footer-columns">
					<div>
						<b>{m.footer_links_label()}</b><a href="#products">{m.nav_products()}</a><a
							href="#about">{m.menu_about()}</a
						><a href="#courses">{m.nav_courses()}</a><a href="#devlog">{m.nav_devlog()}</a>
					</div>
					<div>
						<b>{m.menu_contact_label()}</b><a href="mailto:hello@nycu.life">hello@nycu.life</a>
					</div>
				</div>
			</div>
			<div class="footer-bottom">
				<span>© 2026 {m.brand_name()}</span><span>{m.footer_rights()}</span>
			</div>
		</div>
	</footer>
</div>

<style>
	.marketing-page {
		position: relative;
		z-index: 1;
		background: var(--base);
		color: var(--ink);
	}
	.marketing-hero {
		overflow: hidden;
		background: linear-gradient(160deg, var(--hero-start), var(--hero-end));
	}
	.hero-inner {
		width: min(75rem, 100%);
		min-height: 39rem;
		margin: 0 auto;
		padding: 5rem var(--gutter) 5.5rem;
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: 3rem;
		align-items: center;
	}
	.hero-copy {
		position: relative;
		z-index: 1;
	}
	.hero-copy h1 {
		margin: 1.5rem 0 0;
		font-family: var(--font-display);
		font-size: clamp(3.3rem, 7vw, 4.9rem);
		line-height: 1.02;
		letter-spacing: -0.04em;
	}
	.hero-copy h1 em {
		color: var(--hero-accent);
		font-weight: 500;
	}
	.hero-copy > p {
		margin: 1.2rem 0 0;
		font-size: 1.1rem;
		color: var(--ink-soft);
	}
	.hero-stats {
		display: flex;
		gap: 2.5rem;
		margin-top: 3rem;
	}
	.hero-stats div {
		display: grid;
		gap: 0.15rem;
	}
	.hero-stats strong {
		font: 700 2rem var(--font-display);
	}
	.hero-stats span {
		font-size: 0.78rem;
		color: var(--muted);
	}
	.hero-orbit {
		position: relative;
		height: 26rem;
		display: grid;
		place-items: center;
	}
	.orbit-ring {
		position: absolute;
		border: 1px dashed color-mix(in srgb, var(--brand) 28%, transparent);
		border-radius: 50%;
		animation: orbit-spin 40s linear infinite;
	}
	.orbit-ring-large {
		width: 18rem;
		height: 18rem;
	}
	.orbit-ring-small {
		width: 12.5rem;
		height: 12.5rem;
		animation-direction: reverse;
		animation-duration: 28s;
	}
	.orbit-center {
		display: grid;
		place-items: center;
		width: 9.5rem;
		height: 9.5rem;
		border-radius: 2.25rem;
		background: var(--surface);
		box-shadow: var(--shadow);
	}
	.orbit-tile {
		position: absolute;
		display: grid;
		place-items: center;
		width: 4rem;
		height: 4rem;
		border-radius: 1.25rem;
		background: var(--surface);
		box-shadow: var(--shadow);
	}
	.orbit-tile :global(.picon) {
		box-shadow: none;
	}
	.orbit-one {
		top: 10%;
		right: 18%;
	}
	.orbit-two {
		top: 30%;
		right: 0;
	}
	.orbit-three {
		bottom: 13%;
		left: 14%;
	}
	.orbit-four {
		bottom: 5%;
		right: 12%;
	}
	.marketing-section {
		width: min(75rem, 100%);
		margin: 0 auto;
		padding: 6rem var(--gutter);
	}
	.section-kicker {
		display: block;
		margin-bottom: 0.75rem;
		color: var(--brand-ink);
		font: 600 0.72rem var(--font-display);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	.marketing-section h2 {
		margin: 0;
		font-size: clamp(2rem, 4vw, 2.3rem);
		font-weight: 600;
		letter-spacing: -0.025em;
	}
	.section-heading p,
	.section-lede {
		margin: 0.8rem 0 0;
		max-width: 34rem;
		color: var(--ink-soft);
		line-height: 1.6;
	}
	.product-cards,
	.course-cards,
	.story-cards {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.5rem;
		margin-top: 2.5rem;
	}
	.product-card,
	.course-card,
	.story-card {
		min-width: 0;
		border: 1px solid var(--line);
		border-radius: 1rem;
		background: var(--surface);
		box-shadow: var(--shadow);
	}
	.product-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 17.5rem;
		padding: 1.75rem;
	}
	.product-card:nth-child(3) {
		order: 4;
	}
	.product-card:nth-child(4) {
		order: 3;
	}
	.product-card:hover,
	.course-card:hover,
	.story-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow);
	}
	.product-card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.product-card-top > span {
		padding: 0.35rem 0.7rem;
		border-radius: 0.55rem;
		background: var(--surface-3);
		color: var(--muted);
		font: 600 0.65rem var(--font-display);
	}
	.product-card h3 {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 600;
	}
	.product-latin {
		margin: 0.15rem 0 0;
		color: var(--muted);
		font-size: 0.78rem;
	}
	.product-summary {
		flex: 1;
		margin: 0;
		color: var(--ink-soft);
		line-height: 1.6;
		font-size: 0.9rem;
	}
	.product-more {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.25rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--line);
		color: var(--brand);
		font-weight: 600;
		font-size: 0.88rem;
	}
	.round-more {
		display: grid;
		place-items: center;
		width: 2.3rem;
		height: 2.3rem;
		margin: 2.5rem auto 0;
		border: 1.5px solid var(--brand);
		border-radius: 50%;
		color: var(--brand);
		font-size: 1.55rem;
		line-height: 1;
	}
	.round-more:hover {
		background: var(--brand);
		color: #fff;
	}
	.round-more.small {
		margin: 0;
		flex: 0 0 auto;
	}
	.about-section,
	.devlog-section {
		background: var(--section-alt);
		border-block: 1px solid var(--line);
	}
	.about-inner {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: stretch;
	}
	.about-title-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.about-copy > p {
		max-width: 32rem;
		margin: 1.2rem 0 0;
		color: var(--ink-soft);
		line-height: 1.7;
	}
	.role-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		margin-top: 2rem;
	}
	.role-pills a {
		padding: 0.5rem 0.9rem;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: var(--surface);
		color: var(--ink-soft);
		font-size: 0.82rem;
	}
	.role-pills a:hover {
		border-color: var(--brand);
		color: var(--brand);
	}
	.video-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.8rem;
		aspect-ratio: 16 / 9;
		align-self: center;
		border: 1.5px dashed var(--line-strong);
		border-radius: 1rem;
		background: var(--surface);
		color: var(--ink-soft);
	}
	.video-placeholder span {
		display: grid;
		place-items: center;
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 50%;
		background: var(--brand-soft);
		color: var(--brand);
		font-size: 1.8rem;
	}
	.video-placeholder strong {
		font-size: 1rem;
	}
	.video-placeholder small {
		font: 500 0.65rem var(--font-display);
		letter-spacing: 0.12em;
		color: var(--muted);
	}
	.course-card {
		overflow: hidden;
	}
	.course-cover {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		height: 7.5rem;
		padding: 1rem;
		background: linear-gradient(135deg, var(--course-start), var(--course-end));
		color: #fff;
	}
	.course-cover span {
		padding: 0.35rem 0.65rem;
		border-radius: 0.45rem;
		background: rgba(255, 255, 255, 0.9);
		color: #333;
		font: 600 0.7rem var(--font-display);
	}
	.course-cover strong {
		font: 600 2rem var(--font-display);
	}
	.course-body {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		padding: 1.35rem;
	}
	.course-body h3 {
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.4;
	}
	.course-body p {
		margin: 0;
		color: var(--ink-soft);
		font-size: 0.8rem;
	}
	.course-body > div {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 0.8rem;
		border-top: 1px solid var(--line);
	}
	.course-body small {
		color: var(--muted);
	}
	.course-body button {
		border: 0;
		border-radius: 0.45rem;
		padding: 0.45rem 1rem;
		background: var(--brand);
		color: #fff;
		cursor: pointer;
	}
	.story-card {
		overflow: hidden;
		padding-bottom: 1.25rem;
	}
	.story-cover {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		height: 11rem;
		padding: 1.2rem;
		background: linear-gradient(135deg, var(--story-start), var(--story-end));
		color: #fff;
	}
	.story-cover span {
		font: 700 1.5rem var(--font-display);
	}
	.story-cover small {
		padding: 0.3rem 0.6rem;
		border-radius: 0.45rem;
		background: rgba(255, 255, 255, 0.92);
		color: var(--brand);
		font: 600 0.63rem var(--font-display);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.story-card > p,
	.story-card > h3,
	.story-card > span {
		display: block;
		margin-inline: 1.25rem;
	}
	.story-card > p {
		margin-top: 1rem;
		color: var(--brand-ink);
		font-size: 0.73rem;
	}
	.story-card > h3 {
		margin-top: 0.4rem;
		font-size: 1.1rem;
		font-weight: 600;
	}
	.story-card > span {
		margin-top: 0.45rem;
		color: var(--ink-soft);
		font-size: 0.85rem;
		line-height: 1.55;
	}
	.marketing-footer {
		background: var(--base);
	}
	.footer-cta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
		padding: 3.5rem;
		border-radius: 1.5rem;
		background: var(--accent-grad);
		color: #fff;
	}
	.footer-cta h2 {
		margin: 0;
		max-width: 38rem;
		font: 700 clamp(1.7rem, 4vw, 2.2rem) var(--font-display);
		line-height: 1.2;
	}
	.footer-cta p {
		margin: 0.8rem 0 0;
		color: rgba(255, 255, 255, 0.84);
	}
	.footer-cta > div:last-child {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
	}
	.footer-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 3rem;
		padding: 0 1.35rem;
		border-radius: 0.5rem;
		font-weight: 600;
		white-space: nowrap;
	}
	.footer-button.light {
		background: #fff;
		color: var(--brand);
	}
	.footer-button.outline {
		border: 1px solid rgba(255, 255, 255, 0.6);
		color: #fff;
	}
	.footer-main {
		display: flex;
		justify-content: space-between;
		gap: 2rem;
		padding: 3.5rem 0 2.5rem;
	}
	.footer-brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		color: var(--brand);
	}
	.footer-brand img {
		width: 2.25rem;
		height: 2.25rem;
	}
	:global([data-theme='dark']) .footer-brand img {
		filter: grayscale(1) brightness(0) invert(1);
	}
	.footer-brand strong {
		font: 700 1.15rem var(--font-display);
	}
	.footer-main > div > p {
		margin: 1rem 0 0;
		color: var(--muted);
		font-size: 0.8rem;
	}
	.footer-columns {
		display: flex;
		gap: 4rem;
	}
	.footer-columns > div {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		min-width: 8rem;
	}
	.footer-columns b {
		margin-bottom: 0.4rem;
		font: 600 0.68rem var(--font-display);
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.footer-columns a {
		color: var(--ink-soft);
		font-size: 0.83rem;
	}
	.footer-columns a:hover {
		color: var(--brand);
	}
	.footer-bottom {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.3rem 0 2.5rem;
		border-top: 1px solid var(--line);
		color: var(--muted);
		font-size: 0.7rem;
	}
	@keyframes orbit-spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.orbit-ring {
			animation: none;
		}
		.product-card:hover,
		.course-card:hover,
		.story-card:hover {
			transform: none;
		}
	}
	@media (max-width: 800px) {
		.hero-inner,
		.about-inner {
			grid-template-columns: 1fr;
		}
		.hero-inner {
			min-height: auto;
			padding-top: 3.5rem;
		}
		.hero-orbit {
			height: 20rem;
		}
		.product-cards,
		.course-cards,
		.story-cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.footer-cta {
			flex-direction: column;
			align-items: flex-start;
			padding: 2rem;
		}
	}
	@media (max-width: 720px) {
		.footer-main {
			flex-direction: column;
		}
		.footer-columns {
			justify-content: space-between;
			width: 100%;
		}
	}
	@media (max-width: 520px) {
		.product-cards,
		.course-cards,
		.story-cards {
			grid-template-columns: 1fr;
		}
		.marketing-section {
			padding-block: 4rem;
		}
		.footer-main,
		.footer-bottom {
			flex-direction: column;
		}
		.footer-columns {
			gap: 2rem;
		}
		.footer-cta {
			padding: 1.5rem;
			border-radius: 1rem;
		}
		.footer-cta > div:last-child {
			width: 100%;
		}
		.footer-button {
			flex: 1 1 10rem;
		}
		.hero-inner {
			padding-inline: 1.1rem;
		}
		.hero-copy h1 {
			font-size: clamp(2.8rem, 14vw, 4rem);
		}
		.hero-stats {
			gap: 1.5rem;
			margin-top: 2rem;
		}
		.hero-orbit {
			height: 17rem;
			transform: scale(0.82);
			transform-origin: center top;
			margin-bottom: -2.5rem;
		}
	}
</style>
