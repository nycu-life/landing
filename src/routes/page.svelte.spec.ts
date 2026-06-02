import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders the hero headline and the four destination cards', async () => {
		render(Page);

		// The hero headline carries the brand name ("debug your NYCU LIFE problems").
		const heading = page.getByRole('heading', { level: 1, name: /NYCU LIFE/i });
		// Each burger destination is reachable as a card link from the home page.
		// (The TopBar / banner now lives in +layout.svelte, not this page.)
		const productsLink = page.getByRole('link', { name: /所有產品|All products/i });
		const aboutLink = page.getByRole('link', { name: /認識我們|About us/i });

		await expect.element(heading).toBeInTheDocument();
		await expect.element(productsLink.first()).toBeInTheDocument();
		await expect.element(aboutLink.first()).toBeInTheDocument();
	});
});
