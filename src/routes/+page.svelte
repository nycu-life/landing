<script lang="ts">
	import Icon from '$lib/components/landing/Icon.svelte';
	import SectionNav from '$lib/components/landing/SectionNav.svelte';
	import ServicePillarShowcase from '$lib/components/landing/ServicePillarShowcase.svelte';
	import type { ServicePillarId } from '$lib/content/landing';
	import {
		closingSection,
		footerLinks,
		hero,
		journeys,
		journeysSection,
		navItems,
		pageMeta,
		servicePillars,
		umbrellaSection,
		valuePillars,
		valuesSection
	} from '$lib/content/landing';

	let activeServiceId: ServicePillarId = servicePillars[0].id;
</script>

<svelte:head>
	<title>{pageMeta.title}</title>
	<meta name="description" content={pageMeta.description} />
</svelte:head>

<div class="landing-root">
	<header class="mx-auto flex w-full max-w-[75rem] flex-col gap-5 px-5 py-5 lg:px-8 lg:py-7">
		<div class="flex items-center justify-between gap-4">
			<a
				href="#top"
				class="flex items-center gap-3 text-sm font-black tracking-[0.08em] text-[var(--color-primary)]"
			>
				<span
					class="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[var(--color-primary-ghost)] text-[var(--color-primary)]"
				>
					<Icon name="spark" class="h-5 w-5" />
				</span>
				<span>NYCU.LIFE</span>
			</a>

			<a class="landing-button landing-button-secondary" href={hero.secondaryCtaHref}>
				<Icon name="branch" class="h-4 w-4" />
				<span>{hero.secondaryCtaLabel}</span>
			</a>
		</div>

		<SectionNav items={navItems} />
	</header>

	<main
		id="top"
		class="mx-auto flex w-full max-w-[75rem] flex-col gap-12 px-5 pb-24 lg:px-8 lg:gap-16 lg:pb-32"
	>
		<section
			class="landing-panel landing-hero-shell overflow-hidden px-5 py-7 sm:px-8 sm:py-10 lg:px-11 lg:py-12"
		>
			<div class="relative grid gap-10 xl:grid-cols-[minmax(0,1.04fr)_minmax(21rem,0.96fr)] xl:items-center">
				<div class="space-y-6">
					<div
						class="landing-chip w-fit text-xs font-bold tracking-[0.08em] text-[var(--color-primary)]"
					>
						<span class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></span>
						{hero.badge}
					</div>

					<div class="space-y-5">
						<h1
							class="max-w-3xl text-[2.7rem] leading-[1.03] font-black tracking-[-0.045em] text-balance text-[var(--color-ink)] sm:text-[3.2rem] lg:text-[3.75rem]"
						>
							{hero.title}
						</h1>
						<p class="max-w-xl text-base leading-8 text-[var(--color-muted)] sm:text-[1.15rem] sm:leading-8">
							{hero.summary}
						</p>
					</div>

					<div class="flex flex-wrap gap-4">
						<a class="landing-button landing-button-primary" href={hero.primaryCtaHref}>
							<span>{hero.primaryCtaLabel}</span>
							<Icon name="arrow" class="h-4 w-4" />
						</a>
					</div>

					<div class="flex flex-wrap gap-3">
						{#each hero.tags as tag}
							<span class="landing-touchpoint">{tag}</span>
						{/each}
					</div>
				</div>

				<div class="relative">
					<div class="landing-scene-panel">
						<div class="space-y-3.5">
							<p class="landing-eyebrow">{hero.sceneEyebrow}</p>
							<h2 class="max-w-sm text-[1.85rem] font-black tracking-[-0.03em] text-[var(--color-ink)] sm:text-[2.15rem]">
								{hero.sceneTitle}
							</h2>
							<p class="max-w-md text-base leading-7 text-[var(--color-muted)] sm:text-[1.05rem]">
								{hero.sceneSummary}
							</p>
						</div>

						<div class="grid gap-3.5">
							{#each hero.sceneMoments as moment}
								<article class="landing-scene-moment">
									<div class="landing-scene-time">{moment.time}</div>
									<div class="landing-scene-icon">
										<Icon name={moment.icon} class="h-5 w-5" />
									</div>
									<div class="space-y-1">
										<h3 class="text-base font-black tracking-[-0.02em] text-[var(--color-ink)]">
											{moment.title}
										</h3>
										<p class="text-sm leading-6 text-[var(--color-muted)]">
											{moment.summary}
										</p>
									</div>
								</article>
							{/each}
						</div>

						<p class="max-w-md text-sm leading-7 text-[var(--color-muted)]">
							{hero.sceneNote}
						</p>
					</div>
				</div>
			</div>
		</section>

		<section id="journeys" class="grid gap-8 pt-2 lg:gap-9">
			<div class="landing-section-head">
				<div class="space-y-4">
					<p class="landing-eyebrow">{journeysSection.eyebrow}</p>
					<h2 class="landing-section-title">{journeysSection.title}</h2>
				</div>
				<p class="max-w-xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
					{journeysSection.summary}
				</p>
			</div>

			<div class="grid gap-4 lg:grid-cols-3">
				{#each journeys as journey, index}
					<article class="landing-panel landing-journey-card flex h-full flex-col gap-6 p-7">
						<div class="flex items-start justify-between gap-4">
							<div class="landing-card-icon">
								<Icon name={journey.icon} class="h-5 w-5" />
							</div>
							<span class="landing-index-badge">0{index + 1}</span>
						</div>

						<div class="space-y-3">
							<p class="text-xs font-bold tracking-[0.3em] text-[var(--color-primary)] uppercase">
								{journey.eyebrow}
							</p>
							<h3 class="text-[1.65rem] font-black tracking-[-0.03em] text-[var(--color-ink)]">
								{journey.title}
							</h3>
							<p class="max-w-sm text-base leading-7 text-[var(--color-muted)]">
								{journey.summary}
							</p>
						</div>

						<a
							class="landing-inline-link mt-auto"
							href="#umbrella"
							onclick={() => {
								activeServiceId = journey.pillarId;
							}}
						>
							<span>{journey.anchorLabel}</span>
						</a>
					</article>
				{/each}
			</div>
		</section>

		<section id="umbrella" class="grid gap-8 pt-2 lg:gap-9">
			<div class="landing-section-head">
				<div class="space-y-4">
					<p class="landing-eyebrow">{umbrellaSection.eyebrow}</p>
					<h2 class="landing-section-title">{umbrellaSection.title}</h2>
				</div>
				<p class="max-w-xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
					{umbrellaSection.summary}
				</p>
			</div>

			<ServicePillarShowcase
				items={servicePillars}
				bind:activeId={activeServiceId}
				toneLabel={umbrellaSection.toneLabel}
				highlightsLabel={umbrellaSection.highlightsLabel}
			/>
		</section>

		<section id="why" class="grid gap-8 pt-2 lg:gap-9">
			<div class="landing-section-head">
				<div class="space-y-4">
					<p class="landing-eyebrow">{valuesSection.eyebrow}</p>
					<h2 class="landing-section-title">{valuesSection.title}</h2>
				</div>
				<p class="max-w-xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
					{valuesSection.summary}
				</p>
			</div>

			<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.05fr)]">
				{#each valuePillars as value}
					<article class="landing-panel landing-value-card flex h-full flex-col gap-5 p-7">
						<div class="landing-card-icon">
							<Icon name={value.icon} class="h-5 w-5" />
						</div>
						<h3 class="text-[1.55rem] font-black tracking-[-0.03em] text-[var(--color-ink)]">
							{value.title}
						</h3>
						<p class="max-w-sm text-base leading-7 text-[var(--color-muted)]">{value.body}</p>
					</article>
				{/each}
			</div>
		</section>

		<section id="updates" class="pt-2">
			<div class="grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(18rem,0.98fr)]">
				<div class="landing-footer-panel landing-panel flex h-full flex-col gap-6 p-7 sm:p-8">
					<div class="space-y-4">
						<p
							class="text-xs font-bold tracking-[0.32em] text-[var(--color-primary-soft)] uppercase"
						>
							{closingSection.eyebrow}
						</p>
						<h2 class="text-[2rem] font-black tracking-[-0.03em] text-white sm:text-[2.4rem]">
							{closingSection.title}
						</h2>
						<p class="max-w-3xl text-base leading-7 text-white/76 sm:text-lg">
							{closingSection.summary}
						</p>
						<p class="max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
							{closingSection.note}
						</p>
					</div>

					<div class="flex flex-wrap gap-3">
						<a class="landing-button landing-button-light" href={closingSection.primaryHref}>
							{closingSection.primaryLabel}
						</a>
						<a class="landing-button landing-button-secondary" href={closingSection.secondaryHref}>
							<Icon name="branch" class="h-4 w-4" />
							<span>{closingSection.secondaryLabel}</span>
						</a>
					</div>
				</div>

				<aside class="landing-panel flex h-full flex-col justify-between gap-6 p-7 sm:p-8">
					<div class="space-y-3">
						<p class="landing-eyebrow">{closingSection.linksEyebrow}</p>
						<h3 class="text-2xl font-black tracking-[-0.03em] text-[var(--color-ink)]">
							{closingSection.linksTitle}
						</h3>
						<p class="text-base leading-8 text-[var(--color-muted)]">
							{closingSection.footerNote}
						</p>
					</div>

					<div class="grid gap-3">
						{#each footerLinks as link}
							<a class="landing-inline-link" href={link.href}>
								<span class="grid gap-1">
									<span class="font-semibold text-[var(--color-ink)]">{link.label}</span>
									<span class="text-sm leading-6 text-[var(--color-muted)]">
										{link.description}
									</span>
								</span>
							</a>
						{/each}
					</div>
				</aside>
			</div>
		</section>
	</main>
</div>
