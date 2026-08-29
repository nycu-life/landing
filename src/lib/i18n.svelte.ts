import { browser } from '$app/environment';
import {
	baseLocale,
	getLocale,
	locales,
	overwriteGetLocale,
	setLocale as persistLocale
} from '$lib/paraglide/runtime';

export type AppLocale = (typeof locales)[number];

let clientLocale = $state<AppLocale>(baseLocale);

if (browser) {
	clientLocale = getLocale();
	// Paraglide message functions call getLocale() when they render. Pointing that
	// lookup at a Svelte state makes every rendered message update in place instead
	// of requiring Paraglide's default full-page reload.
	overwriteGetLocale(() => clientLocale);
}

export const localeState = {
	get current(): AppLocale {
		// On the server, keep using Paraglide's request-local locale. Production is
		// static, but this also keeps dev SSR isolated between requests.
		return browser ? clientLocale : getLocale();
	},
	set(nextLocale: AppLocale) {
		if (!browser || nextLocale === clientLocale) return;
		persistLocale(nextLocale, { reload: false });
		clientLocale = nextLocale;
	}
};
