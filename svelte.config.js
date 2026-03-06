import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');
const base = process.env.SITE_BASE_PATH ?? '';

if (base !== '' && !base.startsWith('/')) {
	throw new Error('SITE_BASE_PATH must be empty or start with "/".');
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build'
		}),
		paths: {
			base: dev ? '' : base
		}
	}
};

export default config;
