<script lang="ts">
	import { brand, footer, footerLinks } from '$lib/content/landing';
	import { getLocale, locales, setLocale } from '$lib/paraglide/runtime';
	import Icon from './Icon.svelte';

	const localeNames: Record<string, string> = {
		'zh-tw': '中文',
		en: 'English'
	};

	const current = getLocale();
</script>

<footer class="site-footer">
	<div class="site-footer-top">
		<div class="site-footer-brand">
			<a class="site-footer-mark" href="#top">{brand.name()}</a>
			<p class="site-footer-tagline">{footer.tagline()}</p>
		</div>

		<div class="site-footer-cols">
			<div class="site-footer-col">
				<p class="site-footer-col-title">{footer.linksLabel()}</p>
				<ul>
					{#each footerLinks as link (link.href)}
						<li>
							<a href={link.href} target="_blank" rel="noreferrer">
								<Icon name={link.icon} class="h-4 w-4" />
								<span>{link.label()}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<div class="site-footer-col">
				<p class="site-footer-col-title">{footer.localeLabel()}</p>
				<div class="site-footer-locales" role="group" aria-label={footer.localeLabel()}>
					{#each locales as locale (locale)}
						<button
							type="button"
							class="site-footer-locale"
							class:site-footer-locale-active={locale === current}
							aria-pressed={locale === current}
							onclick={() => setLocale(locale)}
						>
							{localeNames[locale] ?? locale}
						</button>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<div class="site-footer-bottom">
		<p>{footer.rights()}</p>
		<a class="site-footer-totop" href="#top">
			<span>{footer.backToTop()}</span>
			<Icon name="arrow" class="h-4 w-4 -rotate-90" />
		</a>
	</div>
</footer>
