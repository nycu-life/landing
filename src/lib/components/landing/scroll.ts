import type { Action } from 'svelte/action';

const prefersReducedMotion = () =>
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

/**
 * Drives a "scroll-zoom" effect: as the element travels through the viewport
 * its progress (0 → 1 → 0) is written to the `--zoom` custom property, which
 * CSS turns into a scale/opacity transform. Falls back to a settled state when
 * the user prefers reduced motion.
 *
 * @example
 * <div use:scrollZoom class="service-stage">...</div>
 */
export const scrollZoom: Action<HTMLElement> = (node) => {
	if (prefersReducedMotion()) {
		node.style.setProperty('--zoom', '1');
		return;
	}

	let frame = 0;

	const update = () => {
		frame = 0;
		const rect = node.getBoundingClientRect();
		const viewport = window.innerHeight || 1;
		// 0 when the element is entering at the bottom edge, 1 when centered,
		// back toward 0 as it leaves through the top.
		const center = rect.top + rect.height / 2;
		const distance = Math.abs(center - viewport / 2);
		const span = viewport / 2 + rect.height / 2;
		const progress = Math.max(0, Math.min(1, 1 - distance / span));
		node.style.setProperty('--zoom', progress.toFixed(4));
	};

	const onScroll = () => {
		if (frame) return;
		frame = requestAnimationFrame(update);
	};

	update();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });

	return {
		destroy() {
			if (frame) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		}
	};
};
