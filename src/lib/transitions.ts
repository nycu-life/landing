import { quintOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import { prefersReducedMotion } from '$lib/components/landing/scroll';

/**
 * Liquid Glass page transitions — the incoming page rises from below while
 * the outgoing page floats up and out; both animate only transform / opacity
 * / filter (hardware-accelerated, no reflow). Ported from the 0610 prototype;
 * its cubic-bezier(.22,1,.36,1) is the standard quintOut curve.
 */

/** Incoming page — rises 24px out of glass depth, sharpening as it lands. */
export function pageIn(node: Element, { duration = 620 } = {}): TransitionConfig {
	if (prefersReducedMotion()) return { duration: 200, css: (t) => `opacity:${t}` };
	void node;
	return {
		duration,
		easing: quintOut,
		css: (t, u) => `
			transform: translate3d(0, ${24 * u}px, 0) scale(${0.985 + 0.015 * t});
			opacity: ${Math.min(1, t * 1.6)};
			filter: blur(${8 * u}px);
		`
	};
}

/** Outgoing page — floats 18px up and dissolves into depth. */
export function pageOut(node: Element, { duration = 500 } = {}): TransitionConfig {
	if (prefersReducedMotion()) return { duration: 150, css: (t) => `opacity:${t}` };
	void node;
	return {
		duration,
		easing: quintOut,
		css: (t, u) => `
			transform: translate3d(0, ${-18 * u}px, 0) scale(${0.985 + 0.015 * t});
			opacity: ${t};
			filter: blur(${8 * u}px);
		`
	};
}
