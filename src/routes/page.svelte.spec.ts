import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('renders the student-facing hero and service navigation', async () => {
		render(Page);

		const heading = page.getByRole('heading', {
			level: 1,
			name: /關於 nycu\.life 計畫/i
		});
		const primaryCta = page.getByRole('link', { name: /查看計畫內容/i });
		const serviceNav = page.getByRole('banner').getByRole('link', { name: /^團隊分工$/i });
		const journeysHeading = page.getByRole('heading', {
			level: 2,
			name: /打破資訊分散，打造整合式數位校園生活平台/i
		});

		await expect.element(heading).toBeInTheDocument();
		await expect.element(primaryCta).toBeVisible();
		await expect.element(serviceNav).toBeVisible();
		await expect.element(journeysHeading).toBeVisible();
	});
});
