<script>
	export let centered = false;
</script>

<div class="block" class:centered>
	<slot />
</div>

<style lang="scss">
	.block {
		margin: 0 0 1rem 0;
		background: #e7e5e4;
		padding: 1rem;
		border-radius: 5px;
		&.centered {
			text-align: center;
		}
	}
</style>
