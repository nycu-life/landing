#!/usr/bin/env node
import path from 'node:path';
import { ghostAdmin } from './lib/ghost-admin.mjs';
import { restoreTheme } from './lib/ghost-theme-backup.mjs';

const directory = process.argv
	.find((arg) => arg.startsWith('--backup='))
	?.slice('--backup='.length);
if (!directory) throw new Error('Provide --backup=<private-backup-directory>.');
if (!process.argv.includes('--apply')) {
	console.log(
		'Would restore the backed-up theme, routes and presentation settings. Use --apply to restore.'
	);
	process.exit(0);
}
await restoreTheme(ghostAdmin(), path.resolve(directory));
console.log(
	'Restored theme, routes and presentation settings. Pages, posts and staff were preserved.'
);
