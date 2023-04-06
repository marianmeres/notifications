<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();
	export let log = [];
</script>

{#if log.length}
	<small>Event log</small>
	<small
		on:click={() => dispatch('clear')}
		style="text-decoration: underline; cursor: pointer; opacity: 75%;"
	>
		[clear]
	</small>
	<pre>{log.slice(0, 15).join('\n')}</pre>
{/if}

<style lang="scss">
	pre {
		margin: 0.5rem 0 0 0;
		max-height: 100px;
		overflow-y: scroll;
		overflow-x: hidden;
		font-size: 12px;
		width: 100%;
	}
</style>
