<script lang="ts">
	import type { NavItem } from '$lib/content/landing';

	let { items, label } = $props<{ items: NavItem[]; label: string }>();
</script>

<nav aria-label={label} class="numbered-nav">
	<ol>
		{#each items as item (item.id)}
			<li>
				<a href={`#${item.id}`}>
					<span class="numbered-nav-index">{item.index}</span>
					<span class="numbered-nav-label">{item.label()}</span>
					<span class="numbered-nav-line" aria-hidden="true"></span>
				</a>
			</li>
		{/each}
	</ol>
</nav>
