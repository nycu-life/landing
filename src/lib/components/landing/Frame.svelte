<script lang="ts">
	/**
	 * Wraps a real product screenshot in a tasteful, lightweight chrome:
	 * - `browser`: a rounded card with a faux macOS-style top bar.
	 * - `phone`: a rounded phone shell with a notch.
	 * The image itself is the focus; the frame only grounds it as a real product.
	 */
	let {
		src,
		alt,
		frame = 'browser'
	} = $props<{
		src: string;
		alt: string;
		frame?: 'browser' | 'phone';
	}>();
</script>

{#if frame === 'phone'}
	<div class="frame frame-phone">
		<div class="frame-phone-notch" aria-hidden="true"></div>
		<img class="frame-phone-screen" {src} {alt} loading="lazy" decoding="async" />
	</div>
{:else}
	<figure class="frame frame-browser">
		<div class="frame-browser-bar" aria-hidden="true">
			<span class="frame-dot"></span>
			<span class="frame-dot"></span>
			<span class="frame-dot"></span>
		</div>
		<img class="frame-browser-screen" {src} {alt} loading="lazy" decoding="async" />
	</figure>
{/if}
