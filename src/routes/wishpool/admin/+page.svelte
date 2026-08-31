<script lang="ts">
	import { base } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import WishAdmin from '$lib/components/landing/WishAdmin.svelte';
	import SiteFooter from '$lib/components/landing/SiteFooter.svelte';
</script>

<svelte:head>
	<title>{m.wish_admin_title()}｜NYCU LIFE</title>
	<meta name="description" content={m.wish_admin_lede()} />
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div id="wish-admin" class="page admin-page">
	<header class="page-head admin-head">
		<div>
			<p class="admin-eyebrow">WISH POOL · ADMIN</p>
			<h1 class="page-title">{m.wish_admin_title()}</h1>
		</div>
		<a class="back-link" href="{base}/wishpool/">← {m.wish_admin_back()}</a>
		<p class="page-lede">{m.wish_admin_lede()}</p>
	</header>
	<WishAdmin />
</div>

<SiteFooter />

<style>
	.admin-page {
		max-width: 68rem;
	}
	.admin-head {
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: end;
		max-width: none;
	}
	.admin-head > div {
		display: grid;
		gap: 0.65rem;
	}
	.admin-eyebrow {
		margin: 0;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		color: var(--brand);
	}
	.admin-head .page-lede {
		grid-column: 1 / -1;
	}
	.back-link {
		padding-bottom: 0.15rem;
		font-size: 0.86rem;
		font-weight: 700;
		color: var(--brand);
	}
	@media (max-width: 640px) {
		.admin-head {
			grid-template-columns: 1fr;
			align-items: start;
		}
		.admin-head .page-lede {
			grid-column: auto;
		}
		.back-link {
			grid-row: 1;
			justify-self: start;
			margin-bottom: 0.25rem;
		}
	}
</style>
