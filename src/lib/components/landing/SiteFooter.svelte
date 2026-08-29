<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { CONTACT_EMAIL, GITHUB_URL, INSTAGRAM_URL, YOUTUBE_URL } from '$lib/content/landing';
</script>

<footer id="prototype-footer" class="prototype-footer">
	<div class="footer-grid">
		<div class="footer-brand">
			<img src="{base}/brand/logo-horizontal-white.svg" alt={m.brand_name()} />
			<p>{m.footer_tagline()}</p>
		</div>
		<nav aria-label={m.footer_links_label()}>
			<strong>{m.footer_links_label()}</strong>
			<a href="{base}/#about">{m.menu_about()}</a>
			<a href="{base}/#products">{m.nav_products()}</a>
			<a href="{base}/#faq">FAQ</a>
			<a href="{base}/#join">{m.nav_join()}</a>
			<a href="{base}/courses/">{m.nav_courses()}</a>
			<a href="{base}/devlog/">{m.nav_devlog()}</a>
		</nav>
		<div class="footer-contact">
			<strong>{m.menu_contact_label()}</strong>
			<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
			<a href="{base}/wishpool/">{m.footer_wishlist()} ✦</a>
			<a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a>
			<a href={YOUTUBE_URL} target="_blank" rel="noreferrer">YouTube</a>
			<a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
		</div>
	</div>
	<div class="footer-bottom">
		<span>© 2026 {m.brand_name()}</span><span>{m.footer_rights()}</span>
	</div>
</footer>

<style>
	.prototype-footer {
		position: relative;
		z-index: 1;
		padding: clamp(2.5rem, 6vw, 5rem) var(--gutter) 2rem;
		background: #374151;
		color: #fff;
	}
	.footer-grid {
		width: min(70rem, 100%);
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.7fr 1fr 1fr;
		gap: clamp(2rem, 6vw, 6rem);
	}
	.footer-brand img {
		display: block;
		width: min(13rem, 80%);
	}
	.footer-brand p {
		margin: 1.1rem 0 0;
		max-width: 28rem;
		color: #d1d5db;
		line-height: 1.7;
	}
	.footer-grid nav,
	.footer-contact {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}
	.footer-grid strong {
		margin-bottom: 0.25rem;
		color: #9ca3af;
		font-size: 0.75rem;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}
	.footer-grid a {
		color: #d1d5db;
		font-size: 0.9rem;
	}
	.footer-grid a:hover {
		color: #fff;
	}
	.footer-bottom {
		width: min(70rem, 100%);
		margin: 2.5rem auto 0;
		padding-top: 1.25rem;
		border-top: 1px solid #4b5563;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		color: #9ca3af;
		font-size: 0.72rem;
	}
	@media (max-width: 680px) {
		.footer-grid {
			grid-template-columns: 1fr 1fr;
		}
		.footer-brand {
			grid-column: 1 / -1;
		}
		.footer-bottom {
			flex-direction: column;
		}
	}
</style>
