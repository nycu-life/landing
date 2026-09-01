import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';

const measurementId = env.PUBLIC_GA_ID ?? '';
let initialized = false;
let trackedEventId: string | null = null;
let trackedPagePath: string | null = null;

export function getCampaignEventId(url: URL): string | null {
	const eventId = url.searchParams.get('event')?.trim() ?? '';
	return /^[A-Za-z0-9_-]{1,100}$/.test(eventId) ? eventId : null;
}

export function getPageViewPath(url: URL): string {
	return `${url.pathname}${url.search}`;
}

export function getJoinFormClickParams(source: string, linkUrl: string, language: string) {
	return {
		link_url: linkUrl,
		link_domain: new URL(linkUrl).hostname,
		link_id: 'join_form',
		link_source: source,
		language
	};
}

export function getAppDownloadClickParams(
	platform: 'android' | 'ios',
	source: string,
	linkUrl: string,
	language: string
) {
	return {
		platform,
		link_url: linkUrl,
		link_domain: new URL(linkUrl).hostname,
		link_source: source,
		language
	};
}

function trackMarkedLinkClick(event: MouseEvent) {
	const eventTarget = event.target;
	if (!(eventTarget instanceof Element) || !window.gtag) return;

	const link = eventTarget.closest<HTMLAnchorElement>('a[data-analytics-event]');
	if (!link) return;

	if (link.dataset.analyticsEvent === 'join_form_click') {
		window.gtag(
			'event',
			'join_form_click',
			getJoinFormClickParams(
				link.dataset.analyticsSource ?? 'unknown',
				link.href,
				document.documentElement.lang
			)
		);
	} else if (link.dataset.analyticsEvent === 'app_download_click') {
		const platform = link.dataset.analyticsPlatform;
		if (platform !== 'android' && platform !== 'ios') return;
		window.gtag(
			'event',
			'app_download_click',
			getAppDownloadClickParams(
				platform,
				link.dataset.analyticsSource ?? 'unknown',
				link.href,
				document.documentElement.lang
			)
		);
	}
}

export function initAnalytics() {
	if (!browser || !measurementId || initialized) return;
	initialized = true;

	const script = document.createElement('script');
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
	document.head.appendChild(script);

	window.dataLayer = window.dataLayer ?? [];
	window.gtag = function () {
		// Google Tag consumes the native Arguments object used by its canonical snippet.
		// Converting commands to Arrays leaves them visible in dataLayer but sends no beacons.
		// eslint-disable-next-line prefer-rest-params
		window.dataLayer.push(arguments);
	};
	window.gtag('js', new Date());
	window.gtag('config', measurementId, { send_page_view: false });
	document.addEventListener('click', trackMarkedLinkClick, { capture: true });
}

export function trackPageView() {
	if (!browser || !measurementId || !window.gtag) return;

	const url = new URL(window.location.href);
	const pagePath = getPageViewPath(url);
	if (pagePath === trackedPagePath) return;
	trackedPagePath = pagePath;

	window.gtag('event', 'page_view', {
		page_location: `${url.origin}${pagePath}`,
		page_path: pagePath,
		page_title: document.title
	});
}

export function trackCampaignVisit() {
	if (!browser || !measurementId || !window.gtag) return;

	const eventId = getCampaignEventId(new URL(window.location.href));
	if (eventId && eventId !== trackedEventId) {
		trackedEventId = eventId;
		window.gtag('event', 'campaign_click', { event_id: eventId });
	}
}
