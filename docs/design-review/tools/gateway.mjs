// Review gateway that mirrors the production Traefik split on one local origin:
//   /api/wishes → Wish API; Ghost asset, image and sitemap paths → Ghost; the rest → Node.
//   PORT=18291 NODE_URL=http://127.0.0.1:14191 GHOST_URL=http://127.0.0.1:2379 \
//   WISH_URL=http://127.0.0.1:13011 node gateway.mjs
import http from 'node:http';

const port = Number(process.env.PORT ?? 18291);
const upstream = {
	node: new URL(process.env.NODE_URL ?? 'http://127.0.0.1:14191'),
	ghost: new URL(process.env.GHOST_URL ?? 'http://127.0.0.1:2379'),
	wish: new URL(process.env.WISH_URL ?? 'http://127.0.0.1:13011')
};
const ghostPaths = /^\/(assets|content|public|members)\/|^\/favicon\.ico$|^\/sitemap[\w-]*\.xml$/;

http
	.createServer((req, res) => {
		const pathname = new URL(req.url, 'http://x').pathname;
		const target =
			pathname === '/api/wishes' || pathname.startsWith('/api/wishes/')
				? upstream.wish
				: ghostPaths.test(pathname)
					? upstream.ghost
					: upstream.node;
		const proxied = http.request(
			{
				host: target.hostname,
				port: target.port,
				method: req.method,
				path: req.url,
				headers: {
					...req.headers,
					'x-forwarded-host': req.headers.host,
					'x-forwarded-proto': 'http',
					'x-forwarded-for': req.socket.remoteAddress
				}
			},
			(upstreamRes) => {
				res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
				upstreamRes.pipe(res);
			}
		);
		proxied.on('error', () => {
			if (!res.headersSent) res.writeHead(502);
			res.end('bad gateway');
		});
		req.pipe(proxied);
	})
	.listen(port, '127.0.0.1', () => console.log(`gateway :${port}`));
