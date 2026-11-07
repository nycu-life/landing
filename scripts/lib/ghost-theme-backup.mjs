import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** Restore only backed-up theme, routes and presentation settings. */
export async function restoreTheme(admin, directory) {
	const settings = JSON.parse(await readFile(path.join(directory, 'settings.json'), 'utf8'));
	const active = settings.find((s) => s.key === 'active_theme')?.value;
	if (!active || !/^[a-z0-9_-]+$/i.test(active)) throw new Error('Invalid backed-up theme name.');
	const theme = new FormData();
	theme.set(
		'file',
		new Blob([await readFile(path.join(directory, 'theme.zip'))], { type: 'application/zip' }),
		`${active}.zip`
	);
	await admin('themes/upload/', { method: 'POST', body: theme });
	const routes = new FormData();
	routes.set(
		'routes',
		new Blob([await readFile(path.join(directory, 'routes.yaml'))], { type: 'text/yaml' }),
		'routes.yaml'
	);
	await admin('settings/routes/yaml/', { method: 'POST', body: routes });
	await admin('settings/', {
		method: 'PUT',
		json: { settings: settings.filter((s) => s.key !== 'active_theme') }
	});
	await admin(`themes/${active}/activate/`, { method: 'PUT' });
}
