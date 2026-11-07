import { defineConfig } from '@playwright/test';

export default defineConfig({
	...(process.env.GHOST_THEME_TEST_URL
		? { use: { baseURL: process.env.GHOST_THEME_TEST_URL } }
		: {
				webServer: { command: 'npm run build && HOST=127.0.0.1 PORT=4173 node build', port: 4173 }
			}),
	testDir: 'e2e'
});
