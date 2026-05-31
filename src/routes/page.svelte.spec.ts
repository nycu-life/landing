import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders the editorial hero, numbered nav, and section headings', async () => {
		render(Page);

		// The hero headline carries the brand name in its first display line.
		const heading = page.getByRole('heading', { level: 1, name: /NYCU LIFE/i });
		// The numbered menu nav exposes a services entry inside the banner.
		const servicesNavLink = page
			.getByRole('banner')
			.getByRole('link', { name: /服務項目|services/i });
		// Each major section renders a level-2 heading.
		const sectionHeadings = page.getByRole('heading', { level: 2 });

		await expect.element(heading).toBeInTheDocument();
		await expect.element(servicesNavLink.first()).toBeVisible();
		await expect.element(sectionHeadings.first()).toBeInTheDocument();
	});
});
