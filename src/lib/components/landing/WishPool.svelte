<script lang="ts">
	import { base } from '$app/paths';
	import { dev } from '$app/environment';
	import { onMount } from 'svelte';
	import { m } from '$lib/paraglide/messages';
	import { localeState } from '$lib/i18n.svelte';
	import { formatDateTime } from '$lib/typography';
	import {
		createWish,
		listWishes,
		toggleWishSupport,
		wishCategories,
		wishStatuses,
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
			status: 'open',
			reply: '我們正在和體育室討論人流資料的串接方式，有進度會第一時間更新！',
			repliedAt: '2026-08-30T02:00:00Z',
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
	const previewFulfilledWishes: Wish[] = [
		{
			id: 'preview-bus-live',
			title: '希望校車可以看到即時位置',
			detail: '',
			category: 'transport',
			status: 'fulfilled',
			reply:
				'校車即時位置已經在 NYCU LIFE App 上線！打開「交通」分頁就能看到每一班車目前的位置與預估到站時間。',
			repliedAt: '2026-10-02T04:00:00Z',
			fulfilledAt: '2026-10-01T08:00:00Z',
			supportCount: 128,
			supportedByMe: true,
			createdAt: '2026-08-12T10:00:00Z'
		},
		{
			id: 'preview-menu',
			title: '想在一個地方看到各餐廳的營業時間',
			detail: '',
			category: 'life',
			status: 'fulfilled',
			reply: '餐廳資訊頁已整合二餐、女二餐與小木屋的營業時間，假日與連假也會同步更新。',
			repliedAt: '2026-09-20T06:30:00Z',
			fulfilledAt: '2026-09-18T09:00:00Z',
			supportCount: 64,
			supportedByMe: false,
			createdAt: '2026-08-05T03:20:00Z'
		},
		{
			id: 'preview-calendar',
			title: '希望可以把課表匯出到手機行事曆',
			detail: '',
			category: 'learning',
			status: 'fulfilled',
			reply: '',
			repliedAt: null,
			fulfilledAt: '2026-09-02T12:00:00Z',
			supportCount: 37,
			supportedByMe: false,
			createdAt: '2026-07-28T03:20:00Z'
		}
	];

	let lists = $state<Record<WishStatus, Wish[]>>({ open: [], fulfilled: [] });
	let loaded = $state<Record<WishStatus, boolean>>({ open: false, fulfilled: false });
	let failed = $state<Record<WishStatus, boolean>>({ open: false, fulfilled: false });
	let activeTab = $state<WishStatus>('open');
	let activeCategory = $state<WishCategory | 'all'>('all');
	let title = $state('');
	let detail = $state('');
	let category = $state<WishCategory>('life');
	let submitting = $state(false);
	let error = $state('');
	let notice = $state('');
	let supportingId = $state('');
	let justCreatedId = $state('');
	let previewMode = $state(false);
	let now = $state(Date.now());
	let requestFetch: ((status: WishStatus, showError: boolean) => Promise<void>) | undefined;

	const wishes = $derived(lists[activeTab]);
	const loading = $derived(!loaded[activeTab] && !failed[activeTab]);
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
	const formatDate = (value: string | null | undefined) => {
		const date = new Date(value ?? '');
		if (Number.isNaN(date.getTime())) return '';
		return formatDateTime(date, localeState.current, {
			dateStyle: 'medium'
		});
	};
	const tabLabel = (status: WishStatus) =>
		status === 'open' ? m.wish_tab_open() : m.wish_tab_fulfilled();
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
		const refreshing: Record<WishStatus, boolean> = { open: false, fulfilled: false };
		const cleanup = () => {
			controller.abort();
			clearInterval(clock);
			liveUpdates?.close();
			if (fallbackRefresh) clearInterval(fallbackRefresh);
		};
		previewMode = dev && new URL(window.location.href).searchParams.get('wish-preview') === '1';
		if (previewMode) {
			lists = { open: previewWishes, fulfilled: previewFulfilledWishes };
			loaded = { open: true, fulfilled: true };
			return cleanup;
		}
		const fetchList = async (status: WishStatus, showError: boolean) => {
			if (refreshing[status]) return;
			refreshing[status] = true;
			try {
				lists[status] = await listWishes(status, controller.signal);
				loaded[status] = true;
				failed[status] = false;
			} catch {
				// The board shows the failure (with a retry); the form keeps its own errors.
				if (showError && !controller.signal.aborted) failed[status] = true;
			} finally {
				refreshing[status] = false;
			}
		};
		requestFetch = fetchList;
		// The fulfilled list is fetched lazily on first view and kept fresh afterwards.
		const refresh = () => {
			for (const status of wishStatuses) {
				if (status === 'open' || loaded[status]) void fetchList(status, false);
			}
		};
		void fetchList('open', true);
		liveUpdates = new EventSource('/api/wishes/events');
		liveUpdates.addEventListener('wishes', refresh);
		// A quiet fallback covers proxies or temporary networks that cannot keep SSE open.
		fallbackRefresh = setInterval(refresh, 10_000);
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
				lists.open = [result.wish, ...lists.open.filter((wish) => wish.id !== result.wish.id)];
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
			for (const status of wishStatuses) {
				lists[status] = lists[status].map((wish) => (wish.id === updated.id ? updated : wish));
			}
		} catch (caught) {
			error = caught instanceof Error ? caught.message : m.wish_error_support();
		} finally {
			supportingId = '';
		}
	}

	function retryLoad() {
		failed[activeTab] = false;
		void requestFetch?.(activeTab, true);
	}

	function selectTab(status: WishStatus) {
		if (status === activeTab) return;
		activeTab = status;
		activeCategory = 'all';
		if (!loaded[status]) {
			failed[status] = false;
			void requestFetch?.(status, true);
		}
	}

	function onTabKeydown(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		const index = wishStatuses.indexOf(activeTab);
		const step = event.key === 'ArrowRight' ? 1 : -1;
		const next = wishStatuses[(index + step + wishStatuses.length) % wishStatuses.length];
		selectTab(next);
		document.getElementById(`wish-tab-${next}`)?.focus();
	}
</script>

<section class="wish-pool" aria-label={m.footer_wishlist()}>
	<form class="wish-composer" onsubmit={submitWish} aria-describedby="wish-privacy-note">
		<img class="wish-composer-frame" src="{base}/wishpool/composer-frame.svg" alt="" />
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
				<span class="wish-submit-art" aria-hidden="true">
					<img class="wish-submit-default" src="{base}/wishpool/submit-default.svg" alt="" />
					<img class="wish-submit-hover" src="{base}/wishpool/submit-hover.svg" alt="" />
				</span>
				<span class="wish-submit-label">{submitting ? m.wish_submitting() : m.wish_submit()}</span>
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
			<strong>{m.wish_privacy_title()}</strong>{localeState.current === 'zh-tw'
				? '：'
				: ': '}{m.wish_privacy_body()}
		</p>
		<div class="wish-feedback" aria-live="polite">
			{#if error}<p class="wish-error">{error}</p>{/if}
			{#if notice}<p class="wish-notice">{notice}</p>{/if}
		</div>
	</form>

	<section class="wish-board" aria-labelledby="wish-board-title">
		<header class="wish-board-head">
			<img src="{base}/wishpool/megaphone.svg" alt="" />
			<h2 id="wish-board-title">
				{activeTab === 'fulfilled' ? m.wish_fulfilled_board_title() : m.wish_board_title()}
			</h2>
			<div class="wish-tabs" role="tablist" aria-label={m.wish_tabs_label()}>
				{#each wishStatuses as status (status)}
					<button
						type="button"
						role="tab"
						id="wish-tab-{status}"
						aria-selected={activeTab === status}
						aria-controls="wish-panel"
						tabindex={activeTab === status ? 0 : -1}
						class:active={activeTab === status}
						onclick={() => selectTab(status)}
						onkeydown={onTabKeydown}
					>
						{#if status === 'fulfilled'}<span class="wish-tab-mark" aria-hidden="true">✓</span>{/if}
						{tabLabel(status)}
					</button>
				{/each}
			</div>
		</header>

		<div
			id="wish-panel"
			class="wish-panel"
			role="tabpanel"
			aria-labelledby="wish-tab-{activeTab}"
			tabindex="-1"
		>
			{#if activeTab === 'fulfilled'}
				<p class="wish-board-lede">{m.wish_fulfilled_lede()}</p>
			{/if}

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
				<div class="wish-list wish-skeletons" role="status" aria-busy="true">
					<span class="sr-only">{m.wish_loading()}</span>
					{#each [0, 1, 2] as index (index)}
						<div class="wish-card wish-skeleton" aria-hidden="true">
							<span class="wish-skeleton-bar is-chip"></span>
							<span class="wish-skeleton-bar is-title"></span>
							<span class="wish-skeleton-bar is-title-short"></span>
							<span class="wish-skeleton-bar is-action"></span>
						</div>
					{/each}
				</div>
			{:else if failed[activeTab]}
				<div class="wish-state is-error" role="alert">
					<strong>{m.wish_error_load_title()}</strong>
					<span
						>{activeTab === 'fulfilled'
							? m.wish_error_load_fulfilled()
							: m.wish_error_load_body()}</span
					>
					<button type="button" class="wish-retry" onclick={retryLoad}>{m.wish_retry()}</button>
				</div>
			{:else if visibleWishes.length === 0}
				<div class="wish-state">
					{#if activeTab === 'fulfilled'}
						<strong>{m.wish_fulfilled_empty_title()}</strong>
						<span>{m.wish_fulfilled_empty_body()}</span>
					{:else}
						<strong>{m.wish_empty_title()}</strong>
						<span>{m.wish_empty_body()}</span>
					{/if}
				</div>
			{:else}
				<div class="wish-list">
					{#each visibleWishes as wish (wish.id)}
						{@const fulfilled = wish.status === 'fulfilled'}
						<article
							class="wish-card"
							class:is-new={justCreatedId === wish.id}
							class:is-fulfilled={fulfilled}
						>
							<span class="wish-card-meta">
								<span class="wish-card-category" data-category={wish.category}
									>{categoryLabel(wish.category)}</span
								>
								{#if fulfilled}
									<span class="wish-card-badge">
										<span aria-hidden="true">✓</span>
										{m.wish_fulfilled_badge()}
									</span>
								{:else}
									<time class="wish-card-time" datetime={wish.createdAt}
										>{relativeTime(wish.createdAt)}</time
									>
								{/if}
							</span>
							<strong class="wish-card-title">{wish.title}</strong>
							{#if wish.detail}
								<details class="wish-card-detail">
									<summary>
										<span class="wish-card-detail-show">{m.wish_card_detail_show()}</span>
										<span class="wish-card-detail-hide">{m.wish_card_detail_hide()}</span>
									</summary>
									<p>{wish.detail}</p>
								</details>
							{/if}
							{#if wish.reply}
								<div class="wish-reply">
									<span class="wish-reply-label">
										<span class="wish-reply-mark" aria-hidden="true">N</span>
										{m.wish_reply_label()}
									</span>
									<p>{wish.reply}</p>
								</div>
							{/if}
							<div class="wish-card-actions">
								{#if fulfilled}
									<span class="wish-support-count">{supportCountLabel(wish.supportCount)}</span>
									{#if formatDate(wish.fulfilledAt)}
										<time class="wish-card-fulfilled-on" datetime={wish.fulfilledAt}
											>{m.wish_fulfilled_on({ date: formatDate(wish.fulfilledAt) })}</time
										>
									{/if}
								{:else}
									<button
										type="button"
										class="wish-support"
										class:supported={wish.supportedByMe}
										aria-pressed={wish.supportedByMe}
										aria-label={`${m.wish_support()}：${wish.title}，${wish.supportCount}`}
										disabled={supportingId === wish.id}
										onclick={() => toggleSupport(wish)}
									>
										<span class="wish-support-art" aria-hidden="true">
											<img
												class="wish-support-default"
												src="{base}/wishpool/support-default.svg"
												alt=""
											/>
											<img
												class="wish-support-active"
												src="{base}/wishpool/support-active.svg"
												alt=""
											/>
										</span>
										<span class="wish-support-label">{wish.supportedByMe ? '✓ ' : ''}+1</span>
									</button>
									<span class="wish-support-count">{supportCountLabel(wish.supportCount)}</span>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{/if}
		</div>
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
	.wish-state.is-error strong {
		color: #c2412d;
	}
	.wish-retry {
		margin-top: 0.75rem;
		min-height: 2.75rem;
		padding: 0 1.25rem;
		border: 1.5px solid var(--brand);
		border-radius: 999px;
		background: var(--surface);
		color: var(--brand);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}
	.wish-retry:hover {
		background: var(--brand-soft);
	}
	.wish-retry:focus-visible {
		outline: 3px solid var(--brand);
		outline-offset: 3px;
	}
	/* Loading: card-shaped placeholders hold the board's layout until wishes arrive. */
	.wish-skeleton {
		display: grid;
		align-content: start;
		gap: 0.75rem;
		min-height: 9.5rem;
	}
	.wish-skeleton-bar {
		display: block;
		height: 0.85rem;
		border-radius: 999px;
		background: linear-gradient(
				90deg,
				var(--surface-3) 0%,
				var(--surface-2) 50%,
				var(--surface-3) 100%
			)
			0 0 / 200% 100%;
		animation: wish-shimmer 1.4s ease-in-out infinite;
	}
	.wish-skeleton-bar.is-chip {
		width: 3.5rem;
		height: 1.6rem;
	}
	.wish-skeleton-bar.is-title {
		width: 85%;
		height: 1.05rem;
	}
	.wish-skeleton-bar.is-title-short {
		width: 55%;
		height: 1.05rem;
	}
	.wish-skeleton-bar.is-action {
		width: 4.5rem;
		height: 2.2rem;
		margin-top: 0.4rem;
	}
	@keyframes wish-shimmer {
		to {
			background-position: -200% 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.wish-skeleton-bar {
			animation: none;
		}
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
		background: transparent;
		box-shadow: none;
		color: #111c36;
	}
	.wish-composer-frame {
		position: absolute;
		z-index: 0;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: fill;
		pointer-events: none;
	}
	.wish-composer > :not(.wish-composer-frame) {
		position: relative;
		z-index: 1;
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
		position: relative;
		align-self: end;
		width: 11rem;
		min-height: 0;
		aspect-ratio: 375 / 145;
		border: 0;
		border-radius: 0;
		padding: 0;
		background: transparent;
		box-shadow: none;
		color: transparent;
		font-size: 1rem;
		transition: transform 0.18s ease;
	}
	.wish-submit-art,
	.wish-support-art {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.wish-submit-art img,
	.wish-support-art img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		transition: opacity 0.18s ease;
	}
	.wish-submit-art img {
		object-fit: contain;
	}
	.wish-support-art img {
		object-fit: fill;
	}
	.wish-submit-hover,
	.wish-support-active {
		opacity: 0;
	}
	.wish-submit-label,
	.wish-support-label {
		position: relative;
		z-index: 1;
	}
	.wish-submit:hover:not(:disabled) {
		background: transparent;
		transform: translateY(-2px);
	}
	.wish-submit:hover:not(:disabled) .wish-submit-default,
	.wish-support:hover:not(:disabled) .wish-support-default,
	.wish-support.supported .wish-support-default {
		opacity: 0;
	}
	.wish-submit:hover:not(:disabled) .wish-submit-hover,
	.wish-support:hover:not(:disabled) .wish-support-active,
	.wish-support.supported .wish-support-active {
		opacity: 1;
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
	:global(html[lang='en']) .wish-submit-art {
		display: none;
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
		/* A column flexbox lets the footer's auto margin pin it to the bottom when a row is
		   stretched by a neighbour with a team reply. */
		display: flex;
		flex-direction: column;
		min-height: 11.5rem;
		gap: 0.7rem;
		/* A plain outline with an offset shadow echoes the sketch frame but, unlike a
		   stretched SVG, keeps its corners and stroke whatever height a reply gives it. */
		border: 2px solid #000033;
		border-radius: 1.1rem;
		padding: 1.35rem 1.4rem 1.15rem;
		background: #fff;
		box-shadow: 0.45rem 0.45rem 0 #ccccff;
		color: #111c36;
	}
	.wish-card::before {
		content: '';
		position: absolute;
		z-index: 2;
		top: -0.45rem;
		right: 1.4rem;
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
		position: relative;
		width: 4.8rem;
		min-width: 0;
		aspect-ratio: 95 / 47;
		border: 0;
		border-radius: 0;
		padding: 0;
		background: transparent;
		color: transparent;
	}
	.wish-support:hover:not(:disabled) {
		background: transparent;
	}
	.wish-support.supported {
		background: transparent;
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

	/* Wishes / Fulfilled tabs — a segmented control in the same blue-outline language
	   as the category filters. */
	.wish-board-head {
		flex-wrap: wrap;
	}
	.wish-tabs {
		display: inline-flex;
		gap: 0.25rem;
		margin-left: auto;
		border: 1.5px solid #2462ff;
		border-radius: 999px;
		padding: 0.25rem;
		background: #fff;
	}
	.wish-tabs button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		min-height: 2.5rem;
		border: 0;
		border-radius: 999px;
		padding: 0.4rem 1.1rem;
		background: transparent;
		color: #123cff;
		font: 650 0.9rem var(--font-sans);
		white-space: nowrap;
		cursor: pointer;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}
	.wish-tabs button:hover:not(.active) {
		background: rgba(36, 98, 255, 0.1);
	}
	.wish-tabs button.active {
		background: #3136ff;
		color: #fff;
	}
	.wish-tabs button:focus-visible {
		outline: 2px solid #123cff;
		outline-offset: 2px;
	}
	.wish-tab-mark {
		font-size: 0.85em;
	}
	.wish-panel {
		display: grid;
		gap: 1.2rem;
		outline: 0;
	}
	.wish-board-lede {
		margin: -0.35rem 0 0;
		color: var(--ink-soft);
		font-size: 0.92rem;
		line-height: 1.6;
	}

	/* Fulfilled cards and team replies (dark variants at the end of this block). */
	.wish-card-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		border-radius: 999px;
		padding: 0.25rem 0.65rem;
		background: #12855b;
		color: #fff;
		font-size: 0.74rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.wish-card-detail {
		position: relative;
		z-index: 3;
		margin-top: -0.2rem;
	}
	.wish-card-detail summary {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 1.75rem;
		color: #123cff;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		list-style: none;
	}
	.wish-card-detail summary::-webkit-details-marker {
		display: none;
	}
	.wish-card-detail summary::after {
		content: '';
		width: 0.42rem;
		height: 0.42rem;
		border-right: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		transform: translateY(-0.12rem) rotate(45deg);
		transition: transform 0.15s ease;
	}
	.wish-card-detail[open] summary::after {
		transform: translateY(0.1rem) rotate(-135deg);
	}
	.wish-card-detail summary:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.wish-card-detail summary:focus-visible {
		outline: 2px solid #2462ff;
		outline-offset: 2px;
		border-radius: 0.3rem;
	}
	.wish-card-detail-hide,
	.wish-card-detail[open] .wish-card-detail-show {
		display: none;
	}
	.wish-card-detail[open] .wish-card-detail-hide {
		display: inline;
	}
	.wish-card-detail p {
		margin: 0.3rem 0 0;
		color: #2c3b5c;
		font-size: 0.86rem;
		line-height: 1.6;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	/* Opening the detail also reveals the full title, which is clamped to two lines. */
	.wish-card:has(.wish-card-detail[open]) .wish-card-title {
		display: block;
		-webkit-line-clamp: unset;
		line-clamp: unset;
	}
	.wish-reply {
		position: relative;
		z-index: 3;
		display: grid;
		gap: 0.35rem;
		margin-top: 0.1rem;
		border: 1.5px solid #2462ff;
		border-radius: 0.2rem 0.9rem 0.9rem 0.9rem;
		padding: 0.7rem 0.85rem 0.75rem;
		background: #eef0ff;
		color: #182744;
	}
	.wish-reply-label {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: #123cff;
		font-size: 0.74rem;
		font-weight: 750;
		letter-spacing: 0.02em;
	}
	.wish-reply-mark {
		display: inline-grid;
		place-items: center;
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: #3136ff;
		color: #fff;
		font-size: 0.66rem;
		font-weight: 800;
	}
	.wish-reply p {
		margin: 0;
		font-size: 0.86rem;
		line-height: 1.6;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	.wish-card-fulfilled-on {
		margin-left: auto;
		color: #536489;
		font-size: 0.78rem;
		white-space: nowrap;
	}
	.wish-card.is-fulfilled .wish-card-actions {
		min-height: 2.35rem;
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
		.wish-composer-frame {
			display: none;
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
		.wish-tabs {
			width: 100%;
			margin-left: 0;
		}
		.wish-tabs button {
			flex: 1;
		}
		.wish-list {
			grid-template-columns: 1fr;
		}
		.wish-card {
			min-height: 10.75rem;
			padding-inline: 1.2rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wish-card-detail summary::after,
		.wish-card,
		.wish-card.is-new,
		.wish-filter button,
		.wish-tabs button {
			animation: none;
			transition: none;
		}
	}

	/* Dark appearance: the same sketch language (ink outline, offset shadow, tape) on
	   the site's dark surfaces, so the board does not read as light cards pasted on a
	   dark page. The composer's wide SVG frame is light-only; dark uses its outline. */
	:global(:root[data-theme='dark']) .wish-composer {
		border: 2px solid #8fa8ff;
		border-radius: 1.75rem;
		background: var(--surface);
		box-shadow:
			0 0 0 4px var(--base),
			0 0 0 5px #8fa8ff;
		color: var(--ink);
	}
	:global(:root[data-theme='dark']) .wish-composer-frame {
		display: none;
	}
	:global(:root[data-theme='dark']) .wish-field-label,
	:global(:root[data-theme='dark']) .wish-privacy strong {
		color: var(--ink);
	}
	:global(:root[data-theme='dark']) .wish-title-field input,
	:global(:root[data-theme='dark']) .wish-category-field select,
	:global(:root[data-theme='dark']) .wish-detail-field textarea {
		border-color: #8c9db4;
		background: var(--surface-2);
		color: var(--ink);
	}
	:global(:root[data-theme='dark']) .wish-title-field input:focus-visible,
	:global(:root[data-theme='dark']) .wish-category-field select:focus-visible,
	:global(:root[data-theme='dark']) .wish-detail-field textarea:focus-visible {
		border-color: var(--brand);
		background: var(--surface-2);
		box-shadow: 0 0 0 3px var(--brand-soft);
	}
	:global(:root[data-theme='dark']) .wish-detail-field summary,
	:global(:root[data-theme='dark']) .wish-privacy,
	:global(:root[data-theme='dark']) .wish-card-time,
	:global(:root[data-theme='dark']) .wish-support-count,
	:global(:root[data-theme='dark']) .wish-card-fulfilled-on {
		color: var(--ink-soft);
	}
	:global(:root[data-theme='dark']) .wish-card {
		border-color: #9fb4ff;
		background: var(--surface);
		box-shadow: 0.45rem 0.45rem 0 #2c3d78;
		color: var(--ink);
	}
	:global(:root[data-theme='dark']) .wish-card::before {
		background: rgba(143, 168, 255, 0.45);
		border-color: rgba(143, 168, 255, 0.5);
	}
	:global(:root[data-theme='dark']) .wish-card-category,
	:global(:root[data-theme='dark']) .wish-filter button {
		border-color: #8aa9ff;
		background: transparent;
		color: #c3d2ff;
	}
	:global(:root[data-theme='dark']) .wish-filter button.active {
		border-color: #8aa9ff;
		background: #3d4dff;
		color: #fff;
	}
	:global(:root[data-theme='dark']) .wish-card-detail summary {
		color: #a9c5ff;
	}
	:global(:root[data-theme='dark']) .wish-card-detail p {
		color: var(--ink-soft);
	}
	:global(:root[data-theme='dark']) .wish-reply {
		border-color: #8aa9ff;
		background: #1c2a4a;
		color: var(--ink);
	}
	:global(:root[data-theme='dark']) .wish-reply-label {
		color: #a9c5ff;
	}
	:global(:root[data-theme='dark']) .wish-tabs {
		border-color: #8aa9ff;
		background: var(--surface);
	}
	:global(:root[data-theme='dark']) .wish-tabs button {
		color: #c3d2ff;
	}
	:global(:root[data-theme='dark']) .wish-tabs button.active {
		background: #3d4dff;
		color: #fff;
	}
	:global(:root[data-theme='dark']) .wish-state {
		border-color: #8aa9ff;
		background: var(--surface);
		color: var(--ink-soft);
	}
	:global(:root[data-theme='dark']) .wish-state.is-error strong {
		color: #ff9c8a;
	}
	:global(:root[data-theme='dark']) .wish-retry {
		background: transparent;
	}
</style>
