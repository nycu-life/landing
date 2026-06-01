import { base } from '$app/paths';

/**
 * Resolve an app asset path against the configured base path.
 *
 * Static assets are authored as root-absolute paths (e.g. `/products/bus.png`).
 * When the site is served under a sub-path (the GitHub Pages build sets
 * `SITE_BASE_PATH=/landing`), those paths must be prefixed with `base` or the
 * prerenderer rejects them in strict mode. External URLs are returned as-is.
 */
export const withBase = (src: string): string =>
	/^https?:\/\//.test(src) ? src : base + src;
