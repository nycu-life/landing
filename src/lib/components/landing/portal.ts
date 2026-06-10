import type { Action } from 'svelte/action';

/**
 * Re-parents the node to <body>. Fixed-position overlays rendered inside a
 * page layer would otherwise be positioned and clipped by the layer while
 * its enter/leave transition animates transform/filter (a transformed
 * ancestor becomes the containing block for fixed descendants).
 */
export const portal: Action<HTMLElement> = (node) => {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
};
