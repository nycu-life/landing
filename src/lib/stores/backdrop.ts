import { writable } from 'svelte/store';

/**
 * Backdrop override for the desktop storytelling page: the home route keeps
 * the light NEAT palette over its hero, then flips to the vivid content
 * palette as the reader scrolls into the chapters. Pages outside `/` never
 * touch this — the layout already maps non-home routes to the vivid palette.
 */
export const vividOverride = writable(false);
