<script lang="ts">
	import { faqItems } from '$lib/content/about';

	// Accordion — first item open by default; clicking the open one closes it.
	let open = $state(0);
	const toggle = (i: number) => (open = open === i ? -1 : i);
</script>

<div class="faq">
	{#each faqItems as item, i (i)}
		<div class="faq-item">
			<button class="faq-q" aria-expanded={open === i} onclick={() => toggle(i)}>
				<span class="faq-plus" class:open={open === i} aria-hidden="true">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M12 5v14M5 12h14" />
					</svg>
				</span>
				<span class="faq-q-text">{item.q()}</span>
			</button>
			<div class="faq-a" class:open={open === i}>
				<p class="faq-a-text">{item.a()}</p>
			</div>
		</div>
	{/each}
</div>

<style>
	.faq {
		margin-top: 4px;
		border-top: 1px dotted rgba(237, 241, 255, 0.2);
	}
	.faq-item {
		border-bottom: 1px dotted rgba(237, 241, 255, 0.2);
	}
	.faq-q {
		width: 100%;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 14px 0;
		display: flex;
		align-items: flex-start;
		gap: 12px;
		color: inherit;
		font-family: inherit;
		text-align: left;
	}
	.faq-plus {
		flex-shrink: 0;
		margin-top: 3px;
		display: inline-flex;
		transition: transform 0.35s ease;
	}
	.faq-plus.open {
		transform: rotate(45deg);
	}
	.faq-q-text {
		flex: 1;
		font-size: 15px;
		font-weight: 600;
		line-height: 1.4;
		letter-spacing: -0.005em;
	}
	.faq-a {
		max-height: 0;
		opacity: 0;
		overflow: hidden;
		transition:
			max-height 0.4s ease,
			opacity 0.3s ease;
	}
	.faq-a.open {
		max-height: 500px;
		opacity: 1;
	}
	.faq-a-text {
		margin: 0;
		padding-left: 28px;
		padding-bottom: 14px;
		font-size: 13px;
		line-height: 1.55;
		opacity: 0.78;
	}

	@media (prefers-reduced-motion: reduce) {
		.faq-plus,
		.faq-a {
			transition: none;
		}
	}
</style>
