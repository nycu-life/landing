<script lang="ts">
	// Full-bleed animated gradient mesh — the signature Liquid Glass backdrop.
	// Fixed to the viewport so it sits behind everything and never seams between
	// sections. Each page picks a `tint` to shift the palette for variety.
	export type AuroraTint = 'violet' | 'cyan' | 'magenta' | 'blue';

	let { tint = 'violet', light = false }: { tint?: AuroraTint; light?: boolean } = $props();

	const tints: Record<AuroraTint, [string, string, string]> = {
		violet: ['rgba(140,108,255,0.70)', 'rgba(45,220,245,0.52)', 'rgba(92,118,255,0.58)'],
		cyan: ['rgba(45,220,245,0.64)', 'rgba(140,108,255,0.52)', 'rgba(60,150,255,0.56)'],
		magenta: ['rgba(190,108,255,0.64)', 'rgba(45,220,245,0.46)', 'rgba(140,108,255,0.60)'],
		blue: ['rgba(92,118,255,0.70)', 'rgba(140,108,255,0.48)', 'rgba(45,220,245,0.48)']
	};

	const blobs = $derived.by(() => {
		const [a, b, c] = tints[tint] ?? tints.violet;
		return [a, b, c];
	});
</script>

<div class="aurora" class:light aria-hidden="true">
	<div
		class="nl-blob aurora-a"
		style="background: radial-gradient(circle at 50% 50%, {blobs[0]} 0%, transparent 66%)"
	></div>
	<div
		class="nl-blob aurora-b"
		style="background: radial-gradient(circle at 50% 50%, {blobs[1]} 0%, transparent 66%)"
	></div>
	<div
		class="nl-blob aurora-c"
		style="background: radial-gradient(circle at 50% 50%, {blobs[2]} 0%, transparent 64%)"
	></div>
	<div class="aurora-sheen"></div>
	<div class="aurora-grain"></div>
</div>

<style>
	.aurora {
		position: fixed;
		inset: 0;
		overflow: hidden;
		background: var(--base);
		z-index: 0;
		pointer-events: none;
	}
	.aurora.light {
		background: #f4f6fb;
	}
	.aurora.light .nl-blob {
		opacity: 0.26;
		filter: blur(58px);
	}
	.aurora.light .aurora-sheen {
		background:
			radial-gradient(120% 70% at 50% -8%, rgba(255, 255, 255, 0.48) 0%, transparent 52%),
			linear-gradient(180deg, rgba(237, 240, 245, 0.3), rgba(237, 240, 245, 0.58));
	}
	.aurora.light .aurora-grain {
		opacity: 0.02;
		mix-blend-mode: multiply;
	}

	.aurora-a {
		width: 460px;
		height: 460px;
		top: -14%;
		left: -22%;
		animation-duration: 26s;
	}
	.aurora-b {
		width: 420px;
		height: 420px;
		top: 24%;
		right: -26%;
		animation-duration: 32s;
		animation-delay: -8s;
	}
	.aurora-c {
		width: 520px;
		height: 520px;
		bottom: -26%;
		left: 8%;
		animation-duration: 38s;
		animation-delay: -16s;
	}

	/* On wider screens, spread the blobs out so they fill the canvas. */
	@media (min-width: 768px) {
		.aurora-a {
			width: 720px;
			height: 720px;
			left: -12%;
		}
		.aurora-b {
			width: 680px;
			height: 680px;
			right: -16%;
		}
		.aurora-c {
			width: 820px;
			height: 820px;
			left: 22%;
		}
	}

	.aurora-sheen {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(130% 80% at 50% -10%, rgba(255, 255, 255, 0.08) 0%, transparent 48%),
			linear-gradient(180deg, transparent 60%, rgba(8, 11, 34, 0.4) 100%);
	}

	.aurora-grain {
		position: absolute;
		inset: 0;
		opacity: 0.045;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
		background-size: 140px 140px;
	}
</style>
