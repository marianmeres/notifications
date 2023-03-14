<script>
	export let notifications;
	export let notification;
</script>

<div
	class="notif"
	on:click={() => notifications.remove(notification.id)}
>
	<p>
		This is a regular notification rendered via a custom component.
		If you have specified non-zero <code>ttl</code>, it will auto dispose normally.
	</p>
	<p>
		You can click anywhere here to remove it manually.
	</p>
	<pre>{JSON.stringify(notification, null, 2)}</pre>
</div>

<style lang="scss">
	.notif {
		pointer-events: auto; // important!
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background: maroon;
		color: white;
		padding: 1rem;
		font-family: var(--bs-font-monospace);
	}
	code {
		color: white;
	}
	pre {
		margin-top: 1rem;
	}
</style>
