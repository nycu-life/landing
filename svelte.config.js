import adapter from '@sveltejs/adapter-node';

const dev = process.argv.includes('dev');
const base = process.env.SITE_BASE_PATH ?? '';

if (base !== '' && !base.startsWith('/')) {
	throw new Error('SITE_BASE_PATH must be empty or start with "/".');
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		paths: {
			base: dev ? '' : base,
			relative: false
		}
	}
};

export default config;
