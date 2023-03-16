<script>
	export let tooltip = undefined;
	export let label = undefined;
	export let style = '';
</script>

<button on:click data-tooltip={tooltip} aria-label={label} {style}>
	<slot />
</button>

<style lang="scss">
	button {
		border: 1px solid rgba(0, 0, 0, 0.5);
		border-radius: 5px;
		background: #fed7aa;
		font-size: 0.9rem;
	}
</style>
