import { parseFragment, serializeOuter } from 'parse5';

const text = (node) => node.value ?? node.childNodes?.map(text).join('') ?? '';

/** Split the previous migration's About HTML without rewriting editor paragraphs or media. */
export function aboutSections(page, locale, origin) {
	const nodes = parseFragment(page.html ?? '').childNodes.filter(
		(n) => n.nodeName !== '#text' || text(n).trim()
	);
	const groups = [];
	let current = { kind: 'lede', nodes: [] };
	groups.push(current);
	for (const [nodeIndex, node] of nodes.entries()) {
		if (node.tagName === 'h2' || node.tagName === 'h3') {
			if (
				node.tagName === 'h2' &&
				(node.attrs.some((a) => a.name === 'id' && a.value === 'milestones') ||
					nodes[nodeIndex + 1]?.tagName === 'h3')
			) {
				current = { kind: 'milestone-heading', nodes: [] };
			} else if (node.tagName === 'h2') {
				current = { kind: 'vision', title: text(node), nodes: [] };
			} else {
				const heading = text(node);
				const separator = heading.indexOf(' — ');
				if (separator < 1)
					throw new Error(`Unrecognized milestone structure on ${page.slug}; no changes made.`);
				current = {
					kind: 'milestone',
					date: heading.slice(0, separator),
					title: heading.slice(separator + 3),
					nodes: []
				};
			}
			groups.push(current);
		} else current.nodes.push(node);
	}
	const visions = groups.filter((g) => g.kind === 'vision');
	const milestones = groups.filter((g) => g.kind === 'milestone');
	if (
		!visions.length ||
		!milestones.length ||
		groups.some((g) => g.kind === 'milestone-heading' && g.nodes.length)
	)
		throw new Error(`Unrecognized About structure on ${page.slug}; no changes made.`);
	const prefix = locale === 'en' ? '/en' : '';
	const counts = { vision: 0, milestone: 0 };
	return groups
		.filter((g) => g.kind !== 'milestone-heading')
		.map((group) => {
			const index = group.kind === 'lede' ? 0 : counts[group.kind]++;
			const html = group.nodes.map(serializeOuter).join('');
			if (!html) throw new Error(`Empty ${group.kind} section on ${page.slug}; no changes made.`);
			const image = group.nodes
				.find((n) => n.tagName === 'figure')
				?.childNodes.find((n) => n.tagName === 'img');
			return {
				slug: `theme-${locale}-${group.kind === 'lede' ? 'about-lede' : `${group.kind}-${index + 1}`}`,
				title: group.title || page.title,
				html,
				...(group.date ? { custom_excerpt: group.date } : {}),
				...(image ? { feature_image: image.attrs.find((a) => a.name === 'src')?.value } : {}),
				canonical_url: `${origin}${prefix}/about/`,
				tags: [{ name: `#theme-${group.kind}-${locale}` }],
				published_at: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString()
			};
		});
}
