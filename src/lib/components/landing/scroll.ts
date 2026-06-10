import type { Action } from 'svelte/action';

export const prefersReducedMotion = () =>
	typeof window !== 'undefined' &&
	window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/**
 * Reveals an element once it scrolls into view by toggling the
 * `data-revealed` attribute. CSS handles the actual transition, and the
 * reveal is skipped entirely when the user prefers reduced motion.
 *
 * @example
 * <div use:reveal={{ delay: 80 }} class="reveal">...</div>
 */
export const reveal: Action<HTMLElement, { delay?: number } | undefined> = (node, params) => {
	if (prefersReducedMotion()) {
		node.setAttribute('data-revealed', 'true');
		return;
	}

	const delay = params?.delay ?? 0;
	if (delay) node.style.setProperty('--reveal-delay', `${delay}ms`);

	const observer = new IntersectionObserver(
		(entries, obs) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.setAttribute('data-revealed', 'true');
					obs.unobserve(entry.target);
				}
			}
		},
		{ threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
