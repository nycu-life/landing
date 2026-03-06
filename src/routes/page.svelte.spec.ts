import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders the student-facing hero and service navigation', async () => {
		render(Page);

		const heading = page.getByRole('heading', {
			level: 1,
			name: /one front door for transit, courses, and places at nycu/i
		});
		const primaryCta = page.getByRole('link', { name: /see the three pillars/i });
		const serviceNav = page.getByRole('banner').getByRole('link', { name: /^services$/i });
		const journeysHeading = page.getByRole('heading', {
			level: 2,
			name: /campus life feels better when the next step is obvious/i
		});

		await expect.element(heading).toBeInTheDocument();
		await expect.element(primaryCta).toBeVisible();
		await expect.element(serviceNav).toBeVisible();
		await expect.element(journeysHeading).toBeVisible();
	});
});
