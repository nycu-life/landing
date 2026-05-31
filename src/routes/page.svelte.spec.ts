import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders the hero, header nav, and section headings', async () => {
		render(Page);

		// The hero headline carries the brand name.
		const heading = page.getByRole('heading', { level: 1, name: /NYCU LIFE/i });
		// The header nav exposes a products entry inside the banner.
		const productsNavLink = page.getByRole('banner').getByRole('link', { name: /產品|products/i });
		// Each major section renders a level-2 heading.
		const sectionHeadings = page.getByRole('heading', { level: 2 });

		await expect.element(heading).toBeInTheDocument();
		await expect.element(productsNavLink.first()).toBeVisible();
		await expect.element(sectionHeadings.first()).toBeInTheDocument();
	});
});
