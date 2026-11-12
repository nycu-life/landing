<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { m } from '$lib/paraglide/messages';
	import { localeState } from '$lib/i18n.svelte';
	import { formatDateTime } from '$lib/typography';
	import {
		WishAdminRequestError,
		getAdminSession,
		listAdminWishes,
		logoutAdmin,
		maxWishReplyLength,
		updateAdminWish,
		type AdminSessionUser,
		type AdminWish,
		type AdminWishUpdate,
		type WishVisibility
	} from '$lib/wish-admin';
	import type { WishCategory, WishStatus } from '$lib/wishes';

	let identity = $state<AdminSessionUser | null>(null);
	let visibility = $state<WishVisibility>('pending');
	let statusFilter = $state<WishStatus | 'all'>('all');
	let editingId = $state('');
	let replyDraft = $state('');
	let wishes = $state<AdminWish[]>([]);
	let query = $state('');
	let checkingSession = $state(true);
	let loading = $state(false);
	/** The last list request failed: show that instead of an "all clear" empty list. */
	let loadFailed = $state(false);
	let copiedId = $state('');

	async function copyId(id: string) {
		try {
			await navigator.clipboard.writeText(id);
			copiedId = id;
			setTimeout(() => {
				if (copiedId === id) copiedId = '';
			}, 1500);
		} catch {
			// Clipboard access can be refused; the full ID stays in the tooltip.
		}
	}
	let loggingOut = $state(false);
	let updatingId = $state('');
	let error = $state('');
	let notice = $state('');
	let requestVersion = 0;

	const connected = $derived(identity !== null);
	const filteredWishes = $derived.by(() => {
		const needle = query.trim().toLocaleLowerCase();
		if (!needle) return wishes;
		return wishes.filter((wish) =>
			`${wish.title} ${wish.detail} ${wish.id}`.toLocaleLowerCase().includes(needle)
		);
	});

	const visibilityLabel = (value: WishVisibility) =>
		({
			pending: m.wish_admin_pending,
			published: m.wish_admin_published,
			hidden: m.wish_admin_hidden
		})[value]();
	const categoryLabel = (value: WishCategory) =>
		({
			life: m.wish_category_life,
			transport: m.wish_category_transport,
			learning: m.wish_category_learning,
			space: m.wish_category_space,
			other: m.wish_category_other
		})[value]();
	const statusLabel = (value: WishStatus | 'all') =>
		({
			all: m.wish_admin_status_all,
			open: m.wish_admin_status_open,
			fulfilled: m.wish_admin_status_fulfilled
		})[value]();
	const replyLength = $derived([...replyDraft].length);
	const supportCountLabel = (count: number) =>
		count === 1 ? m.wish_support_one() : m.wish_support_count({ count });
	const formatCreatedAt = (value: string) => {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return value;
		return formatDateTime(date, localeState.current, {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	};

	function errorMessage(caught: unknown) {
		if (caught instanceof WishAdminRequestError && caught.status === 401) {
			return m.wish_admin_error_session_expired();
		}
		return m.wish_admin_error_load();
	}

	function authCallbackMessage(code: string | null) {
		if (code === 'denied') return m.wish_admin_error_denied();
		if (code === 'unavailable') return m.wish_admin_error_auth_unavailable();
		if (code === 'oauth_error' || code === 'invalid_callback') {
			return m.wish_admin_error_auth_callback();
		}
		return '';
	}

	function clearIdentity(message = '') {
		requestVersion += 1;
		identity = null;
		wishes = [];
		query = '';
		notice = '';
		loading = false;
		updatingId = '';
		editingId = '';
		error = message;
	}

	async function load(nextVisibility: WishVisibility, nextStatus = statusFilter) {
		if (!identity) return;
		const version = ++requestVersion;
		loading = true;
		loadFailed = false;
		error = '';
		notice = '';
		try {
			const items = await listAdminWishes(nextVisibility, {
				status: nextStatus === 'all' ? undefined : nextStatus
			});
			if (version !== requestVersion) return;
			visibility = nextVisibility;
			statusFilter = nextStatus;
			editingId = '';
			wishes = items;
			query = '';
		} catch (caught) {
			if (version !== requestVersion) return;
			if (caught instanceof WishAdminRequestError && caught.status === 401) {
				clearIdentity(m.wish_admin_error_session_expired());
				return;
			}
			error = errorMessage(caught);
			loadFailed = true;
		} finally {
			if (version === requestVersion) loading = false;
		}
	}

	async function initialize() {
		const params = new SvelteURLSearchParams(window.location.search);
		const callbackError = authCallbackMessage(params.get('auth'));
		if (params.has('auth')) {
			params.delete('auth');
			const queryString = params.toString();
			window.history.replaceState(
				{},
				'',
				`${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`
			);
		}
		try {
			identity = await getAdminSession();
			if (!identity) error = callbackError;
		} catch {
			error = callbackError || m.wish_admin_error_auth_unavailable();
		} finally {
			checkingSession = false;
		}
		// Signed in: show the workspace right away; the list has its own loading state.
		if (identity) await load('pending');
	}

	async function disconnect() {
		if (loggingOut) return;
		loggingOut = true;
		try {
			await logoutAdmin();
			clearIdentity();
		} catch {
			clearIdentity(m.wish_admin_error_load());
		} finally {
			loggingOut = false;
		}
	}

	/** Sends an admin PATCH and keeps the current list consistent with its filters. */
	async function patchWish(wish: AdminWish, update: AdminWishUpdate, successNotice: () => string) {
		if (!identity || updatingId) return false;
		updatingId = wish.id;
		error = '';
		notice = '';
		try {
			const updated = { ...wish, ...(await updateAdminWish(wish.id, update)) };
			const leavesList =
				update.visibility !== undefined ||
				(statusFilter !== 'all' && (updated.status ?? 'open') !== statusFilter);
			wishes = leavesList
				? wishes.filter((item) => item.id !== wish.id)
				: wishes.map((item) => (item.id === wish.id ? updated : item));
			notice = successNotice();
			return true;
		} catch (caught) {
			if (caught instanceof WishAdminRequestError && caught.status === 401) {
				clearIdentity(m.wish_admin_error_session_expired());
			} else {
				error = m.wish_admin_error_update();
			}
			return false;
		} finally {
			updatingId = '';
		}
	}

	function updateVisibility(wish: AdminWish, nextVisibility: WishVisibility) {
		return patchWish(wish, { visibility: nextVisibility }, () =>
			nextVisibility === 'hidden' ? m.wish_admin_notice_hidden() : m.wish_admin_notice_published()
		);
	}

	function updateStatus(wish: AdminWish, nextStatus: WishStatus) {
		return patchWish(wish, { status: nextStatus }, () =>
			nextStatus === 'fulfilled' ? m.wish_admin_notice_fulfilled() : m.wish_admin_notice_reopened()
		);
	}

	function startReply(wish: AdminWish) {
		editingId = wish.id;
		replyDraft = wish.reply ?? '';
	}

	async function saveReply(wish: AdminWish, nextReply: string) {
		const reply = nextReply.trim();
		if (reply === (wish.reply ?? '')) {
			editingId = '';
			return;
		}
		const saved = await patchWish(wish, { reply }, () =>
			reply ? m.wish_admin_notice_reply_saved() : m.wish_admin_notice_reply_cleared()
		);
		if (saved) editingId = '';
	}

	onMount(() => {
		void initialize();
	});
</script>

<section class="wish-admin" aria-label={m.wish_admin_title()}>
	{#if checkingSession}
		<div class="admin-auth glass glass-strong" aria-live="polite">
			<div class="auth-copy">
				<span class="admin-kicker">NYCU LIFE / WISH POOL</span>
				<h2>{m.wish_admin_checking()}</h2>
				<p>{m.wish_admin_checking_body()}</p>
			</div>
			<span class="auth-spinner" aria-hidden="true"></span>
		</div>
	{:else if !connected}
		<div class="admin-auth glass glass-strong">
			<div class="auth-copy">
				<span class="admin-kicker">NYCU LIFE / WISH POOL</span>
				<h2>{m.wish_admin_login_title()}</h2>
				<p>{m.wish_admin_login_body()}</p>
			</div>
			<a class="landing-button landing-button-primary" href="/api/wishes/auth/login"
				>{m.wish_admin_sign_in()}</a
			>
			<p class="auth-note">{m.wish_admin_auth_note()}</p>
			{#if error}<p class="admin-message error" role="alert">{error}</p>{/if}
		</div>
	{:else}
		<div class="admin-toolbar glass glass-strong">
			<div class="connection-status">
				<span class="status-dot" aria-hidden="true"></span>
				<div>
					<strong>{m.wish_admin_connected()}</strong>
					<span>{identity?.name} / {m.wish_admin_connected_body()}</span>
				</div>
			</div>
			<div class="toolbar-actions">
				<button
					class="toolbar-button"
					type="button"
					disabled={loading}
					onclick={() => load(visibility)}>{m.wish_admin_refresh()}</button
				>
				<button
					class="toolbar-button danger"
					type="button"
					disabled={loggingOut}
					onclick={disconnect}
					>{loggingOut ? m.wish_admin_signing_out() : m.wish_admin_sign_out()}</button
				>
			</div>
		</div>

		<div class="admin-controls">
			<div class="visibility-tabs" role="tablist" aria-label={m.wish_admin_visibility_label()}>
				{#each ['pending', 'published', 'hidden'] as option (option)}
					<button
						type="button"
						role="tab"
						aria-selected={visibility === option}
						class:active={visibility === option}
						disabled={loading}
						onclick={() => load(option as WishVisibility)}
					>
						{visibilityLabel(option as WishVisibility)}
					</button>
				{/each}
			</div>
			<label class="status-filter">
				<span>{m.wish_admin_status_filter_label()}</span>
				<select
					value={statusFilter}
					disabled={loading}
					onchange={(event) => load(visibility, event.currentTarget.value as WishStatus | 'all')}
				>
					{#each ['all', 'open', 'fulfilled'] as option (option)}
						<option value={option}>{statusLabel(option as WishStatus | 'all')}</option>
					{/each}
				</select>
			</label>
			<label class="admin-search">
				<span class="sr-only">{m.wish_admin_search_label()}</span>
				<svg aria-hidden="true" viewBox="0 0 24 24">
					<circle cx="11" cy="11" r="7" />
					<path d="m16 16 4 4" />
				</svg>
				<input bind:value={query} type="search" placeholder={m.wish_admin_search_placeholder()} />
			</label>
		</div>

		{#if error && !(loadFailed && wishes.length === 0)}
			<p class="admin-message error" role="alert">{error}</p>
		{/if}
		{#if notice}<p class="admin-message notice" role="status">{notice}</p>{/if}

		<div class="list-heading">
			<div>
				<span>{visibilityLabel(visibility)}</span>
				<strong>{loading ? '–' : filteredWishes.length}</strong>
			</div>
			<p>{m.wish_admin_list_hint()}</p>
		</div>

		{#if loading}
			<div class="admin-state" role="status" aria-busy="true">
				<span class="admin-spinner" aria-hidden="true"></span>
				{m.wish_admin_loading()}
			</div>
		{:else if loadFailed && wishes.length === 0}
			<div class="admin-state failed">
				<span aria-hidden="true">!</span>
				<strong role="alert">{error || m.wish_admin_error_load()}</strong>
				<button class="action-button secondary" type="button" onclick={() => load(visibility)}
					>{m.wish_admin_refresh()}</button
				>
			</div>
		{:else if filteredWishes.length === 0}
			<div class="admin-state empty">
				<span aria-hidden="true">✓</span>
				<strong>{m.wish_admin_empty_title()}</strong>
				<p>{query ? m.wish_admin_empty_search() : m.wish_admin_empty_body()}</p>
			</div>
		{:else}
			<div class="admin-list">
				{#each filteredWishes as wish (wish.id)}
					<article class="admin-card">
						<div class="card-meta">
							<span class="card-chips">
								<span class="category-chip">{categoryLabel(wish.category)}</span>
								{#if wish.status === 'fulfilled'}
									<span class="status-chip">✓ {m.wish_admin_status_fulfilled()}</span>
								{/if}
							</span>
							<time datetime={wish.createdAt}>{formatCreatedAt(wish.createdAt)}</time>
						</div>
						<h3>{wish.title}</h3>
						{#if wish.detail}<p class="wish-detail">{wish.detail}</p>{/if}
						{#if editingId === wish.id}
							<form
								class="reply-editor"
								onsubmit={(event) => {
									event.preventDefault();
									void saveReply(wish, replyDraft);
								}}
							>
								<label for="reply-{wish.id}">{m.wish_admin_reply_label()}</label>
								<textarea
									id="reply-{wish.id}"
									bind:value={replyDraft}
									rows="4"
									maxlength={maxWishReplyLength}
									placeholder={m.wish_admin_reply_placeholder()}
									disabled={Boolean(updatingId)}
								></textarea>
								<div class="reply-editor-footer">
									<span class="reply-note"
										>{m.wish_admin_reply_public_note()}
										<span class="reply-count"
											>{m.wish_admin_reply_count({
												count: replyLength,
												max: maxWishReplyLength
											})}</span
										></span
									>
									<div class="reply-editor-actions">
										<button
											class="action-button secondary"
											type="button"
											disabled={Boolean(updatingId)}
											onclick={() => (editingId = '')}>{m.wish_admin_reply_cancel()}</button
										>
										{#if wish.reply}
											<button
												class="action-button danger"
												type="button"
												disabled={Boolean(updatingId)}
												onclick={() => saveReply(wish, '')}>{m.wish_admin_reply_clear()}</button
											>
										{/if}
										<button
											class="action-button primary"
											type="submit"
											disabled={Boolean(updatingId) || replyLength > maxWishReplyLength}
											>{updatingId === wish.id
												? m.wish_admin_updating()
												: m.wish_admin_reply_save()}</button
										>
									</div>
								</div>
							</form>
						{:else if wish.reply}
							<div class="reply-preview">
								<span>{m.wish_admin_reply_label()}</span>
								<p>{wish.reply}</p>
							</div>
						{/if}
						<div class="card-footer">
							<div class="wish-facts">
								<span>{supportCountLabel(wish.supportCount)}</span>
								<button
									type="button"
									class="wish-id"
									title={wish.id}
									aria-label={`${m.wish_admin_copy_id()}：${wish.id}`}
									onclick={() => copyId(wish.id)}
									>{copiedId === wish.id
										? m.wish_admin_copied_id()
										: `ID ${wish.id.slice(0, 8)}`}</button
								>
							</div>
							<div class="card-actions">
								{#snippet secondaryActions()}
									{#if editingId !== wish.id}
										<button
											class="action-button secondary"
											type="button"
											disabled={Boolean(updatingId)}
											onclick={() => startReply(wish)}
											>{wish.reply ? m.wish_admin_reply_edit() : m.wish_admin_reply_write()}</button
										>
									{/if}
									<button
										class="action-button secondary"
										class:fulfil={wish.status !== 'fulfilled'}
										type="button"
										disabled={Boolean(updatingId)}
										onclick={() =>
											updateStatus(wish, wish.status === 'fulfilled' ? 'open' : 'fulfilled')}
										>{wish.status === 'fulfilled'
											? m.wish_admin_reopen()
											: m.wish_admin_mark_fulfilled()}</button
									>
								{/snippet}
								{#if visibility === 'pending'}
									<!-- The review queue leads with the decision (publish or hide); replying
									     and status changes stay one step away. -->
									<details class="more-actions">
										<summary class="action-button secondary">{m.wish_admin_more()}</summary>
										<div class="more-menu">{@render secondaryActions()}</div>
									</details>
								{:else}
									{@render secondaryActions()}
								{/if}
								{#if visibility === 'pending'}
									<button
										class="action-button danger"
										type="button"
										disabled={Boolean(updatingId)}
										onclick={() => updateVisibility(wish, 'hidden')}>{m.wish_admin_hide()}</button
									>
									<button
										class="action-button primary"
										type="button"
										disabled={Boolean(updatingId)}
										onclick={() => updateVisibility(wish, 'published')}
										>{updatingId === wish.id
											? m.wish_admin_updating()
											: m.wish_admin_publish()}</button
									>
								{:else if visibility === 'published'}
									<button
										class="action-button danger"
										type="button"
										disabled={Boolean(updatingId)}
										onclick={() => updateVisibility(wish, 'hidden')}
										>{updatingId === wish.id
											? m.wish_admin_updating()
											: m.wish_admin_hide()}</button
									>
								{:else}
									<button
										class="action-button primary"
										type="button"
										disabled={Boolean(updatingId)}
										onclick={() => updateVisibility(wish, 'published')}
										>{updatingId === wish.id
											? m.wish_admin_updating()
											: m.wish_admin_restore()}</button
									>
								{/if}
							</div>
						</div>
					</article>
				{/each}
			</div>
		{/if}
	{/if}
</section>

<style>
	.wish-admin {
		display: grid;
		gap: 1.25rem;
	}
	.admin-auth {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 1.25rem;
		padding: clamp(1.4rem, 3vw, 2rem);
		border-radius: 1.5rem;
	}
	.auth-copy {
		display: grid;
		gap: 0.55rem;
	}
	.admin-kicker {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: var(--brand);
	}
	.auth-copy h2,
	.auth-copy p {
		margin: 0;
	}
	.auth-copy h2 {
		font-size: clamp(1.35rem, 3vw, 1.75rem);
		line-height: 1.15;
	}
	.auth-copy p,
	.auth-note {
		color: var(--ink-soft);
		line-height: 1.6;
	}
	.admin-search input {
		width: 100%;
		border: 1px solid var(--line-strong);
		background: var(--surface);
		color: var(--ink);
		outline: 0;
	}
	.admin-search input:focus {
		border-color: var(--brand);
		box-shadow: 0 0 0 3px var(--brand-soft);
	}
	.auth-note {
		grid-column: 1 / -1;
		margin: -0.25rem 0 0;
		font-size: 0.78rem;
	}
	.auth-spinner {
		width: 1.7rem;
		height: 1.7rem;
		border: 0.18rem solid var(--line-strong);
		border-top-color: var(--brand);
		border-radius: 50%;
		animation: auth-spin 0.8s linear infinite;
	}
	@keyframes auth-spin {
		to {
			transform: rotate(360deg);
		}
	}
	.admin-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.2rem;
		border-radius: 1.25rem;
	}
	.connection-status,
	.toolbar-actions,
	.card-meta,
	.card-footer,
	.wish-facts,
	.card-actions,
	.list-heading > div {
		display: flex;
		align-items: center;
	}
	.connection-status {
		gap: 0.75rem;
	}
	.connection-status > div {
		display: grid;
		gap: 0.12rem;
	}
	.connection-status strong {
		font-size: 0.9rem;
	}
	.connection-status span:not(.status-dot) {
		font-size: 0.76rem;
		color: var(--ink-soft);
	}
	.status-dot {
		width: 0.65rem;
		height: 0.65rem;
		border-radius: 50%;
		background: var(--ok);
		box-shadow: 0 0 0 0.3rem var(--ok-soft);
	}
	.toolbar-actions,
	.card-actions {
		gap: 0.55rem;
	}
	.card-actions {
		flex-wrap: wrap;
		justify-content: flex-end;
	}
	.toolbar-button,
	.visibility-tabs button,
	.action-button {
		border: 0;
		font-weight: 700;
		cursor: pointer;
		transition:
			background-color 0.18s ease,
			color 0.18s ease,
			border-color 0.18s ease,
			transform 0.18s ease;
	}
	.toolbar-button {
		padding: 0.55rem 0.8rem;
		border-radius: 0.65rem;
		background: var(--surface-3);
		color: var(--ink);
		font-size: 0.8rem;
	}
	.toolbar-button.danger {
		color: #b42318;
	}
	.admin-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}
	.visibility-tabs {
		display: inline-flex;
		gap: 0.25rem;
		padding: 0.25rem;
		border: 1px solid var(--line);
		border-radius: 0.85rem;
		background: var(--surface-2);
	}
	.visibility-tabs button {
		padding: 0.62rem 0.9rem;
		border-radius: 0.65rem;
		background: transparent;
		color: var(--ink-soft);
		font-size: 0.86rem;
	}
	.visibility-tabs button.active {
		background: var(--surface);
		color: var(--brand);
		box-shadow: var(--shadow-soft);
	}
	.admin-search {
		position: relative;
		width: min(100%, 20rem);
	}
	.status-filter {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: auto;
		color: var(--ink-soft);
		font-size: 0.8rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.status-filter select {
		height: 2.75rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		padding: 0 0.95rem;
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	.status-filter select:focus-visible {
		border-color: var(--brand);
		outline: 0;
		box-shadow: 0 0 0 3px var(--brand-soft);
	}
	.admin-search svg {
		position: absolute;
		top: 50%;
		left: 0.8rem;
		width: 1rem;
		height: 1rem;
		transform: translateY(-50%);
		fill: none;
		stroke: var(--muted);
		stroke-width: 2;
	}
	.admin-search input {
		height: 2.75rem;
		padding: 0.65rem 0.8rem 0.65rem 2.4rem;
		border-radius: 999px;
	}
	.admin-message {
		margin: 0;
		padding: 0.8rem 1rem;
		border-radius: 0.9rem;
		font-size: 0.88rem;
		font-weight: 600;
	}
	.admin-message.error {
		background: rgba(217, 45, 32, 0.1);
		color: #b42318;
	}
	.admin-message.notice {
		background: var(--ok-soft);
		color: var(--lime-ink);
	}
	.admin-auth .admin-message {
		grid-column: 1 / -1;
	}
	.list-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.35rem;
	}
	.list-heading > div {
		gap: 0.55rem;
	}
	.list-heading span {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--ink-soft);
	}
	.list-heading strong {
		display: inline-grid;
		place-items: center;
		min-width: 1.7rem;
		height: 1.7rem;
		padding-inline: 0.35rem;
		border-radius: 999px;
		background: var(--brand-soft);
		color: var(--brand);
		font-size: 0.8rem;
	}
	.list-heading p {
		margin: 0;
		font-size: 0.76rem;
		color: var(--muted);
	}
	.admin-list {
		display: grid;
		gap: 0.85rem;
	}
	.admin-card {
		display: grid;
		gap: 0.8rem;
		padding: clamp(1rem, 2.5vw, 1.35rem);
		border: 1px solid var(--line);
		border-radius: 1.2rem;
		background: var(--surface);
		box-shadow: var(--shadow-soft);
	}
	.card-meta {
		justify-content: space-between;
		gap: 1rem;
	}
	.card-chips {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.status-chip {
		padding: 0.3rem 0.58rem;
		border-radius: 999px;
		background: var(--ok-soft);
		color: var(--lime-ink);
		font-size: 0.72rem;
		font-weight: 700;
	}
	.reply-preview,
	.reply-editor {
		display: grid;
		gap: 0.45rem;
		padding: 0.8rem 0.95rem;
		border: 1px solid color-mix(in srgb, var(--brand) 35%, var(--line));
		border-radius: 0.3rem 0.95rem 0.95rem 0.95rem;
		background: var(--brand-soft);
	}
	.reply-preview > span,
	.reply-editor label {
		color: var(--brand);
		font-size: 0.74rem;
		font-weight: 750;
	}
	.reply-preview p {
		color: var(--ink);
		font-size: 0.88rem;
		line-height: 1.6;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	.reply-editor textarea {
		width: 100%;
		min-height: 6.5rem;
		border: 1px solid var(--line-strong);
		border-radius: 0.7rem;
		padding: 0.7rem 0.85rem;
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		font-size: 0.9rem;
		line-height: 1.6;
		resize: vertical;
		outline: 0;
	}
	.reply-editor textarea:focus-visible {
		border-color: var(--brand);
		box-shadow: 0 0 0 3px var(--brand-soft);
	}
	.reply-editor-footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem;
	}
	.reply-note {
		color: var(--muted);
		font-size: 0.74rem;
		line-height: 1.5;
	}
	.reply-count {
		margin-left: 0.4rem;
		font-variant-numeric: tabular-nums;
	}
	.reply-editor-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-left: auto;
	}
	.action-button.secondary.fulfil {
		border-color: color-mix(in srgb, var(--ok) 55%, transparent);
		color: var(--lime-ink);
	}
	.category-chip {
		padding: 0.3rem 0.58rem;
		border-radius: 999px;
		background: var(--brand-soft);
		color: var(--brand);
		font-size: 0.72rem;
		font-weight: 700;
	}
	.card-meta time {
		font-size: 0.82rem;
		color: var(--ink-soft);
	}
	.admin-card h3,
	.admin-card p {
		margin: 0;
	}
	.admin-card h3 {
		font-size: clamp(1.02rem, 2vw, 1.18rem);
		line-height: 1.45;
		word-break: break-word;
	}
	.wish-detail {
		color: var(--ink-soft);
		font-size: 0.9rem;
		line-height: 1.65;
		white-space: pre-wrap;
		word-break: break-word;
	}
	.card-footer {
		justify-content: space-between;
		gap: 1rem;
		padding-top: 0.2rem;
	}
	.wish-facts {
		min-width: 0;
		gap: 0.8rem;
		color: var(--ink-soft);
		font-size: 0.82rem;
	}
	.wish-id {
		min-height: 2rem;
		padding: 0.15rem 0.6rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		background: transparent;
		color: inherit;
		font: 600 0.78rem var(--font-sans);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		cursor: copy;
	}
	.wish-id:hover {
		border-color: var(--brand);
		color: var(--brand);
	}
	.action-button {
		padding: 0.58rem 0.86rem;
		border: 1px solid transparent;
		border-radius: 0.7rem;
		font-size: 0.8rem;
	}
	.action-button.primary {
		background: var(--brand);
		color: #fff;
	}
	.action-button.secondary {
		border-color: var(--line-strong);
		background: var(--surface);
		color: var(--ink-soft);
	}
	.more-actions {
		position: relative;
	}
	.more-actions > summary {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		list-style: none;
		cursor: pointer;
	}
	.more-actions > summary::-webkit-details-marker {
		display: none;
	}
	.more-actions > summary::after {
		content: '';
		width: 0.4rem;
		height: 0.4rem;
		border-right: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		transform: translateY(-0.1rem) rotate(45deg);
	}
	.more-actions[open] > summary::after {
		transform: translateY(0.1rem) rotate(-135deg);
	}
	.more-menu {
		position: absolute;
		z-index: 5;
		right: 0;
		top: calc(100% + 0.4rem);
		display: grid;
		gap: 0.4rem;
		min-width: 11rem;
		padding: 0.5rem;
		border: 1px solid var(--line-strong);
		border-radius: 0.8rem;
		background: var(--surface);
		box-shadow: var(--shadow);
	}
	.more-menu > .action-button {
		width: 100%;
		text-align: left;
	}
	.action-button.danger {
		border-color: rgba(180, 35, 24, 0.35);
		background: rgba(217, 45, 32, 0.08);
		color: #b42318;
	}

	.action-button:hover:not(:disabled),
	.toolbar-button:hover:not(:disabled) {
		transform: translateY(-1px);
	}
	button:disabled {
		cursor: wait;
		opacity: 0.55;
	}
	.admin-state {
		display: grid;
		place-items: center;
		min-height: 11rem;
		padding: 2rem;
		border: 1px dashed var(--line-strong);
		border-radius: 1.2rem;
		color: var(--ink-soft);
		text-align: center;
	}
	.admin-state.empty {
		gap: 0.4rem;
	}
	.admin-state.empty > span {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 50%;
		background: var(--ok-soft);
		color: var(--lime-ink);
		font-weight: 800;
	}
	.admin-state.empty p {
		margin: 0;
		font-size: 0.86rem;
		color: var(--muted);
	}
	.admin-state[aria-busy='true'] {
		grid-auto-flow: column;
		gap: 0.75rem;
		justify-content: center;
	}
	.admin-spinner {
		width: 1.2rem;
		height: 1.2rem;
		border: 2px solid var(--brand-soft);
		border-top-color: var(--brand);
		border-radius: 50%;
		animation: admin-spin 0.8s linear infinite;
	}
	@keyframes admin-spin {
		to {
			transform: rotate(1turn);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.admin-spinner {
			animation-duration: 2.4s;
		}
	}
	.admin-state.failed {
		gap: 0.6rem;
		border-color: color-mix(in srgb, #c2412d 45%, var(--line));
	}
	.admin-state.failed > span {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 50%;
		background: rgba(194, 65, 45, 0.12);
		color: #c2412d;
		font-weight: 800;
	}
	.admin-state.failed strong {
		color: var(--ink);
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		border: 0;
		clip-path: inset(50%);
		overflow: hidden;
		white-space: nowrap;
	}
	/* --lime-ink has no dark-theme value, so lift the green status text locally. */
	:global(html[data-theme='dark']) .status-chip,
	:global(html[data-theme='dark']) .action-button.secondary.fulfil {
		color: #71d5aa;
	}
	/* Dark brand blue is light, so primary actions take dark text. */
	:global(html[data-theme='dark']) .action-button.primary {
		color: var(--base);
	}
	:global(html[data-theme='dark']) .toolbar-button.danger,
	:global(html[data-theme='dark']) .admin-message.error,
	:global(html[data-theme='dark']) .action-button.danger {
		color: #ffaaa2;
	}
	@media (max-width: 800px) {
		.admin-auth {
			grid-template-columns: 1fr;
			align-items: stretch;
		}
		.auth-note,
		.admin-auth .admin-message {
			grid-column: auto;
		}
		.admin-auth .landing-button {
			width: 100%;
		}
	}
	@media (max-width: 640px) {
		.admin-toolbar,
		.admin-controls,
		.card-footer,
		.list-heading {
			align-items: stretch;
			flex-direction: column;
		}
		.toolbar-actions,
		.visibility-tabs,
		.admin-search,
		.card-actions {
			width: 100%;
		}
		.toolbar-actions > *,
		.visibility-tabs > *,
		.card-actions > *,
		.reply-editor-actions > * {
			flex: 1;
		}
		/* Up to four card actions: two even columns keep labels on one line, and an odd
		   final (primary) action spans the row. */
		.card-actions {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.card-actions > :last-child:nth-child(odd) {
			grid-column: 1 / -1;
		}
		.action-button {
			white-space: nowrap;
		}
		.status-filter {
			justify-content: space-between;
			margin-left: 0;
		}
		.status-filter select {
			flex: 1;
		}
		.reply-editor-actions {
			width: 100%;
		}
		.wish-facts {
			justify-content: space-between;
		}
		.wish-id {
			max-width: 9rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.auth-spinner {
			animation-duration: 1.8s;
		}
		.toolbar-button,
		.visibility-tabs button,
		.action-button {
			transition: none;
		}
	}
</style>
