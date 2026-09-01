<script lang="ts">
	import { base } from '$app/paths';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import {
		createWish,
		listWishes,
		toggleWishSupport,
		wishCategories,
		type Wish,
		type WishCategory
	} from '$lib/wishes';

	const previewWishes: Wish[] = [
		{
			id: 'preview-gym',
			title: '想知道健身房現在有多少人',
			detail: '出發前就能判斷要不要換個時段。',
			category: 'life',
			supportCount: 42,
			supportedByMe: false,
			createdAt: '2026-08-29T10:00:00Z'
		},
		{
			id: 'preview-bus',
			title: '希望校車能顯示即時擁擠度',
			detail: '',
			category: 'transport',
			supportCount: 31,
			supportedByMe: false,
			createdAt: '2026-08-28T08:30:00Z'
		},
		{
			id: 'preview-outlets',
			title: '想找有插座的自習空間',
			detail: '希望地圖上也能標示開放時間。',
			category: 'learning',
			supportCount: 18,
			supportedByMe: false,
			createdAt: '2026-08-27T15:20:00Z'
		},
		{
			id: 'preview-lost',
			title: '希望失物招領資訊可以整合',
			detail: '',
			category: 'life',
			supportCount: 55,
			supportedByMe: true,
			createdAt: '2026-08-24T03:40:00Z'
		},
		{
			id: 'preview-food',
			title: '想知道餐廳今天有沒有營業',
			detail: '',
			category: 'life',
			supportCount: 7,
			supportedByMe: false,
			createdAt: '2026-08-30T00:40:00Z'
		}
	];

	let wishes = $state<Wish[]>([]);
	let activeCategory = $state<WishCategory | 'all'>('all');
	let title = $state('');
	let detail = $state('');
	let category = $state<WishCategory>('life');
	let loading = $state(true);
	let submitting = $state(false);
	let error = $state('');
	let notice = $state('');
	let supportingId = $state('');
	let justCreatedId = $state('');
	let previewMode = $state(false);
	let now = $state(Date.now());

	const showFilters = $derived(wishes.length > 20);
	const visibleWishes = $derived(
		!showFilters || activeCategory === 'all'
			? wishes
			: wishes.filter((wish) => wish.category === activeCategory)
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
	const supportCountLabel = (count: number) =>
		count === 1 ? m.wish_support_one() : m.wish_support_count({ count });
	const relativeTime = (createdAt: string) => {
		const timestamp = Date.parse(createdAt);
		if (!Number.isFinite(timestamp)) return m.wish_time_just_now();
		const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
		if (seconds < 60) return m.wish_time_just_now();
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60)
			return minutes === 1 ? m.wish_time_minute() : m.wish_time_minutes({ count: minutes });
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return hours === 1 ? m.wish_time_hour() : m.wish_time_hours({ count: hours });
		const days = Math.floor(hours / 24);
		if (days < 7) return days === 1 ? m.wish_time_day() : m.wish_time_days({ count: days });
		const weeks = Math.floor(days / 7);
		return weeks === 1 ? m.wish_time_week() : m.wish_time_weeks({ count: weeks });
	};

	onMount(() => {
		const controller = new AbortController();
		const clock = setInterval(() => (now = Date.now()), 60_000);
		let liveUpdates: EventSource | undefined;
		let fallbackRefresh: ReturnType<typeof setInterval> | undefined;
		let refreshing = false;
		const cleanup = () => {
			controller.abort();
			clearInterval(clock);
			liveUpdates?.close();
			if (fallbackRefresh) clearInterval(fallbackRefresh);
		};
		previewMode = dev && new URL(window.location.href).searchParams.get('wish-preview') === '1';
		if (previewMode) {
			wishes = previewWishes;
			loading = false;
			return cleanup;
		}
		const refresh = async (showError: boolean) => {
			if (refreshing) return;
			refreshing = true;
			try {
				wishes = await listWishes(controller.signal);
			} catch {
				if (showError && !controller.signal.aborted) error = m.wish_error_load();
			} finally {
				refreshing = false;
				if (showError) loading = false;
			}
		};
		void refresh(true);
		liveUpdates = new EventSource('/api/wishes/events');
		liveUpdates.addEventListener('wishes', () => void refresh(false));
		// A quiet fallback covers proxies or temporary networks that cannot keep SSE open.
		fallbackRefresh = setInterval(() => void refresh(false), 10_000);
		return cleanup;
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
				wishes = [result.wish, ...wishes.filter((wish) => wish.id !== result.wish.id)];
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

	async function toggleSupport(wish: Wish) {
		if (supportingId) return;
		error = '';
		supportingId = wish.id;
		try {
			const result = previewMode
				? {
						supported: !wish.supportedByMe,
						supportCount: wish.supportCount + (wish.supportedByMe ? -1 : 1)
					}
				: await toggleWishSupport(wish.id);
			const updated = {
				...wish,
				supportedByMe: result.supported,
				supportCount: result.supportCount
			};
			wishes = wishes.map((wish) => (wish.id === updated.id ? updated : wish));
		} catch (caught) {
			error = caught instanceof Error ? caught.message : m.wish_error_support();
		} finally {
			supportingId = '';
		}
	}
</script>

<section
	class="wish-pool"
	aria-label={m.footer_wishlist()}
	style="--composer-frame: url('{base}/wishpool/composer-frame.svg'); --card-frame: url('{base}/wishpool/card-frame.svg'); --support-default: url('{base}/wishpool/support-default.svg'); --support-active: url('{base}/wishpool/support-active.svg'); --submit-default: url('{base}/wishpool/submit-default.svg'); --submit-hover: url('{base}/wishpool/submit-hover.svg');"
>
	<form class="wish-composer" onsubmit={submitWish} aria-describedby="wish-privacy-note">
		<div class="wish-composer-row">
			<label class="wish-title-field">
				<span class="wish-field-label">{m.wish_input_label()}</span>
				<input
					bind:value={title}
					maxlength="120"
					placeholder={m.wish_input_placeholder()}
					autocomplete="off"
					disabled={submitting}
				/>
			</label>
			<label class="wish-category-field">
				<span class="wish-field-label">{m.wish_category_label()}</span>
				<span class="wish-select-control">
					<select bind:value={category} disabled={submitting}>
						{#each wishCategories as option (option)}
							<option value={option}>{categoryLabel(option)}</option>
						{/each}
					</select>
					<svg aria-hidden="true" viewBox="0 0 16 16">
						<path d="m4 6 4 4 4-4" />
					</svg>
				</span>
			</label>
			<button
				class="landing-button landing-button-primary wish-submit"
				type="submit"
				disabled={submitting}
			>
				{submitting ? m.wish_submitting() : m.wish_submit()}
			</button>
		</div>
		<details class="wish-detail-field">
			<summary>{m.wish_detail_toggle()}</summary>
			<label>
				<textarea
					bind:value={detail}
					aria-label={m.wish_detail_label()}
					maxlength="500"
					rows="3"
					placeholder={m.wish_detail_placeholder()}
					disabled={submitting}
				></textarea>
			</label>
		</details>
		<p id="wish-privacy-note" class="wish-privacy">
			<strong>{m.wish_privacy_title()}</strong> · {m.wish_privacy_body()}
		</p>
		<div class="wish-feedback" aria-live="polite">
			{#if error}<p class="wish-error">{error}</p>{/if}
			{#if notice}<p class="wish-notice">{notice}</p>{/if}
		</div>
	</form>

	<section class="wish-board" aria-labelledby="wish-board-title">
		<header class="wish-board-head">
			<img src="{base}/wishpool/megaphone.svg" alt="" />
			<h2 id="wish-board-title">{m.wish_board_title()}</h2>
		</header>

		{#if showFilters}
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
		{/if}

		{#if loading}
			<p class="wish-state" role="status">{m.wish_loading()}</p>
		{:else if visibleWishes.length === 0}
			<div class="wish-state">
				<strong>{m.wish_empty_title()}</strong>
				<span>{m.wish_empty_body()}</span>
			</div>
		{:else}
			<div class="wish-list">
				{#each visibleWishes as wish (wish.id)}
					<article class="wish-card" class:is-new={justCreatedId === wish.id}>
						<span class="wish-card-meta">
							<span class="wish-card-category" data-category={wish.category}
								>{categoryLabel(wish.category)}</span
							>
							<time class="wish-card-time" datetime={wish.createdAt}
								>{relativeTime(wish.createdAt)}</time
							>
						</span>
						<strong class="wish-card-title">{wish.title}</strong>
						<div class="wish-card-actions">
							<button
								type="button"
								class="wish-support"
								class:supported={wish.supportedByMe}
								aria-pressed={wish.supportedByMe}
								aria-label={`${m.wish_support()}：${wish.title}，${wish.supportCount}`}
								disabled={supportingId === wish.id}
								onclick={() => toggleSupport(wish)}
							>
								{wish.supportedByMe ? '✓ ' : ''}+1
							</button>
							<span class="wish-support-count">{supportCountLabel(wish.supportCount)}</span>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	</section>
</section>

<style>
	.wish-pool {
		display: grid;
		gap: 0;
	}

	/* Composer — explicit fields make the primary action legible at a glance. */
	.wish-composer {
		width: 100%;
		border: 1px solid var(--line);
		border-radius: 1rem;
		padding: 0.85rem;
		background: var(--surface);
		box-shadow: var(--shadow-soft);
	}
	.wish-composer-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto auto;
		gap: 0.65rem;
		align-items: end;
	}
	.wish-title-field,
	.wish-category-field {
		display: grid;
		gap: 0.4rem;
		min-width: 0;
	}
	.wish-field-label {
		padding-inline: 0.15rem;
		color: var(--ink-soft);
		font-size: 0.72rem;
		font-weight: 650;
		letter-spacing: 0.02em;
	}
	.wish-title-field input,
	.wish-detail-field textarea {
		width: 100%;
		outline: 0;
		color: inherit;
		font: inherit;
	}
	.wish-title-field input {
		min-height: 3.15rem;
		border: 1px solid var(--line-strong);
		border-radius: 0.7rem;
		padding: 0.65rem 0.9rem;
		background: var(--surface-2);
		font-size: 0.95rem;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease,
			background-color 0.15s ease;
	}
	.wish-title-field input:hover {
		border-color: color-mix(in srgb, var(--brand) 55%, var(--line-strong));
	}
	.wish-title-field input:focus-visible {
		border-color: var(--brand);
		background: var(--surface);
		box-shadow: 0 0 0 3px var(--brand-soft);
	}
	.wish-title-field input::placeholder,
	.wish-detail-field textarea::placeholder {
		color: var(--muted);
	}
	.wish-select-control {
		position: relative;
		display: block;
	}
	.wish-category-field select {
		width: 100%;
		min-width: 8.25rem;
		min-height: 3.15rem;
		appearance: none;
		border: 1px solid var(--line-strong);
		border-radius: 0.7rem;
		padding: 0 3rem 0 0.9rem;
		background: var(--surface-2);
		color: inherit;
		font: 500 0.85rem var(--font-sans);
		cursor: pointer;
	}
	.wish-category-field select:focus-visible {
		border-color: var(--brand);
		outline: 0;
		box-shadow: 0 0 0 3px var(--brand-soft);
	}
	.wish-select-control svg {
		position: absolute;
		top: 50%;
		right: 1.05rem;
		width: 0.9rem;
		height: 0.9rem;
		transform: translateY(-50%);
		fill: none;
		stroke: var(--ink-soft);
		stroke-width: 1.75;
		stroke-linecap: round;
		stroke-linejoin: round;
		pointer-events: none;
	}
	.wish-submit {
		border: 1px solid var(--brand);
		cursor: pointer;
		padding-block: 0;
		min-height: 3.15rem;
		font-size: 0.9rem;
	}
	.wish-submit:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	.wish-detail-field {
		padding: 0.55rem 0.15rem 0.05rem;
	}
	.wish-detail-field summary {
		width: fit-content;
		color: var(--ink-soft);
		font-size: 0.78rem;
		cursor: pointer;
	}
	.wish-detail-field label {
		display: grid;
		gap: 0.4rem;
		margin-top: 0.65rem;
	}
	.wish-detail-field textarea {
		min-height: 7rem;
		border: 1px solid var(--line-strong);
		border-radius: 0.7rem;
		padding: 0.75rem 0.9rem;
		background: var(--surface-2);
		resize: vertical;
		font-size: 0.9rem;
		line-height: 1.6;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease,
			background-color 0.15s ease;
	}
	.wish-detail-field textarea:hover {
		border-color: color-mix(in srgb, var(--brand) 55%, var(--line-strong));
	}
	.wish-detail-field textarea:focus-visible {
		border-color: var(--brand);
		background: var(--surface);
		box-shadow: 0 0 0 3px var(--brand-soft);
	}

	.wish-privacy {
		margin: 0.7rem 0 0;
		padding-inline: 0.25rem;
		color: var(--muted);
		font-size: 0.75rem;
		line-height: 1.6;
	}
	.wish-privacy strong {
		color: var(--ink-soft);
		font-weight: 600;
	}

	.wish-feedback {
		min-height: 1.9rem;
		font-size: 0.82rem;
	}
	.wish-feedback p {
		margin: 0.55rem 0 0;
		padding-inline: 0.25rem;
	}
	.wish-error {
		color: #c2372b;
	}
	.wish-notice {
		color: #12855b;
	}
	:global([data-theme='dark']) .wish-error {
		color: #ff8f87;
	}
	:global([data-theme='dark']) .wish-notice {
		color: #71d5aa;
	}

	/* Category filter — quiet pills; the active one is simply solid ink. */
	.wish-filter {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 1.4rem 0 1.1rem;
		padding-top: 1.4rem;
		border-top: 1px solid var(--line);
	}
	.wish-filter button {
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 0.45rem 0.95rem;
		background: var(--surface);
		color: var(--ink-soft);
		font: 500 0.82rem var(--font-sans);
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease;
	}
	.wish-filter button:hover {
		border-color: var(--line-strong);
		color: var(--ink);
	}
	.wish-filter button.active {
		border-color: var(--ink);
		background: var(--ink);
		color: var(--surface);
	}

	/* Wish list — a plain, even grid. */
	.wish-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
		gap: 0.8rem;
		margin-top: 1.1rem;
	}
	.wish-filter + .wish-list {
		margin-top: 0;
	}
	.wish-card {
		display: grid;
		gap: 0.55rem;
		align-content: start;
		border: 1px solid var(--line);
		border-radius: 0.9rem;
		padding: 1rem;
		background: var(--surface);
		color: inherit;
		text-align: left;
	}
	.wish-card.is-new {
		animation: wish-in 0.45s var(--ease-out);
	}
	.wish-card-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.wish-card-category {
		color: var(--muted);
		font-size: 0.72rem;
	}
	.wish-card-time {
		color: var(--muted);
		font-size: 0.7rem;
		white-space: nowrap;
	}
	.wish-card-title {
		display: -webkit-box;
		overflow: hidden;
		font-size: 0.95rem;
		font-weight: 600;
		line-height: 1.45;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.wish-card-actions {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		margin-top: 0.2rem;
	}
	.wish-support {
		font: 600 0.78rem var(--font-sans);
		cursor: pointer;
	}
	.wish-support {
		min-width: 4.25rem;
		border: 1px solid var(--brand);
		border-radius: 999px;
		padding: 0.45rem 0.8rem;
		background: transparent;
		color: var(--brand-ink);
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			transform 0.15s ease;
	}
	.wish-support:hover:not(:disabled) {
		background: var(--brand-soft);
	}
	.wish-support:active:not(:disabled) {
		transform: scale(0.97);
	}
	.wish-support.supported {
		background: var(--brand);
		color: #fff;
	}
	.wish-support:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	.wish-support-count {
		color: var(--muted);
		font-size: 0.74rem;
	}
	.wish-state {
		display: grid;
		gap: 0.35rem;
		place-items: center;
		margin: 0;
		border: 1px dashed var(--line-strong);
		border-radius: 0.9rem;
		padding: 3rem 1.5rem;
		color: var(--ink-soft);
		text-align: center;
		font-size: 0.9rem;
	}
	.wish-state strong {
		color: var(--ink);
	}

	@keyframes wish-in {
		from {
			opacity: 0;
			transform: translateY(-0.4rem);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	@media (max-width: 620px) {
		.wish-composer-row {
			grid-template-columns: minmax(0, 1fr) auto;
		}
		.wish-title-field {
			grid-column: 1 / -1;
		}
		.wish-category-field select {
			min-width: 0;
		}
		.wish-list {
			grid-template-columns: 1fr;
		}
	}

	/* Designer handoff, September 2026. The supplied SVGs provide the irregular blue outlines;
	   live HTML remains on top so the form, filters and voting controls stay accessible. */
	.wish-pool {
		gap: clamp(2.25rem, 5vw, 4rem);
		color: #111c36;
	}
	.wish-composer {
		position: relative;
		isolation: isolate;
		min-height: 13.5rem;
		border: 0;
		border-radius: 0;
		padding: clamp(2.15rem, 4vw, 3rem) clamp(2rem, 4.5vw, 3.75rem) 1.6rem;
		background: var(--composer-frame) center / 100% 100% no-repeat;
		box-shadow: none;
		color: #111c36;
	}
	.wish-composer-row {
		grid-template-columns: minmax(0, 1fr) minmax(8.5rem, 0.19fr) 11rem;
		gap: clamp(0.75rem, 2vw, 1.35rem);
		align-items: end;
	}
	.wish-field-label {
		padding-inline: 0;
		color: #111c36;
		font-size: 0.82rem;
		font-weight: 700;
	}
	.wish-title-field input,
	.wish-category-field select,
	.wish-detail-field textarea {
		border: 1.5px solid #536489;
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.74);
		color: #182744;
		box-shadow: none;
	}
	.wish-title-field input,
	.wish-category-field select {
		min-height: 3.25rem;
	}
	.wish-title-field input {
		font-size: 1rem;
	}
	.wish-category-field select {
		min-width: 0;
		font-size: 0.92rem;
		font-weight: 650;
	}
	.wish-title-field input:focus-visible,
	.wish-category-field select:focus-visible,
	.wish-detail-field textarea:focus-visible {
		border-color: #123cff;
		background: #fff;
		box-shadow: 0 0 0 3px rgba(36, 98, 255, 0.16);
	}
	.wish-detail-field {
		padding: 0.5rem 0 0;
	}
	.wish-detail-field summary {
		color: #536489;
		font-size: 0.8rem;
		font-weight: 600;
	}
	.wish-detail-field textarea {
		min-height: 5.5rem;
		background: #fff;
	}
	.wish-privacy {
		margin-top: 0.65rem;
		padding-inline: 0;
		color: #536489;
		font-size: 0.78rem;
	}
	.wish-privacy strong {
		color: #354665;
	}
	.wish-feedback {
		min-height: 0;
		font-size: 0.8rem;
	}
	.wish-feedback p {
		margin-top: 0.4rem;
		padding-inline: 0;
	}
	.wish-submit {
		align-self: end;
		width: 11rem;
		min-height: 0;
		aspect-ratio: 375 / 145;
		border: 0;
		border-radius: 0;
		padding: 0;
		background: var(--submit-default) center / contain no-repeat;
		box-shadow: none;
		color: transparent;
		font-size: 1rem;
		transition: transform 0.18s ease;
	}
	.wish-submit:hover:not(:disabled) {
		background: var(--submit-hover) center / contain no-repeat;
		transform: translateY(-2px);
	}
	:global(html[lang='en']) .wish-submit {
		width: 10.5rem;
		min-height: 3.5rem;
		aspect-ratio: auto;
		border: 2px solid #102253;
		border-radius: 999px;
		background: #3136ff;
		color: #fff;
		box-shadow:
			0 0 0 3px #fff,
			0 0 0 5px #2462ff;
	}
	:global(html[lang='en']) .wish-submit:hover:not(:disabled) {
		background: #c8c9ff;
		color: #102253;
	}
	.wish-board {
		display: grid;
		gap: 1.2rem;
	}
	.wish-board-head {
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}
	.wish-board-head img {
		width: clamp(2.9rem, 5vw, 4.5rem);
		height: auto;
		transform: rotate(-7deg);
	}
	.wish-board-head h2 {
		margin: 0;
		font-size: clamp(1.5rem, 3vw, 2.15rem);
		font-weight: 700;
		letter-spacing: -0.025em;
	}
	.wish-filter {
		margin: 0;
		padding: 0;
		border: 0;
	}
	.wish-filter button {
		border: 1.5px solid #2462ff;
		background: #fff;
		color: #123cff;
		font-weight: 650;
	}
	.wish-filter button.active {
		border-color: #123cff;
		background: #3136ff;
		color: #fff;
	}
	.wish-list {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: clamp(0.85rem, 2vw, 1.3rem);
		margin-top: 0;
	}
	.wish-card {
		position: relative;
		isolation: isolate;
		min-height: 11.5rem;
		gap: 0.7rem;
		border: 0;
		border-radius: 0;
		padding: 1.35rem 1.55rem 1.25rem;
		background: var(--card-frame) center / 100% 100% no-repeat;
		color: #111c36;
	}
	.wish-card::before {
		content: '';
		position: absolute;
		z-index: 2;
		top: 0.35rem;
		right: 1.15rem;
		width: 2rem;
		height: 0.7rem;
		background: rgba(196, 203, 255, 0.68);
		border: 1px solid rgba(36, 98, 255, 0.28);
		transform: rotate(35deg);
		pointer-events: none;
	}
	.wish-card-meta,
	.wish-card-title,
	.wish-card-actions {
		position: relative;
		z-index: 3;
	}
	.wish-card-category {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		min-height: 2rem;
		border: 1.5px solid #2462ff;
		border-radius: 0.7rem;
		padding: 0.25rem 0.7rem;
		background: #fff;
		color: #123cff;
		font-size: 0.8rem;
		font-weight: 700;
	}
	.wish-card-category::before {
		font-size: 1rem;
		line-height: 1;
	}
	.wish-card-category[data-category='life']::before {
		content: '♡';
	}
	.wish-card-category[data-category='transport']::before {
		content: '▣';
	}
	.wish-card-category[data-category='learning']::before {
		content: '▤';
	}
	.wish-card-category[data-category='space']::before {
		content: '⌂';
	}
	.wish-card-category[data-category='other']::before {
		content: '✦';
	}
	.wish-card-time {
		color: #536489;
		font-size: 0.78rem;
	}
	.wish-card-title {
		font-size: clamp(1rem, 1.6vw, 1.15rem);
		font-weight: 650;
		line-height: 1.45;
	}
	.wish-card-actions {
		gap: 0.65rem;
		margin-top: auto;
	}
	.wish-support {
		width: 4.8rem;
		min-width: 0;
		aspect-ratio: 95 / 47;
		border: 0;
		border-radius: 0;
		padding: 0;
		background: var(--support-default) center / 100% 100% no-repeat;
		color: transparent;
	}
	.wish-support:hover:not(:disabled) {
		background: var(--support-active) center / 100% 100% no-repeat;
	}
	.wish-support.supported {
		background: var(--support-active) center / 100% 100% no-repeat;
		color: transparent;
	}
	.wish-support-count {
		color: #536489;
		font-size: 0.8rem;
	}
	.wish-state {
		border: 1.5px dashed #2462ff;
		background: rgba(255, 255, 255, 0.78);
		color: #536489;
	}

	:global(:root[data-theme='dark']) .wish-pool {
		color: #eef4ff;
	}
	:global(:root[data-theme='dark']) .wish-board-head h2 {
		color: #eef4ff;
	}

	@media (max-width: 900px) {
		.wish-composer {
			/* The supplied composer art is intentionally very wide. At stacked breakpoints a
			   responsive double outline keeps the same visual language without distorting it. */
			border: 2px solid #33f;
			border-radius: 1.75rem;
			background: #fff;
			box-shadow:
				0 0 0 4px #fff,
				0 0 0 5px #33f;
		}
		.wish-composer-row {
			grid-template-columns: minmax(0, 1fr) minmax(8rem, 0.32fr);
		}
		.wish-submit {
			grid-column: 1 / -1;
			justify-self: center;
		}
		.wish-list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 620px) {
		.wish-pool {
			gap: 2.25rem;
		}
		.wish-composer {
			min-height: 22rem;
			padding: 2rem 1.45rem 1.4rem;
		}
		.wish-composer-row {
			grid-template-columns: minmax(0, 1fr) auto;
			gap: 0.75rem;
		}
		.wish-title-field {
			grid-column: 1 / -1;
		}
		.wish-category-field select {
			min-width: 8.5rem;
		}
		.wish-submit,
		:global(html[lang='en']) .wish-submit {
			grid-column: auto;
			width: 8.5rem;
		}
		.wish-privacy {
			font-size: 0.72rem;
			line-height: 1.45;
		}
		.wish-board-head {
			gap: 0.35rem;
		}
		.wish-list {
			grid-template-columns: 1fr;
		}
		.wish-card {
			min-height: 10.75rem;
			padding-inline: 1.4rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wish-card,
		.wish-card.is-new,
		.wish-filter button {
			animation: none;
			transition: none;
		}
	}
</style>
