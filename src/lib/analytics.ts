import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const measurementId = env.PUBLIC_GA_ID ?? '';
let initialized = false;
let trackedEventId: string | null = null;

export function getCampaignEventId(url: URL): string | null {
	const eventId = url.searchParams.get('event')?.trim() ?? '';
	return /^[A-Za-z0-9_-]{1,100}$/.test(eventId) ? eventId : null;
}

export function initAnalytics() {
	if (!browser || !measurementId || initialized) return;
	initialized = true;

	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
	document.head.appendChild(script);

	window.dataLayer = window.dataLayer ?? [];
	window.gtag = (...args: unknown[]) => window.dataLayer.push(args);
	window.gtag('js', new Date());
	window.gtag('config', measurementId, { send_page_view: false });
}

export function trackCampaignVisit() {
	if (!browser || !measurementId || !window.gtag) return;

	const eventId = getCampaignEventId(new URL(window.location.href));
	if (eventId && eventId !== trackedEventId) {
		trackedEventId = eventId;
		window.gtag('event', 'campaign_click', { event_id: eventId });
	}
}
