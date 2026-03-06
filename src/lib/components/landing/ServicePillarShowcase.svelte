<script lang="ts">
	import type { ServicePillar, ServicePillarId } from '$lib/content/landing';
	import Icon from './Icon.svelte';

	let {
		items,
		activeId = $bindable(),
		toneLabel,
		highlightsLabel
	} = $props<{
		items: ServicePillar[];
		activeId: ServicePillarId;
		toneLabel: string;
		highlightsLabel: string;
	}>();

	const activeItem = $derived(items.find((item: ServicePillar) => item.id === activeId) ?? items[0]);
</script>

<div class="grid gap-8 xl:grid-cols-[16rem_minmax(0,1fr)]">
	<div class="grid gap-4">
		{#each items as item}
			<button
				type="button"
				class={`landing-pillar-toggle ${
					activeItem.id === item.id
						? 'landing-pillar-toggle-active'
						: 'landing-pillar-toggle-idle'
				}`}
				aria-pressed={activeItem.id === item.id}
				onclick={() => {
					activeId = item.id;
				}}
			>
				<div
					class={`rounded-[1rem] p-3 transition ${
						activeItem.id === item.id
							? 'bg-[var(--color-primary)] text-white'
							: 'bg-[var(--color-surface-strong)] text-[var(--color-ink)]'
					}`}
				>
					<Icon name={item.icon} class="h-5 w-5" />
				</div>
				<div class="space-y-1.5">
					<div class="text-[1.02rem] font-black tracking-[-0.02em] text-[var(--color-ink)]">
						{item.title}
					</div>
					<p class="max-w-[11rem] text-sm leading-6 text-[var(--color-muted)]">{item.tone}</p>
				</div>
			</button>
		{/each}
	</div>

	<div class="landing-panel overflow-hidden p-7 sm:p-9">
		<div class="grid gap-7">
			<div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_14rem] xl:items-start">
				<div class="space-y-5">
					<div class="flex flex-wrap gap-2">
						{#each activeItem.touchpoints as touchpoint}
							<span class="landing-touchpoint">{touchpoint}</span>
						{/each}
					</div>
					<h3 class="text-[1.85rem] font-black tracking-[-0.03em] text-[var(--color-ink)] sm:text-[2.2rem]">
						{activeItem.title}
					</h3>
					<p class="max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
						{activeItem.summary}
					</p>
				</div>

				<div
					class="rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-paper-strong)] p-5 text-[var(--color-ink)]"
				>
					<div
						class="text-xs font-bold tracking-[0.08em] text-[var(--color-primary)]"
					>
						{toneLabel}
					</div>
					<p class="mt-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
						{activeItem.tone}
					</p>
				</div>
			</div>

				<div class="rounded-[1.35rem] border border-[var(--color-border)] bg-white p-6">
					<div
						class="mb-4 text-sm font-bold tracking-[0.08em] text-[var(--color-primary)]"
					>
						{highlightsLabel}
					</div>
					<ul class="grid gap-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
						{#each activeItem.highlights as highlight}
							<li class="flex gap-3">
								<span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]"></span>
								<span>{highlight}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
</div>
