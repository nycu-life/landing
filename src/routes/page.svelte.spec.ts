import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders the hero headline', async () => {
		render(Page);

		// The hero headline carries the brand name ("debug your NYCU LIFE problems").
		// Navigation lives in the burger menu (TopBar/MenuOverlay in +layout.svelte).
		const heading = page.getByRole('heading', { level: 1, name: /NYCU LIFE/i });
		await expect.element(heading).toBeInTheDocument();
	});
});
