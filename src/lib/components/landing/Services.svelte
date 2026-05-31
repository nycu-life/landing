<script lang="ts">
	import { services, servicesSection } from '$lib/content/landing';
	import Icon from './Icon.svelte';
	import { reveal, scrollZoom } from './scroll';
</script>

<section id="services" class="section section-services">
	<header class="section-head reveal" use:reveal>
		<div class="section-head-marker">
			<span class="section-index">{servicesSection.index()}</span>
			<span class="section-eyebrow">{servicesSection.eyebrow()}</span>
		</div>
		<h2 class="section-title">{servicesSection.title()}</h2>
		<p class="section-lede">{servicesSection.lede()}</p>
	</header>

	<div class="services-list">
		{#each services as service, index (service.id)}
			<article
				class="service-stage service-accent-{service.accent}"
				use:scrollZoom
				class:service-stage-alt={index % 2 === 1}
			>
				<div class="service-visual">
					<!-- CSS-driven duotone/distortion placeholder per service. -->
					<div class="service-mirror" aria-hidden="true">
						<div class="service-mirror-glow"></div>
						<div class="service-mirror-icon">
							<Icon name={service.icon} class="h-12 w-12" />
						</div>
						<span class="service-mirror-index">{service.index}</span>
					</div>
				</div>

				<div class="service-body reveal" use:reveal={{ delay: 80 }}>
					<div class="service-headrow">
						<span class="service-index">{service.index}</span>
						<h3 class="service-name">{service.name()}</h3>
					</div>
					<p class="service-summary">{service.summary()}</p>

					<div class="service-meta">
						<p class="service-label">{servicesSection.blurbLabel()}</p>
						<p class="service-blurb">{service.blurb()}</p>
					</div>

					<div class="service-meta">
						<p class="service-label">{servicesSection.featuresLabel()}</p>
						<ul class="service-features">
							{#each service.features as feature, featureIndex (featureIndex)}
								<li>
									<span class="service-bullet" aria-hidden="true"></span>
									<span>{feature()}</span>
								</li>
							{/each}
						</ul>
					</div>

					<div class="service-downloads">
						{#each service.downloads as download (download.kind)}
							<a class="service-download" href={download.href}>
								<Icon name={download.icon} class="h-4 w-4" />
								<span>{download.label()}</span>
							</a>
						{/each}
					</div>
				</div>
			</article>
		{/each}
	</div>
</section>
