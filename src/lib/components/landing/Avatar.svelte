<script lang="ts">
	import { base } from '$app/paths';
	import { browser } from '$app/environment';

	let {
		name,
		slug,
		photo,
		size = 'md'
	}: { name: string; slug: string; photo?: string; size?: 'md' | 'lg' } = $props();

	const initial = $derived([...name][0] ?? '·');

	// A photo dropped at static/team/<slug>.jpg shows automatically; an explicit
	// `photo` (repo path or full URL) overrides it. The image is probed on the
	// CLIENT only so prerender never links to a not-yet-uploaded file (it just
	// emits the initials avatar); when the photo loads we swap it in.
	// Only probe files that are actually part of this static build. Missing
	// optional avatars should render initials without generating noisy 404s.
	const candidate = $derived(
		photo?.startsWith('http')
			? photo
			: photo
				? base + photo
				: slug === 'jacoblin'
					? `${base}/team/${slug}.jpg`
					: ''
	);
	let resolved = $state('');

	$effect(() => {
		resolved = '';
		if (!browser || !candidate) return;
		const img = new Image();
		img.onload = () => (resolved = candidate);
		img.src = candidate;
	});
</script>

{#if resolved}
	<img class="avatar avatar-{size}" src={resolved} alt={name} />
{:else}
	<span class="avatar avatar-{size} avatar-fallback" aria-hidden="true">{initial}</span>
{/if}

<style>
	.avatar {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border-radius: 9999px;
		object-fit: cover;
		background: color-mix(in srgb, var(--brand) 12%, white);
		color: var(--brand);
		font-weight: 700;
		overflow: hidden;
	}
	.avatar-md {
		width: 2.75rem;
		height: 2.75rem;
		font-size: 1.05rem;
	}
	.avatar-lg {
		width: 6.5rem;
		height: 6.5rem;
		font-size: 2.4rem;
	}
	.avatar-fallback {
		user-select: none;
	}
</style>
