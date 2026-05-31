<script lang="ts">
	import { products, productsSection, productStatusLabel } from '$lib/content/landing';
	import Frame from './Frame.svelte';
	import Icon from './Icon.svelte';
	import { reveal } from './scroll';
</script>

<section id="products" class="section section-products">
	<header class="section-head reveal" use:reveal>
		<p class="section-eyebrow">{productsSection.eyebrow()}</p>
		<h2 class="section-title">{productsSection.title()}</h2>
		<p class="section-lede">{productsSection.lede()}</p>
	</header>

	<div class="products-list">
		{#each products as product, index (product.id)}
			<article
				class="product product-accent-{product.accent}"
				class:product-alt={index % 2 === 1}
				class:product-empty={!product.screenshot}
			>
				{#if product.screenshot}
					<div class="product-visual reveal" use:reveal>
						<Frame
							src={product.screenshot.src}
							alt={product.name()}
							frame={product.screenshot.frame}
						/>
					</div>
				{/if}

				<div class="product-body reveal" use:reveal={{ delay: 80 }}>
					<div class="product-headrow">
						<h3 class="product-name">{product.name()}</h3>
						<span class="product-status product-status-{product.status}">
							{productStatusLabel[product.status]()}
						</span>
					</div>

					<p class="product-summary">{product.summary()}</p>

					<p class="product-label">{productsSection.featuresLabel()}</p>
					<ul class="product-features">
						{#each product.features as feature, featureIndex (featureIndex)}
							<li>
								<span class="product-check" aria-hidden="true">
									<Icon name="check" class="h-3.5 w-3.5" />
								</span>
								<span>{feature()}</span>
							</li>
						{/each}
					</ul>

					{#if product.href}
						<div class="product-actions">
							<a
								class="landing-button landing-button-primary"
								href={product.href}
								target="_blank"
								rel="noreferrer"
							>
								<span>{productsSection.visitLabel()}</span>
								<Icon name="arrow" class="h-4 w-4" />
							</a>
						</div>
					{/if}
				</div>
			</article>
		{/each}
	</div>
</section>
