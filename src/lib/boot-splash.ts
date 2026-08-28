/**
 * Dismisses the pre-hydration boot splash rendered in app.html. Safe to call repeatedly.
 * The home story calls it once the hero artwork has decoded; the layout calls it as a
 * fallback (subpages immediately, home after a timeout) so it can never get stuck.
 */
export const dismissBootSplash = () => {
	if (typeof document === 'undefined') return;
	const splash = document.getElementById('boot-splash');
	if (!splash || splash.classList.contains('done')) return;
	splash.classList.add('done');
	const remove = () => splash.remove();
	splash.addEventListener('transitionend', remove, { once: true });
	setTimeout(remove, 600);
};
