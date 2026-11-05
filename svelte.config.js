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
			assets: 'build',
			// Served by nginx (docker/nginx.conf) as the body of real 404/410 responses.
			fallback: '404.html'
		}),
		paths: {
			base: dev ? '' : base
		},
		prerender: {
			// The Ghost media mirrors and the dev log post route have no entries when
			// Ghost has nothing for them (or no GHOST_URL). Every other unseen route still fails.
			handleUnseenRoutes: ({ routes, message }) => {
				const optional = ['/comics/media/[...path]', '/devlog/media/[...path]', '/devlog/[slug]'];
				if (routes.every((id) => optional.includes(id))) return;
				throw new Error(message);
			}
		}
	}
};

export default config;
