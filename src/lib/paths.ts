import { base } from '$app/paths';

/**
 * Resolve an app asset path against the configured base path.
 *
 * Static assets are authored as root-absolute paths (e.g. `/products/bus.png`).
 * When an optional preview serves the site under a sub-path, those paths must
 * be prefixed with `base` or the prerenderer rejects them in strict mode.
 * External URLs are returned as-is.
 */
export const withBase = (src: string): string => (/^https?:\/\//.test(src) ? src : base + src);
