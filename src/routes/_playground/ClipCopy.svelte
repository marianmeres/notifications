<script>
	import { fade } from 'svelte/transition';
	import Button from './Button.svelte';

	export let outputRef;

	let isCopied = false;
</script>

<Button
	on:click={async () => {
		await navigator.clipboard.writeText(outputRef.innerText);
		isCopied = true;
		setTimeout(() => (isCopied = false), 2000);
	}}
>
	Copy code output to clipboard
</Button>

{#if isCopied}
	<small
		transition:fade|global
		style="display: inline-block; padding-left: .5rem; opacity: 75%;"
	>
		✓ Copied
	</small>
{/if}
