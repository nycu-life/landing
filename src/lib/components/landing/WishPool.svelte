<script lang="ts">
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import {
		createWish,
		listWishes,
		reportWish,
		toggleWishSupport,
		wishCategories,
		type Wish,
		type WishCategory,
		type WishStatus
	} from '$lib/wishes';

	const previewWishes: Wish[] = [
		{
			id: 'preview-gym',
			title: '想知道健身房現在有多少人',
			detail: '出發前就能判斷要不要換個時段。',
			category: 'life',
			status: 'picked',
			teamResponse: '正在確認場館是否有可使用的人流資料。',
			supportCount: 42,
			supportedByMe: false,
			createdAt: '2026-08-29T10:00:00Z'
		},
		{
			id: 'preview-bus',
			title: '希望校車能顯示即時擁擠度',
			detail: '',
			category: 'transport',
			status: 'picked',
			teamResponse: '',
			supportCount: 31,
			supportedByMe: false,
			createdAt: '2026-08-28T08:30:00Z'
		},
		{
			id: 'preview-outlets',
			title: '想找有插座的自習空間',
			detail: '希望地圖上也能標示開放時間。',
			category: 'learning',
			status: 'building',
			teamResponse: '校園地圖團隊已開始整理空間資料。',
			supportCount: 18,
			supportedByMe: false,
			createdAt: '2026-08-27T15:20:00Z'
		},
		{
			id: 'preview-lost',
			title: '希望失物招領資訊可以整合',
			detail: '',
			category: 'life',
			status: 'fulfilled',
			teamResponse: '第一版已經上線，謝謝大家一起補充來源。',
			supportCount: 55,
			supportedByMe: true,
			createdAt: '2026-08-24T03:40:00Z'
		},
		{
			id: 'preview-food',
			title: '想知道餐廳今天有沒有營業',
			detail: '',
			category: 'life',
			status: 'new',
			teamResponse: '',
			supportCount: 7,
			supportedByMe: false,
			createdAt: '2026-08-30T00:40:00Z'
		}
	];

	let wishes = $state<Wish[]>([]);
	let selected = $state<Wish | null>(null);
	let activeCategory = $state<WishCategory | 'all'>('all');
	let title = $state('');
	let detail = $state('');
	let category = $state<WishCategory>('life');
	let loading = $state(true);
	let submitting = $state(false);
	let error = $state('');
	let notice = $state('');
	let reportOpen = $state(false);
	let reporting = $state(false);
	let justCreatedId = $state('');
	let previewMode = $state(false);
	let dialogEl: HTMLDialogElement;

	const visibleWishes = $derived(
		activeCategory === 'all' ? wishes : wishes.filter((wish) => wish.category === activeCategory)
	);

	const categoryLabel = (value: WishCategory | 'all') => {
		if (value === 'all') return m.wish_category_all();
		return {
			life: m.wish_category_life,
			transport: m.wish_category_transport,
			learning: m.wish_category_learning,
			space: m.wish_category_space,
			other: m.wish_category_other
		}[value]();
	};
	const categoryGlyph = (value: WishCategory) =>
		({ life: '☀', transport: '↗', learning: '✎', space: '⌂', other: '✦' })[value];
	const statusLabel = (value: WishStatus) =>
		({
			new: m.wish_status_new,
			picked: m.wish_status_picked,
			building: m.wish_status_building,
			fulfilled: m.wish_status_fulfilled,
			declined: m.wish_status_declined
		})[value]();

	$effect(() => {
		if (!dialogEl) return;
		if (selected && !dialogEl.open) dialogEl.showModal();
		if (!selected && dialogEl.open) dialogEl.close();
	});

	onMount(() => {
		const controller = new AbortController();
		previewMode = dev && new URL(window.location.href).searchParams.get('wish-preview') === '1';
		if (previewMode) {
			wishes = previewWishes;
			loading = false;
			return () => controller.abort();
		}
		void listWishes(controller.signal)
			.then((items) => (wishes = items))
			.catch(() => (error = m.wish_error_load()))
			.finally(() => (loading = false));
		return () => controller.abort();
	});

	async function submitWish(event: SubmitEvent) {
		event.preventDefault();
		const cleanTitle = title.trim();
		if (cleanTitle.length < 4) {
			error = m.wish_error_short();
			return;
		}
		error = '';
		notice = '';
		submitting = true;
		try {
			let result: { wish: Wish; pending: boolean };
			if (previewMode) {
				result = {
					wish: {
						id: `preview-${Date.now()}`,
						title: cleanTitle,
						detail: detail.trim(),
						category,
						status: 'new',
						teamResponse: '',
						supportCount: 1,
						supportedByMe: true,
						createdAt: new Date().toISOString()
					},
					pending: false
				};
			} else {
				result = await createWish({ title: cleanTitle, detail: detail.trim(), category });
			}
			if (!result.pending) {
				wishes = [result.wish, ...wishes];
				justCreatedId = result.wish.id;
				setTimeout(() => (justCreatedId = ''), 1200);
			}
			title = '';
			detail = '';
			notice = result.pending ? m.wish_notice_pending() : m.wish_notice_published();
		} catch (caught) {
			error = caught instanceof Error ? caught.message : m.wish_error_submit();
		} finally {
			submitting = false;
		}
	}

	async function toggleSupport() {
		if (!selected) return;
		error = '';
		try {
			const result = previewMode
				? {
						supported: !selected.supportedByMe,
						supportCount: selected.supportCount + (selected.supportedByMe ? -1 : 1)
					}
				: await toggleWishSupport(selected.id);
			const updated = {
				...selected,
				supportedByMe: result.supported,
				supportCount: result.supportCount
			};
			selected = updated;
			wishes = wishes.map((wish) => (wish.id === updated.id ? updated : wish));
		} catch (caught) {
			error = caught instanceof Error ? caught.message : m.wish_error_support();
		}
	}

	async function submitReport(reason: string) {
		if (!selected || reporting) return;
		reporting = true;
		try {
			if (!previewMode) await reportWish(selected.id, reason);
			reportOpen = false;
			notice = m.wish_notice_reported();
			selected = null;
		} catch (caught) {
			error = caught instanceof Error ? caught.message : m.wish_error_report();
		} finally {
			reporting = false;
		}
	}
</script>

<section id="wishes" class="wish-pool" aria-labelledby="wish-pool-title">
	<div class="wish-glow wish-glow-a" aria-hidden="true"></div>
	<div class="wish-glow wish-glow-b" aria-hidden="true"></div>
	<header class="wish-heading">
		<div>
			<p class="wish-eyebrow">WISH POOL · {m.wish_eyebrow()}</p>
			<h2 id="wish-pool-title">{m.wish_title()}</h2>
		</div>
		<p>{m.wish_lede()}</p>
	</header>

	<form class="wish-composer" onsubmit={submitWish} aria-describedby="wish-privacy-note">
		<label class="wish-title-field">
			<span class="sr-only">{m.wish_input_label()}</span>
			<input
				bind:value={title}
				maxlength="120"
				placeholder={m.wish_input_placeholder()}
				autocomplete="off"
				disabled={submitting}
			/>
		</label>
		<label class="wish-category-field">
			<span class="sr-only">{m.wish_category_label()}</span>
			<select bind:value={category} disabled={submitting}>
				{#each wishCategories as option (option)}
					<option value={option}>{categoryLabel(option)}</option>
				{/each}
			</select>
		</label>
		<button class="wish-submit" type="submit" disabled={submitting}>
			{submitting ? m.wish_submitting() : m.wish_submit()} <span aria-hidden="true">↘</span>
		</button>
		<details class="wish-detail-field">
			<summary>{m.wish_detail_toggle()}</summary>
			<label>
				<span class="sr-only">{m.wish_detail_label()}</span>
				<textarea
					bind:value={detail}
					maxlength="500"
					rows="3"
					placeholder={m.wish_detail_placeholder()}
					disabled={submitting}
				></textarea>
			</label>
		</details>
	</form>
	<p id="wish-privacy-note" class="wish-privacy">
		<strong>{m.wish_privacy_title()}</strong> · {m.wish_privacy_body()}
	</p>
	<div class="wish-feedback" aria-live="polite">
		{#if error}<p class="wish-error">{error}</p>{/if}
		{#if notice}<p class="wish-notice">{notice}</p>{/if}
	</div>

	<div class="wish-filter" aria-label={m.wish_filter_label()}>
		{#each ['all', ...wishCategories] as option (option)}
			<button
				type="button"
				class:active={activeCategory === option}
				aria-pressed={activeCategory === option}
				onclick={() => (activeCategory = option as WishCategory | 'all')}
			>
				{categoryLabel(option as WishCategory | 'all')}
			</button>
		{/each}
	</div>

	<div class="wish-water" class:is-empty={!loading && visibleWishes.length === 0}>
		<div class="wish-current" aria-hidden="true"></div>
		{#if loading}
			<p class="wish-state" role="status">{m.wish_loading()}</p>
		{:else if visibleWishes.length === 0}
			<div class="wish-state">
				<strong>{m.wish_empty_title()}</strong>
				<span>{m.wish_empty_body()}</span>
			</div>
		{:else}
			<div class="wish-float-grid">
				{#each visibleWishes as wish, index (wish.id)}
					<button
						type="button"
						class="wish-card wish-position-{index % 8}"
						class:is-new={justCreatedId === wish.id}
						onclick={() => {
							selected = wish;
							reportOpen = false;
						}}
						aria-label={`${wish.title}，${statusLabel(wish.status)}`}
					>
						<span class="wish-card-glyph" aria-hidden="true">{categoryGlyph(wish.category)}</span>
						<span class="wish-card-copy">
							<strong>{wish.title}</strong>
							<small
								>{statusLabel(wish.status)} · {wish.supportCount} {m.wish_support_people()}</small
							>
						</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<dialog
		bind:this={dialogEl}
		class="wish-dialog"
		onclose={() => {
			selected = null;
			reportOpen = false;
		}}
		onclick={(event) => {
			if (event.target === dialogEl) selected = null;
		}}
	>
		{#if selected}
			<button
				class="wish-dialog-close"
				type="button"
				onclick={() => (selected = null)}
				aria-label={m.wish_close()}>×</button
			>
			<div class="wish-dialog-head">
				<span class="wish-dialog-glyph" aria-hidden="true">{categoryGlyph(selected.category)}</span>
				<div>
					<p>{categoryLabel(selected.category)} · {statusLabel(selected.status)}</p>
					<h3>{selected.title}</h3>
				</div>
			</div>
			{#if selected.detail}<p class="wish-dialog-detail">{selected.detail}</p>{/if}
			<div class="wish-journey" aria-label={m.wish_journey_label()}>
				{#each ['new', 'picked', 'building', 'fulfilled'] as step, index (step)}
					<span
						class:reached={['new', 'picked', 'building', 'fulfilled'].indexOf(selected.status) >=
							index}
					>
						<i></i>{statusLabel(step as WishStatus)}
					</span>
				{/each}
			</div>
			{#if selected.teamResponse}
				<blockquote>
					<strong>NYCU LIFE</strong>
					<p>{selected.teamResponse}</p>
				</blockquote>
			{/if}
			<div class="wish-dialog-actions">
				<button
					type="button"
					class="wish-support"
					class:supported={selected.supportedByMe}
					aria-pressed={selected.supportedByMe}
					onclick={toggleSupport}
				>
					{selected.supportedByMe ? '✓' : '+'}
					{m.wish_support()} · {selected.supportCount}
				</button>
				<button class="wish-report-toggle" type="button" onclick={() => (reportOpen = !reportOpen)}>
					{m.wish_report()}
				</button>
			</div>
			{#if reportOpen}
				<div class="wish-report-options" aria-label={m.wish_report_reason()}>
					<button type="button" disabled={reporting} onclick={() => submitReport('personal_data')}
						>{m.wish_report_personal()}</button
					>
					<button type="button" disabled={reporting} onclick={() => submitReport('abuse')}
						>{m.wish_report_abuse()}</button
					>
					<button type="button" disabled={reporting} onclick={() => submitReport('spam')}
						>{m.wish_report_spam()}</button
					>
				</div>
			{/if}
		{/if}
	</dialog>
</section>

<style>
	.wish-pool {
		position: relative;
		overflow: hidden;
		scroll-margin-top: 5.5rem;
		padding: clamp(4rem, 8vw, 7rem) var(--gutter) clamp(3.5rem, 8vw, 6.5rem);
		background:
			radial-gradient(circle at 16% 10%, rgba(185, 238, 255, 0.72), transparent 31%),
			radial-gradient(circle at 86% 8%, rgba(255, 234, 184, 0.72), transparent 28%), #f8fbff;
		color: #1d2939;
	}
	:global(html[data-theme='dark']) .wish-pool {
		background:
			radial-gradient(circle at 16% 10%, rgba(21, 70, 104, 0.72), transparent 31%),
			radial-gradient(circle at 86% 8%, rgba(79, 58, 24, 0.62), transparent 28%), #101a29;
		color: #edf5ff;
	}
	.wish-glow {
		position: absolute;
		border-radius: 50%;
		filter: blur(30px);
		pointer-events: none;
	}
	.wish-glow-a {
		width: 16rem;
		height: 16rem;
		left: -8rem;
		top: 14rem;
		background: rgba(81, 187, 239, 0.12);
	}
	.wish-glow-b {
		width: 14rem;
		height: 14rem;
		right: -7rem;
		top: 5rem;
		background: rgba(242, 173, 65, 0.1);
	}
	.wish-heading {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(16rem, 30rem);
		align-items: end;
		gap: 2rem;
		width: min(70rem, 100%);
		margin: 0 auto clamp(1.8rem, 4vw, 3rem);
	}
	.wish-eyebrow {
		margin: 0 0 0.75rem;
		color: #397dd8;
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.17em;
	}
	.wish-heading h2 {
		margin: 0;
		font-size: clamp(2.5rem, 6vw, 5.2rem);
		line-height: 0.98;
		letter-spacing: -0.055em;
	}
	.wish-heading > p {
		margin: 0;
		color: #617188;
		line-height: 1.8;
	}
	:global(html[data-theme='dark']) .wish-heading > p {
		color: #afbed1;
	}
	.wish-composer {
		position: relative;
		z-index: 3;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		gap: 0.65rem;
		width: min(70rem, 100%);
		margin: 0 auto;
		padding: 0.6rem;
		border: 1px solid #d6e2ef;
		border-radius: 1.3rem;
		background: rgba(255, 255, 255, 0.9);
		box-shadow: 0 1.15rem 3rem rgba(56, 97, 137, 0.13);
	}
	:global(html[data-theme='dark']) .wish-composer {
		border-color: #40536b;
		background: rgba(23, 35, 53, 0.94);
		box-shadow: 0 1.15rem 3rem rgba(0, 0, 0, 0.28);
	}
	.wish-title-field {
		min-width: 0;
	}
	.wish-title-field input,
	.wish-detail-field textarea {
		width: 100%;
		border: 0;
		outline: 0;
		background: transparent;
		color: inherit;
		font: inherit;
	}
	.wish-title-field input {
		min-height: 3.2rem;
		padding: 0.75rem 0.9rem;
		font-size: 1rem;
	}
	.wish-title-field input::placeholder,
	.wish-detail-field textarea::placeholder {
		color: #8999aa;
	}
	.wish-category-field select {
		height: 100%;
		min-height: 3.2rem;
		border: 0;
		border-radius: 0.85rem;
		padding: 0 2.25rem 0 0.9rem;
		background: #eef5fb;
		color: inherit;
		font: 700 0.82rem inherit;
	}
	:global(html[data-theme='dark']) .wish-category-field select {
		background: #26384c;
	}
	.wish-submit {
		min-height: 3.2rem;
		border: 0;
		border-radius: 0.85rem;
		padding: 0 1.25rem;
		background: linear-gradient(135deg, #2d83f7, #7859ee);
		color: #fff;
		font: 800 0.86rem inherit;
		box-shadow: 0 0.55rem 1.2rem rgba(74, 88, 226, 0.25);
		cursor: pointer;
	}
	.wish-submit:disabled {
		opacity: 0.62;
		cursor: wait;
	}
	.wish-detail-field {
		grid-column: 1 / -1;
		padding: 0 0.8rem 0.3rem;
	}
	.wish-detail-field summary {
		width: fit-content;
		color: #617188;
		font-size: 0.76rem;
		cursor: pointer;
	}
	:global(html[data-theme='dark']) .wish-detail-field summary {
		color: #afbed1;
	}
	.wish-detail-field textarea {
		margin-top: 0.6rem;
		padding: 0.7rem 0;
		resize: vertical;
		line-height: 1.6;
	}
	.wish-privacy {
		width: min(70rem, 100%);
		margin: 0.72rem auto 0;
		color: #718298;
		text-align: center;
		font-size: 0.72rem;
	}
	:global(html[data-theme='dark']) .wish-privacy {
		color: #92a5bb;
	}
	.wish-feedback {
		min-height: 2.3rem;
		display: grid;
		place-items: center;
		width: min(70rem, 100%);
		margin: 0 auto;
		font-size: 0.78rem;
	}
	.wish-feedback p {
		margin: 0.75rem 0 0;
	}
	.wish-error {
		color: #b42318;
	}
	.wish-notice {
		color: #087a4b;
	}
	:global(html[data-theme='dark']) .wish-error {
		color: #ff8f87;
	}
	:global(html[data-theme='dark']) .wish-notice {
		color: #71d5aa;
	}
	.wish-filter {
		position: relative;
		z-index: 2;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
		width: min(70rem, 100%);
		margin: 0 auto 1.1rem;
	}
	.wish-filter button {
		border: 1px solid rgba(83, 119, 151, 0.2);
		border-radius: 999px;
		padding: 0.52rem 0.85rem;
		background: rgba(255, 255, 255, 0.44);
		color: #62758b;
		font: 700 0.72rem inherit;
		cursor: pointer;
	}
	.wish-filter button.active {
		border-color: #4a8ee8;
		background: #fff;
		color: #226dbe;
		box-shadow: 0 0.4rem 1rem rgba(57, 125, 216, 0.12);
	}
	:global(html[data-theme='dark']) .wish-filter button {
		border-color: rgba(168, 205, 240, 0.16);
		background: rgba(24, 49, 70, 0.4);
		color: #9badc2;
	}
	:global(html[data-theme='dark']) .wish-filter button.active {
		border-color: #568ec7;
		background: #253f5b;
		color: #b9dbff;
	}
	.wish-water {
		position: relative;
		isolation: isolate;
		width: min(76rem, calc(100% + 3rem));
		min-height: 24rem;
		margin: 0 auto;
		overflow: hidden;
		border: 1px solid rgba(106, 174, 211, 0.2);
		border-radius: 2.2rem;
		background:
			radial-gradient(ellipse at 50% 110%, rgba(77, 184, 236, 0.32), transparent 60%),
			linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(205, 239, 252, 0.58));
	}
	:global(html[data-theme='dark']) .wish-water {
		border-color: rgba(130, 186, 228, 0.13);
		background:
			radial-gradient(ellipse at 50% 110%, rgba(35, 129, 174, 0.34), transparent 60%),
			linear-gradient(180deg, rgba(9, 25, 40, 0.2), rgba(9, 56, 84, 0.5));
	}
	.wish-water.is-empty {
		display: grid;
		place-items: center;
	}
	.wish-current {
		position: absolute;
		inset: 16% -10% auto;
		height: 42%;
		border-top: 1px solid rgba(41, 151, 204, 0.26);
		border-radius: 50%;
		transform: rotate(-2deg);
		pointer-events: none;
	}
	.wish-current::after {
		content: '';
		position: absolute;
		inset: 5.5rem 0 auto;
		height: 100%;
		border-top: 1px solid rgba(41, 151, 204, 0.16);
		border-radius: 50%;
		transform: rotate(4deg);
	}
	.wish-float-grid {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: clamp(0.8rem, 2vw, 1.4rem);
		padding: 2.1rem clamp(1rem, 4vw, 3rem) 3rem;
	}
	.wish-card {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: 0.65rem;
		min-height: 5rem;
		border: 1px solid rgba(255, 255, 255, 0.86);
		border-radius: 1.25rem 1.25rem 1.55rem 1.55rem;
		padding: 0.82rem;
		background: rgba(255, 255, 255, 0.84);
		color: inherit;
		text-align: left;
		box-shadow: 0 0.8rem 1.8rem rgba(57, 112, 152, 0.14);
		cursor: pointer;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.wish-card:hover {
		transform: translateY(-0.3rem) scale(1.015);
		box-shadow: 0 1rem 2rem rgba(57, 112, 152, 0.2);
	}
	:global(html[data-theme='dark']) .wish-card {
		border-color: rgba(177, 218, 244, 0.2);
		background: rgba(24, 49, 70, 0.88);
		box-shadow: 0 0.8rem 1.8rem rgba(0, 0, 0, 0.25);
	}
	.wish-position-1,
	.wish-position-5 {
		margin-top: 2.4rem;
	}
	.wish-position-2,
	.wish-position-6 {
		margin-top: 0.8rem;
	}
	.wish-position-3,
	.wish-position-7 {
		margin-top: 3.4rem;
	}
	.wish-card.is-new {
		animation: wish-drop 0.8s cubic-bezier(0.2, 0.8, 0.25, 1.2);
	}
	.wish-card-glyph {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.75rem;
		background: #e9f4ff;
		color: #2478ca;
		font-weight: 900;
		animation: wish-float 5s ease-in-out infinite;
	}
	.wish-position-1 .wish-card-glyph,
	.wish-position-5 .wish-card-glyph {
		animation-delay: -1s;
	}
	.wish-position-2 .wish-card-glyph,
	.wish-position-6 .wish-card-glyph {
		animation-delay: -2s;
	}
	.wish-position-3 .wish-card-glyph,
	.wish-position-7 .wish-card-glyph {
		animation-delay: -3s;
	}
	:global(html[data-theme='dark']) .wish-card-glyph {
		background: #27405b;
		color: #9ed0ff;
	}
	.wish-card-copy {
		min-width: 0;
	}
	.wish-card-copy strong {
		display: -webkit-box;
		overflow: hidden;
		font-size: 0.82rem;
		line-height: 1.35;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.wish-card-copy small {
		display: block;
		margin-top: 0.3rem;
		color: #71839a;
		font-size: 0.65rem;
	}
	:global(html[data-theme='dark']) .wish-card-copy small {
		color: #9badc2;
	}
	.wish-state {
		position: relative;
		z-index: 2;
		display: grid;
		gap: 0.4rem;
		place-items: center;
		margin: 0;
		color: #617188;
		text-align: center;
	}
	.wish-state strong {
		color: #29415d;
		font-size: 1rem;
	}
	:global(html[data-theme='dark']) .wish-state {
		color: #9badc2;
	}
	:global(html[data-theme='dark']) .wish-state strong {
		color: #d5e6f8;
	}
	.wish-dialog {
		width: min(38rem, calc(100% - 2rem));
		max-height: calc(100dvh - 2rem);
		border: 1px solid #d8e4ef;
		border-radius: 1.5rem;
		padding: clamp(1.25rem, 4vw, 2rem);
		background: #fff;
		color: #1d2939;
		box-shadow: 0 2rem 6rem rgba(10, 34, 54, 0.28);
	}
	.wish-dialog::backdrop {
		background: rgba(7, 18, 30, 0.56);
		backdrop-filter: blur(6px);
	}
	:global(html[data-theme='dark']) .wish-dialog {
		border-color: #3d526c;
		background: #121f30;
		color: #edf5ff;
	}
	.wish-dialog-close {
		position: absolute;
		top: 0.8rem;
		right: 0.8rem;
		width: 2.4rem;
		height: 2.4rem;
		border: 0;
		border-radius: 50%;
		background: #eef4f9;
		color: inherit;
		font-size: 1.4rem;
		cursor: pointer;
	}
	:global(html[data-theme='dark']) .wish-dialog-close {
		background: #26384c;
	}
	.wish-dialog-head {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 0.9rem;
		align-items: center;
		padding-right: 2rem;
	}
	.wish-dialog-glyph {
		display: grid;
		place-items: center;
		width: 3.2rem;
		height: 3.2rem;
		border-radius: 1rem;
		background: #e9f4ff;
		color: #2478ca;
		font-size: 1.3rem;
		font-weight: 900;
	}
	:global(html[data-theme='dark']) .wish-dialog-glyph {
		background: #27405b;
		color: #9ed0ff;
	}
	.wish-dialog-head p {
		margin: 0 0 0.25rem;
		color: #397dd8;
		font-size: 0.7rem;
		font-weight: 800;
		letter-spacing: 0.06em;
	}
	.wish-dialog-head h3 {
		margin: 0;
		font-size: clamp(1.25rem, 4vw, 1.65rem);
		line-height: 1.25;
		letter-spacing: -0.025em;
	}
	.wish-dialog-detail {
		margin: 1.2rem 0 0;
		color: #617188;
		line-height: 1.7;
	}
	:global(html[data-theme='dark']) .wish-dialog-detail {
		color: #afbed1;
	}
	.wish-journey {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		margin: 1.5rem 0;
	}
	.wish-journey span {
		position: relative;
		display: grid;
		gap: 0.4rem;
		color: #8a9aab;
		font-size: 0.65rem;
		text-align: center;
	}
	.wish-journey span::before {
		content: '';
		position: absolute;
		z-index: -1;
		top: 0.35rem;
		left: -50%;
		width: 100%;
		height: 1px;
		background: #d9e3ed;
	}
	.wish-journey span:first-child::before {
		display: none;
	}
	.wish-journey i {
		width: 0.75rem;
		height: 0.75rem;
		margin: 0 auto;
		border: 2px solid #c3d0dc;
		border-radius: 50%;
		background: #fff;
	}
	.wish-journey span.reached {
		color: #2478ca;
		font-weight: 800;
	}
	.wish-journey span.reached::before,
	.wish-journey span.reached i {
		border-color: #4a94e7;
		background: #4a94e7;
	}
	:global(html[data-theme='dark']) .wish-journey span::before {
		background: #3b4c60;
	}
	:global(html[data-theme='dark']) .wish-journey i {
		border-color: #53677d;
		background: #121f30;
	}
	:global(html[data-theme='dark']) .wish-journey span.reached::before,
	:global(html[data-theme='dark']) .wish-journey span.reached i {
		border-color: #75b7fa;
		background: #75b7fa;
	}
	.wish-dialog blockquote {
		margin: 1.2rem 0;
		border-left: 3px solid #4a94e7;
		border-radius: 0 0.8rem 0.8rem 0;
		padding: 0.9rem 1rem;
		background: #f1f7fd;
	}
	.wish-dialog blockquote strong {
		color: #2478ca;
		font-size: 0.7rem;
		letter-spacing: 0.08em;
	}
	.wish-dialog blockquote p {
		margin: 0.35rem 0 0;
		line-height: 1.6;
	}
	:global(html[data-theme='dark']) .wish-dialog blockquote {
		background: #1c3045;
	}
	.wish-dialog-actions {
		display: flex;
		justify-content: space-between;
		gap: 0.7rem;
		margin-top: 1.3rem;
	}
	.wish-support,
	.wish-report-toggle,
	.wish-report-options button {
		border-radius: 0.8rem;
		padding: 0.75rem 1rem;
		font: 800 0.76rem inherit;
		cursor: pointer;
	}
	.wish-support {
		border: 1px solid #bcd4eb;
		background: transparent;
		color: #236fbe;
	}
	.wish-support.supported {
		background: #e8f4ff;
	}
	.wish-report-toggle {
		border: 0;
		background: transparent;
		color: #7b8998;
	}
	:global(html[data-theme='dark']) .wish-support {
		border-color: #49647e;
		color: #87c2ff;
	}
	:global(html[data-theme='dark']) .wish-support.supported {
		background: #253f5c;
	}
	.wish-report-options {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin-top: 0.7rem;
		padding-top: 0.7rem;
		border-top: 1px solid #e2e9f0;
	}
	.wish-report-options button {
		border: 1px solid #d6e1eb;
		background: transparent;
		color: #65788c;
	}
	:global(html[data-theme='dark']) .wish-report-options {
		border-color: #33475d;
	}
	:global(html[data-theme='dark']) .wish-report-options button {
		border-color: #40566e;
		color: #a8bbcf;
	}
	@keyframes wish-float {
		0%,
		100% {
			translate: 0 0;
		}
		50% {
			translate: 0 -0.38rem;
		}
	}
	@keyframes wish-drop {
		0% {
			opacity: 0;
			transform: translateY(-8rem) scale(0.72) rotate(-3deg);
		}
		70% {
			opacity: 1;
			transform: translateY(0.4rem) scale(1.03);
		}
		100% {
			transform: none;
		}
	}
	@media (max-width: 860px) {
		.wish-heading {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		.wish-heading > p {
			max-width: 38rem;
		}
		.wish-float-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.wish-water {
			width: 100%;
		}
		.wish-position-1,
		.wish-position-3,
		.wish-position-5,
		.wish-position-7 {
			margin-top: 2rem;
		}
		.wish-position-2,
		.wish-position-6 {
			margin-top: 0;
		}
	}
	@media (max-width: 620px) {
		.wish-pool {
			padding-inline: 1rem;
		}
		.wish-composer {
			grid-template-columns: minmax(0, 1fr) auto;
			border-radius: 1.1rem;
		}
		.wish-category-field {
			grid-column: 1 / -1;
		}
		.wish-category-field select {
			width: 100%;
		}
		.wish-submit {
			min-width: 7.3rem;
		}
		.wish-privacy {
			line-height: 1.6;
		}
		.wish-filter {
			justify-content: flex-start;
			flex-wrap: nowrap;
			overflow-x: auto;
			padding-bottom: 0.4rem;
			scrollbar-width: none;
		}
		.wish-filter::-webkit-scrollbar {
			display: none;
		}
		.wish-water {
			width: 100%;
			min-height: 34rem;
			border-radius: 1.6rem;
		}
		.wish-float-grid {
			grid-template-columns: 1fr;
			gap: 0.75rem;
			padding: 1rem;
		}
		.wish-card {
			width: min(88%, 23rem);
			min-height: 4.6rem;
		}
		.wish-position-0,
		.wish-position-2,
		.wish-position-4,
		.wish-position-6 {
			justify-self: start;
			margin-top: 0;
		}
		.wish-position-1,
		.wish-position-3,
		.wish-position-5,
		.wish-position-7 {
			justify-self: end;
			margin-top: 0;
		}
		.wish-dialog-actions {
			align-items: stretch;
			flex-direction: column;
		}
		.wish-report-toggle {
			order: 2;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.wish-card-glyph,
		.wish-card.is-new {
			animation: none;
			transition: none;
		}
		.wish-dialog::backdrop {
			backdrop-filter: none;
		}
	}
</style>
