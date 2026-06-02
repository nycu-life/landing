<script lang="ts">
	// Brand mark — a glass disc holding the accent-gradient fox glyph.
	let { size = 30 }: { size?: number } = $props();

	// Unique gradient id per instance so multiple marks can coexist.
	const gid = $props.id();
</script>

<div class="foxmark glass glass-strong glass-glow" style="width:{size}px;height:{size}px;">
	<svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" fill="none" aria-hidden="true">
		<defs>
			<linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#8B6BFF" />
				<stop offset="1" stop-color="#38C6F4" />
			</linearGradient>
		</defs>
		<path d="M7 8 L11 4 L13 12 Z M25 8 L21 4 L19 12 Z" fill="url(#{gid})" />
		<path
			d="M16 7 C22 7 26 11 26 16 C26 22 22 26 16 26 C10 26 6 22 6 16 C6 11 10 7 16 7 Z"
			fill="url(#{gid})"
		/>
		<circle cx="12.5" cy="17" r="1.2" fill="var(--base)" />
		<circle cx="19.5" cy="17" r="1.2" fill="var(--base)" />
		<path d="M16 19 L14.5 21 L17.5 21 Z" fill="var(--base)" />
	</svg>
</div>

<style>
	.foxmark {
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
</style>
