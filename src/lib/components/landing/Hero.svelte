<script lang="ts">
	import { hero } from '$lib/content/landing';
	import Frame from './Frame.svelte';
	import Icon from './Icon.svelte';
	import { reveal } from './scroll';
</script>

<section id="top" class="hero">
	<div class="hero-grid">
		<div class="hero-copy">
			<p class="hero-eyebrow reveal" use:reveal>{hero.eyebrow()}</p>

			<h1 class="hero-title">
				<span class="hero-title-main reveal" use:reveal={{ delay: 60 }}>{hero.title()}</span>
				<span class="hero-title-sub reveal" use:reveal={{ delay: 150 }}>{hero.subtitle()}</span>
			</h1>

			<p class="hero-lede reveal" use:reveal={{ delay: 260 }}>{hero.lede()}</p>

			<div class="hero-actions reveal" use:reveal={{ delay: 360 }}>
				<a class="landing-button landing-button-primary" href={hero.primaryCta.href}>
					<span>{hero.primaryCta.label()}</span>
					<Icon name="arrow" class="h-4 w-4" />
				</a>
				<a
					class="landing-button landing-button-secondary"
					href={hero.secondaryCta.href}
					target="_blank"
					rel="noreferrer"
				>
					<Icon name="instagram" class="h-4 w-4" />
					<span>{hero.secondaryCta.label()}</span>
				</a>
			</div>
		</div>

		<div class="hero-visual reveal" use:reveal={{ delay: 200 }}>
			<Frame src={hero.image.src} alt={hero.title()} frame="browser" />
			<p class="hero-image-caption">{hero.image.caption()}</p>
		</div>
	</div>
</section>
