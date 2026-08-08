<script lang="ts">
	import { base } from '$app/paths';

	let { size = 30, light = false }: { size?: number; light?: boolean } = $props();
	const logoSrc = $derived(`${base}/brand/${light ? 'logo.svg' : 'logo-white.svg'}`);
</script>

<div
	class="foxmark glass glass-strong glass-glow"
	class:light
	style="width:{size}px;height:{size}px;"
>
	<img src={logoSrc} alt="" class="foxmark-img" />
</div>

<style>
	.foxmark {
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.foxmark-img {
		width: 68%;
		height: 68%;
		object-fit: contain;
	}
	.foxmark.light {
		background: #fff;
		border-color: rgba(20, 30, 60, 0.06);
		box-shadow:
			0 4px 14px rgba(20, 30, 60, 0.14),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
	}
</style>
