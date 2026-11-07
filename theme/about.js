const milestoneSection = document.querySelector('.milestone-section');
if (milestoneSection) {
	const track = milestoneSection.querySelector('.milestone-track');
	const items = [...track.querySelectorAll('.milestone')];
	track.classList.toggle('extended', items.length > 5);
	const nodes = items.map((item, index) => {
		const x = items.length === 1 ? 500 : 40 + (920 / (items.length - 1)) * index;
		const y = index % 2 === 0 ? 350 : 170;
		item.style.setProperty('--x', `${x / 10}%`);
		item.style.setProperty('--y', `${(y / 520) * 100}%`);
		item.style.setProperty('--order', index);
		item.classList.toggle('above', index % 2 === 1);
		return { x, y };
	});
	const d = nodes
		.map((node, index) => {
			if (!index) return `M${node.x},${node.y}`;
			const prev = nodes[index - 1],
				mid = (prev.x + node.x) / 2;
			return `C${mid},${prev.y} ${mid},${node.y} ${node.x},${node.y}`;
		})
		.join(' ');
	track.querySelectorAll('path').forEach((path) => path.setAttribute('d', d));
	milestoneSection.classList.add('milestones-enhanced');
	const observer = new IntersectionObserver(
		(entries) => {
			if (entries.some((entry) => entry.isIntersecting)) {
				milestoneSection.classList.add('drawn');
				observer.disconnect();
			}
		},
		{ threshold: 0.25 }
	);
	observer.observe(milestoneSection);
}
