<script lang="ts">
	import { hero, services } from '$lib/content/landing';
	import Icon from './Icon.svelte';
	import { reveal } from './scroll';
</script>

<section id="top" class="hero">
	<div class="hero-grid">
		<div class="hero-copy">
			<p class="hero-eyebrow reveal" use:reveal>{hero.eyebrow()}</p>

			<h1 class="hero-title">
				{#each hero.titleLines as line, index (index)}
					<span
						class="hero-title-line reveal {index === hero.titleLines.length - 1
							? 'hero-title-accent'
							: ''}"
						use:reveal={{ delay: 60 + index * 90 }}
					>
						{line()}
					</span>
				{/each}
			</h1>

			<p class="hero-lede reveal" use:reveal={{ delay: 360 }}>{hero.lede()}</p>

			<div class="hero-actions reveal" use:reveal={{ delay: 440 }}>
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
					<Icon name="branch" class="h-4 w-4" />
					<span>{hero.secondaryCta.label()}</span>
				</a>
			</div>

			<ul class="hero-services reveal" use:reveal={{ delay: 520 }}>
				{#each services as service (service.id)}
					<li>
						<a href="#services">
							<span class="hero-service-index">{service.index}</span>
							<Icon name={service.icon} class="h-4 w-4" />
							<span>{service.name()}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="hero-visual reveal" use:reveal={{ delay: 240 }}>
			<!-- CSS-driven "distortion-mirror" placeholder in place of a stock photo. -->
			<div class="hero-mirror" aria-hidden="true">
				<div class="hero-mirror-band hero-mirror-band-1"></div>
				<div class="hero-mirror-band hero-mirror-band-2"></div>
				<div class="hero-mirror-band hero-mirror-band-3"></div>
				<div class="hero-mirror-grain"></div>
			</div>
			<p class="hero-image-caption">{hero.imageCaption()}</p>
		</div>
	</div>

	<div class="hero-marquee" aria-hidden="true">
		<div class="hero-marquee-track">
			<span>{hero.marquee()}</span>
			<span>{hero.marquee()}</span>
			<span>{hero.marquee()}</span>
		</div>
	</div>
</section>
