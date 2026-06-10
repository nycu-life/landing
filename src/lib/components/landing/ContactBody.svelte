<script lang="ts">
	import { aboutJoin, contactRows } from '$lib/content/about';

	const label = (l: (() => string) | string) => (typeof l === 'function' ? l() : l);
</script>

{#snippet rowIcon(name: string, size: number)}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		{#if name === 'instagram'}
			<rect x="2" y="2" width="20" height="20" rx="5" />
			<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
		{:else if name === 'github'}
			<path
				d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
			/>
		{:else}
			<circle cx="12" cy="12" r="10" />
			<path d="M2 12h20" />
			<path
				d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
			/>
		{/if}
	</svg>
{/snippet}

<div class="contact">
	<!-- contact list -->
	<div class="contact-list">
		{#each contactRows as row, i (row.href)}
			<a
				class="contact-row"
				class:last={i === contactRows.length - 1}
				href={row.href}
				target="_blank"
				rel="noreferrer"
			>
				<span class="contact-ico">{@render rowIcon(row.icon, 18)}</span>
				<span class="contact-text">
					<span class="contact-label">{label(row.label)}</span>
					<span class="contact-value">{row.value}</span>
				</span>
			</a>
		{/each}
	</div>

	<!-- CTA -->
	<a class="liquid-glass-btn join-cta" href={aboutJoin.href} target="_blank" rel="noreferrer">
		<span class="join-cta-text">
			<span class="join-cta-title">{aboutJoin.title()}</span>
			<span class="join-cta-sub">{aboutJoin.sub()}</span>
		</span>
		<span class="join-cta-arrow" aria-hidden="true">
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M5 12h14M13 5l7 7-7 7" />
			</svg>
		</span>
	</a>

	<!-- secondary socials -->
	<div class="contact-socials">
		{#each contactRows as row (row.href)}
			<a class="liquid-glass-btn social-btn" href={row.href} target="_blank" rel="noreferrer">
				{@render rowIcon(row.icon, 16)}
				<span class="social-label">{label(row.label)}</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.contact {
		margin-top: 6px;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.contact-list {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--line);
		border-radius: 16px;
		padding: 4px;
	}
	.contact-row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px;
		border-radius: 12px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		color: inherit;
		transition: background 0.25s ease;
	}
	.contact-row.last {
		border-bottom: none;
	}
	.contact-row:hover {
		background: rgba(255, 255, 255, 0.05);
	}
	.contact-ico {
		width: 38px;
		height: 38px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.1);
		color: var(--accent);
		border: 1px solid var(--line);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.contact-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.contact-label {
		font-size: 10px;
		opacity: 0.55;
		letter-spacing: 0.16em;
		font-weight: 700;
		text-transform: uppercase;
		margin-bottom: 2px;
	}
	.contact-value {
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.join-cta {
		margin-top: 4px;
		width: 100%;
		border-radius: 16px;
		padding: 18px 22px;
		justify-content: space-between;
		gap: 12px;
	}
	.join-cta-text {
		display: flex;
		flex-direction: column;
		text-align: left;
	}
	.join-cta-title {
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.join-cta-sub {
		font-size: 11px;
		opacity: 0.75;
		margin-top: 2px;
		letter-spacing: 0.04em;
		font-weight: 400;
	}
	.join-cta-arrow {
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.contact-socials {
		display: flex;
		gap: 8px;
		margin-top: 4px;
	}
	.social-btn {
		flex: 1;
		border-radius: 12px;
		padding: 12px 8px;
		flex-direction: column;
		gap: 4px;
	}
	.social-label {
		font-size: 10px;
		letter-spacing: 0.1em;
		font-weight: 600;
	}

	@media (prefers-reduced-motion: reduce) {
		.contact-row {
			transition: none;
		}
	}
</style>
