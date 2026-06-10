import type { Action } from 'svelte/action';
import { prefersReducedMotion } from './scroll';

/**
 * Attach to a scroll container. Finds child cards marked `[data-flow-card]`
 * and toggles `data-focus` on whichever sits nearest the container's vertical
 * center — CSS (`.nl-flow`) then paints the travelling rim-light. In a
 * multi-column grid the centered ROW may hold several cards; they take turns
 * row by row (left, right, left …) as you scroll, so the flowing light
 * alternates between columns. Ported from the 0610 prototype.
 *
 * @example
 * <div use:centerFocus> … <article class="nl-flow" data-flow-card> … </div>
 */
export const centerFocus: Action<HTMLElement> = (el) => {
	if (prefersReducedMotion()) return;

	// The action may sit on the scroll container itself or on content inside
	// one (e.g. the layout's .page-layer) — bind to whichever actually scrolls.
	let scroller: HTMLElement = el;
	for (let n: HTMLElement | null = el; n; n = n.parentElement) {
		const o = getComputedStyle(n).overflowY;
		if (o === 'auto' || o === 'scroll') {
			scroller = n;
			break;
		}
	}

	let raf = 0;

	const update = () => {
		raf = 0;
		const cards = [...el.querySelectorAll<HTMLElement>('[data-flow-card]')];
		if (!cards.length) return;
		const box = scroller.getBoundingClientRect();
		const center = box.top + box.height / 2;

		// measure each card's vertical + horizontal center
		const meas = cards.map((c) => {
			const r = c.getBoundingClientRect();
			return { c, cy: r.top + r.height / 2, cx: r.left + r.width / 2, h: r.height };
		});

		// group into rows by similar vertical center
		const sorted = [...meas].sort((a, b) => a.cy - b.cy);
		const rows: { cy: number; items: typeof meas }[] = [];
		for (const m of sorted) {
			const row = rows[rows.length - 1];
			if (row && Math.abs(m.cy - row.cy) < m.h * 0.6) {
				row.items.push(m);
				row.cy = (row.cy * (row.items.length - 1) + m.cy) / row.items.length;
			} else {
				rows.push({ cy: m.cy, items: [m] });
			}
		}

		// which row is nearest the viewport center?
		let bestRow = -1;
		let bestD = Infinity;
		rows.forEach((row, i) => {
			const d = Math.abs(row.cy - center);
			if (d < bestD) {
				bestD = d;
				bestRow = i;
			}
		});

		const within = bestD < box.height * 0.32;
		let chosen: HTMLElement | null = null;
		if (within && bestRow >= 0) {
			const row = rows[bestRow];
			const ordered = [...row.items].sort((a, b) => a.cx - b.cx); // left → right
			// alternate the lit column by row index → left/right take turns
			chosen = ordered[bestRow % ordered.length].c;
		}
		for (const c of cards) c.setAttribute('data-focus', c === chosen ? 'true' : 'false');
	};

	const onScroll = () => {
		if (!raf) raf = requestAnimationFrame(update);
	};

	scroller.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);
	// in-page layout changes (cards expanding/collapsing) shift every card
	// below — re-measure whenever the content's size settles.
	const ro = new ResizeObserver(onScroll);
	ro.observe(el);
	for (const c of el.querySelectorAll<HTMLElement>('[data-flow-card]')) ro.observe(c);
	// settle after entrance transitions / layout
	const t1 = setTimeout(update, 80);
	const t2 = setTimeout(update, 500);
	update();

	return {
		destroy() {
			scroller.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			ro.disconnect();
			cancelAnimationFrame(raf);
			clearTimeout(t1);
			clearTimeout(t2);
		}
	};
};
