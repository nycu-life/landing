<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { productStatusLabel, type DevLogEntry } from '$lib/content/landing';

	let {
		entry,
		index,
		expanded,
		ontoggle
	}: {
		entry: DevLogEntry;
		index: number;
		expanded: boolean;
		ontoggle: () => void;
	} = $props();

	// Real entries alternate between the design's two diary treatments.
	const kind = $derived(index % 2 === 0 ? 'polaroid' : 'postcard');

	// Tape/postmark accent per entry, from the design palette.
	const accents = ['#FFD93D', '#A3E052', '#FF8C5A', '#A5D8FF'];
	const accent = $derived(accents[index % accents.length]);

	// Abstract, product-themed cover gradients keyed by status (no fabricated
	// photos) — drawn from the guide's brand-blue / gold families.
	const cover: Record<DevLogEntry['status'], string> = {
		done: 'linear-gradient(135deg, #2455a8 0%, #6d9bff 100%)',
		live: 'linear-gradient(135deg, #2455a8 0%, #6d9bff 100%)',
		soon: 'linear-gradient(135deg, #e5b54d 0%, #ff8c5a 120%)',
		dev: 'linear-gradient(135deg, #121a3d 0%, #527ae0 100%)'
	};

	const statusLabel = $derived(
		entry.status === 'done' ? m.products_status_live() : productStatusLabel[entry.status]()
	);

	// Deterministic, client-only heart count (no persistence), per the design.
	let liked = $state(false);
	const baseCount = $derived(((entry.id.charCodeAt(1) * 3) % 47) + 4);
	const count = $derived(baseCount + (liked ? 1 : 0));

	function onkeydown(e: KeyboardEvent) {
		// Only react to keys aimed at the card itself (not the like button inside).
		if (e.target !== e.currentTarget) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			ontoggle();
		}
	}

	function onlike(e: MouseEvent) {
		// Liking must not collapse/expand the card.
		e.stopPropagation();
		liked = !liked;
	}
</script>

<article class="entry nl-flow glass entry-{kind}" class:glass-strong={expanded} data-flow-card>
	<!-- accent glow strip top -->
	<span
		class="entry-glow"
		aria-hidden="true"
		style="background: radial-gradient(circle at 40% 50%, {accent}66 0%, transparent 70%)"
	></span>

	{#if kind === 'polaroid'}
		<div class="polaroid" style="background: {cover[entry.status]}">
			<span class="polaroid-sheen" aria-hidden="true"></span>
		</div>
	{:else}
		<div class="postcard">
			<!-- glass postmark (decorative; date + status repeat in the cue row) -->
			<span
				class="postmark"
				aria-hidden="true"
				style="border-color: {accent}66; background: radial-gradient(circle, {accent}22 0%, transparent 70%)"
			>
				<span>NYCU·LIFE</span>
				<span class="postmark-date">{entry.date()}</span>
				<span class="postmark-status">{statusLabel}</span>
			</span>
			<p class="postcard-quote">「{entry.title()}」</p>
		</div>
	{/if}

	<!-- meta + excerpt: the whole lower area toggles; role=button (not <button>)
	     because the expanded footer contains a real like <button> inside it. -->
	<div
		class="entry-toggle"
		role="button"
		tabindex="0"
		aria-expanded={expanded}
		onclick={ontoggle}
		{onkeydown}
	>
		{#if kind === 'polaroid'}
			<h3 class="entry-title">{entry.title()}</h3>
		{/if}

		<p class="entry-excerpt" class:tucked={expanded}>{entry.body()}</p>

		<!-- expanded body -->
		<div class="entry-more" class:open={expanded}>
			<div class="entry-more-inner">
				<hr class="entry-rule" />
				<p class="entry-body">{entry.body()}</p>

				<div class="entry-foot">
					<span class="entry-note">{m.devlog_note_placeholder()}</span>
					<button
						class="entry-like"
						class:liked
						aria-pressed={liked}
						aria-label={m.devlog_like_label()}
						onclick={onlike}
					>
						<span class="entry-like-circle">
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.7"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path
									d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
								/>
							</svg>
						</span>
						<span class="entry-like-count">{count}</span>
					</button>
				</div>
			</div>
		</div>

		<!-- expand cue -->
		<div class="entry-cue">
			<span class="entry-cue-meta">{entry.date()} · {statusLabel}</span>
			<span class="entry-cue-action">
				{expanded ? m.devlog_collapse() : m.devlog_read_more()}
				<span class="entry-chev" class:flip={expanded} aria-hidden="true">
					<svg
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M6 9l6 6 6-6" />
					</svg>
				</span>
			</span>
		</div>
	</div>
</article>

<style>
	.entry {
		position: relative;
		overflow: hidden;
		border-radius: 16px;
		color: var(--ink);
		transition:
			background 0.35s ease,
			box-shadow 0.35s ease;
	}
	.entry-polaroid {
		padding: 14px 14px 12px;
	}
	.entry-postcard {
		padding: 18px 18px 14px;
	}

	.entry-glow {
		position: absolute;
		top: -30px;
		left: 20px;
		width: 160px;
		height: 80px;
		filter: blur(6px);
		pointer-events: none;
	}

	/* ── polaroid block ── */
	.polaroid {
		position: relative;
		max-width: 260px;
		margin: 2px auto 4px;
		aspect-ratio: 16 / 10;
		border-radius: 14px;
		overflow: hidden;
		border: 1px solid var(--line);
		box-shadow: var(--shadow-card);
	}
	.polaroid-sheen {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, transparent 42%);
	}

	/* ── postcard block ── */
	.postcard {
		position: relative;
		padding: 6px 0 14px;
	}
	.postmark {
		position: absolute;
		top: -2px;
		right: -2px;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		border: 1px solid;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--ink-soft);
		opacity: 0.9;
		font-size: 8px;
		letter-spacing: 0.1em;
		font-weight: 700;
		line-height: 1.3;
	}
	.postmark-date {
		margin-top: 2px;
		font-size: 10px;
		letter-spacing: 0;
	}
	.postmark-status {
		margin-top: 1px;
		font-size: 6px;
		opacity: 0.7;
	}
	.postcard-quote {
		margin: 0 0 8px;
		padding-right: 60px;
		font-size: 21px;
		line-height: 1.3;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--ink);
	}

	/* ── toggle area ── */
	.entry-toggle {
		display: block;
		width: 100%;
		margin-top: 12px;
		text-align: left;
		cursor: pointer;
	}
	.entry-toggle:focus-visible {
		outline: 2px solid var(--brand-ink);
		outline-offset: 3px;
		border-radius: 0.4rem;
	}
	.entry-title {
		margin: 0 0 8px;
		font-size: 18px;
		font-weight: 800;
		letter-spacing: -0.02em;
		line-height: 1.25;
	}
	.entry-excerpt {
		margin: 0;
		font-size: 13.5px;
		line-height: 1.55;
		color: var(--ink-soft);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		max-height: 3.2em; /* ≈ two clamped lines, so the tuck can animate */
		transition:
			max-height 0.55s cubic-bezier(0.65, 0.05, 0.36, 1),
			opacity 0.35s ease;
	}
	/* While the full body expands below, the teaser folds away (no duplicate text). */
	.entry-excerpt.tucked {
		max-height: 0;
		opacity: 0;
	}

	.entry-more {
		max-height: 0;
		opacity: 0;
		overflow: hidden;
		transition:
			max-height 0.55s cubic-bezier(0.65, 0.05, 0.36, 1),
			opacity 0.35s ease;
	}
	.entry-more.open {
		max-height: 3000px;
		opacity: 1;
	}
	.entry-more-inner {
		padding-top: 12px;
	}
	.entry-rule {
		border: none;
		border-top: 1px solid var(--line);
		margin: 0 0 12px;
	}
	.entry-body {
		margin: 0;
		font-family: var(--font-cjk);
		font-size: 14.5px;
		line-height: 1.7;
		color: var(--ink-soft);
		white-space: pre-line;
	}

	/* ── expanded footer: leave-a-note + like ── */
	.entry-foot {
		margin-top: 16px;
		padding-top: 14px;
		border-top: 1px solid var(--line);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.entry-note {
		display: inline-flex;
		align-items: center;
		padding: 8px 14px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid var(--line);
		font-size: 12px;
		font-weight: 500;
		color: var(--ink-soft);
	}
	.entry-like {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--ink);
	}
	.entry-like-circle {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid var(--line);
		color: var(--ink-soft);
		transition: all 0.3s cubic-bezier(0.5, 1.6, 0.5, 1);
	}
	.entry-like.liked .entry-like-circle {
		background: var(--error);
		border-color: transparent;
		color: #fff;
		transform: scale(1.05);
		box-shadow: 0 0 16px rgba(233, 107, 107, 0.5);
	}
	.entry-like-count {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.06em;
	}

	/* ── expand cue ── */
	.entry-cue {
		margin-top: 10px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.06em;
		color: var(--muted);
	}
	.entry-cue-meta {
		letter-spacing: 0.04em;
	}
	.entry-cue-action {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		text-transform: uppercase;
	}
	.entry-chev {
		display: inline-flex;
		transition: transform 0.3s ease;
	}
	.entry-chev.flip {
		transform: rotate(180deg);
	}
</style>
