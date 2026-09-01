<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import {
		APP_STORE_URL,
		CONTACT_EMAIL,
		GITHUB_URL,
		GOOGLE_PLAY_URL,
		INSTAGRAM_URL,
		YOUTUBE_URL
	} from '$lib/content/landing';
</script>

<footer id="prototype-footer" class="prototype-footer">
	<div class="footer-grid">
		<div class="footer-brand">
			<img src="{base}/brand/logo-horizontal-white.svg" alt={m.brand_name()} />
			<p>{m.footer_tagline()}</p>
		</div>
		<div class="footer-contact">
			<strong>{m.menu_contact_label()}</strong>
			<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
			<a href="{base}/wishpool/">{m.footer_wishlist()} ✦</a>
			<a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram</a>
			<a href={YOUTUBE_URL} target="_blank" rel="noreferrer">YouTube</a>
			<a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
		</div>
		<div class="footer-downloads">
			<strong>{m.footer_download_title()}</strong>
			<div class="store-links">
				<a
					class="store-link"
					href={GOOGLE_PLAY_URL}
					target="_blank"
					rel="noreferrer"
					aria-label={m.footer_download_android()}
					data-analytics-event="app_download_click"
					data-analytics-source="footer"
					data-analytics-platform="android"
				>
					<span class="store-mark" aria-hidden="true">
						<svg class="store-icon store-icon-play" viewBox="0 0 48 48">
							<path
								fill="#00d7fe"
								d="M6.2 4.6 28.8 24 6.2 43.4c-.8-.8-1.2-2-1.2-3.4V8c0-1.4.4-2.6 1.2-3.4Z"
							/>
							<path fill="#00f076" d="m6.2 4.6 27.9 15.9-5.3 3.5Z" />
							<path fill="#ffea00" d="M6.2 43.4 34.1 27.5 28.8 24Z" />
							<path fill="#ff3a44" d="M34.1 20.5 42 25c1.3.8 1.3 2.2 0 3l-7.9 4.5-5.3-8.5Z" />
						</svg>
					</span>
					<span class="store-copy">
						<small>{m.footer_download_android_kicker()}</small>
						<span>Google Play</span>
					</span>
				</a>
				<a
					class="store-link"
					href={APP_STORE_URL}
					target="_blank"
					rel="noreferrer"
					aria-label={m.footer_download_ios()}
					data-analytics-event="app_download_click"
					data-analytics-source="footer"
					data-analytics-platform="ios"
				>
					<span class="store-mark" aria-hidden="true">
						<svg class="store-icon store-icon-apple" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M17.05 12.54c-.02-2.28 1.86-3.39 1.95-3.44a4.2 4.2 0 0 0-3.31-1.79c-1.39-.15-2.74.83-3.45.83-.72 0-1.81-.81-2.99-.78a4.39 4.39 0 0 0-3.7 2.25c-1.6 2.77-.41 6.83 1.12 9.07.77 1.09 1.66 2.31 2.84 2.27 1.14-.05 1.57-.73 2.96-.73 1.37 0 1.77.73 2.96.7 1.23-.02 2-1.1 2.74-2.2a9.1 9.1 0 0 0 1.25-2.58 3.96 3.96 0 0 1-2.37-3.6ZM14.78 5.84A4.02 4.02 0 0 0 15.7 3a4.1 4.1 0 0 0-2.65 1.35 3.8 3.8 0 0 0-.95 2.73 3.39 3.39 0 0 0 2.68-1.24Z"
							/>
						</svg>
					</span>
					<span class="store-copy">
						<small>{m.footer_download_ios_kicker()}</small>
						<span>App Store</span>
					</span>
				</a>
			</div>
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
		grid-template-columns: minmax(14rem, 1.5fr) minmax(9rem, 0.8fr) minmax(13rem, 1fr);
		gap: clamp(1.75rem, 4vw, 4rem);
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
	.footer-contact,
	.footer-downloads {
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
	.store-links {
		display: grid;
		gap: 0.65rem;
	}
	.footer-grid a.store-link {
		display: grid;
		grid-template-columns: 2.25rem minmax(0, 1fr);
		align-items: center;
		gap: 0.7rem;
		min-height: 3.6rem;
		padding: 0.55rem 0.75rem;
		border: 1px solid #6b7280;
		border-radius: 0.8rem;
		background: rgba(17, 24, 39, 0.42);
		color: #fff;
		transition:
			transform 0.18s ease,
			border-color 0.18s ease,
			background 0.18s ease;
	}
	.footer-grid a.store-link:hover {
		border-color: #c7d2fe;
		background: rgba(37, 99, 235, 0.28);
		transform: translateY(-2px);
	}
	.footer-grid a.store-link:focus-visible {
		outline: 3px solid #93c5fd;
		outline-offset: 3px;
	}
	.store-mark {
		display: grid;
		place-items: center;
		width: 2.25rem;
		aspect-ratio: 1;
		color: #fff;
	}
	.store-icon {
		display: block;
		width: 1.8rem;
		height: 1.8rem;
	}
	.store-icon-play {
		width: 2rem;
		height: 2rem;
	}
	.store-copy {
		display: grid;
		gap: 0.05rem;
		min-width: 0;
		line-height: 1.15;
	}
	.store-copy small {
		color: #d1d5db;
		font-size: 0.62rem;
	}
	.store-copy > span {
		font-size: 0.9rem;
		font-weight: 700;
		white-space: nowrap;
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
	@media (max-width: 900px) {
		.footer-grid {
			grid-template-columns: 1fr 1fr;
		}
		.footer-brand,
		.footer-downloads {
			grid-column: 1 / -1;
		}
		.store-links {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 680px) {
		.footer-bottom {
			flex-direction: column;
		}
	}
	@media (max-width: 420px) {
		.store-links {
			grid-template-columns: 1fr;
		}
	}
</style>
