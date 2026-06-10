<script lang="ts">
	import { timelineEvents } from '$lib/content/about';
</script>

<div class="timeline">
	<!-- spine -->
	<span class="timeline-spine" aria-hidden="true"></span>
	{#each timelineEvents as event, i (i)}
		<div class="timeline-event" class:last={i === timelineEvents.length - 1}>
			<!-- node -->
			<span
				class="timeline-node"
				class:filled={event.kind === 'start' || event.kind === 'now'}
				class:now={event.kind === 'now'}
				aria-hidden="true"
			></span>
			<div class="timeline-meta">
				<span class="timeline-date">{event.date()}</span>
				{#if event.kind === 'start'}
					<span class="timeline-pill">START</span>
				{:else if event.kind === 'now'}
					<span class="timeline-pill">NOW</span>
				{/if}
			</div>
			<div class="timeline-title">{event.title()}</div>
			<div class="timeline-desc">{event.desc()}</div>
		</div>
	{/each}
</div>

<style>
	.timeline {
		position: relative;
		padding-left: 26px;
		margin-top: 6px;
	}
	.timeline-spine {
		position: absolute;
		left: 7px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		background: rgba(255, 255, 255, 0.25);
	}
	.timeline-event {
		position: relative;
		padding-bottom: 22px;
	}
	.timeline-event.last {
		padding-bottom: 0;
	}
	.timeline-node {
		position: absolute;
		left: -26px;
		top: 4px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.35);
		border: 2px solid rgba(255, 255, 255, 0.85);
	}
	.timeline-node.filled {
		background: #fff;
	}
	.timeline-node.now {
		box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.18);
	}
	.timeline-meta {
		display: flex;
		align-items: baseline;
		gap: 10px;
		margin-bottom: 2px;
	}
	.timeline-date {
		font-size: 11px;
		opacity: 0.65;
		letter-spacing: 0.1em;
		font-weight: 600;
	}
	.timeline-pill {
		font-size: 9px;
		padding: 2px 7px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.18);
		letter-spacing: 0.16em;
	}
	.timeline-title {
		font-size: 18px;
		font-weight: 700;
		letter-spacing: -0.01em;
		margin-bottom: 4px;
	}
	.timeline-desc {
		font-size: 13px;
		line-height: 1.45;
		opacity: 0.85;
	}
</style>
