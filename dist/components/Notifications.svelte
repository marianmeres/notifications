<script>
	// the store created by createNotificationsStore()
	export let notifications;

	export let wrapClass = '';
	export let wrapCss = '';

	export let notifClass = '';
	export let notifCss = '';

	export let closeLabel = 'Discard';

	// use "default" for working theme out-of-the-box
	export let theme = '';
</script>

<!-- Global notification live region, render this permanently at the end of the document -->
<div
	class="notifications-wrap {theme} {wrapClass}"
	style={wrapCss}
	aria-live="assertive"
	aria-atomic="true"
>
	<div>
		{#if $notifications.length}
			{#each $notifications as n}
				<!-- preferred option - use your own component -->
				{#if n?.render?.component}
					<svelte:component
						this={n.render.component}
						{...n.render.props || {}}
						notification={n}
					/>
				{:else}
					<!-- bare minimum -->
					<div
						class="notification {notifClass}"
						style={notifCss}
						data-notification-type={n.type}
						role="alert"
						on:mouseover={() => notifications.event(n.id, 'mouseover')}
						on:click={() => notifications.event(n.id, 'click')}
					>
						<div class="notification-content">
							{#if n.html}
								{@html n.html}
							{:else}
								{n.text}
							{/if}
						</div>
						<div class="notification-control">
							<button
								class="notification-button"
								aria-label={closeLabel}
								on:click|preventDefault|stopPropagation={() => notifications.remove(n.id)}
							>
								<!-- Copyright: https://icons.getbootstrap.com/icons/x/ -->
								<svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
									<path
										d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
									/>
								</svg>
							</button>
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<style>
	.notifications-wrap.default {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		pointer-events: none;
		padding: 1rem;
		display: flex;
		align-items: flex-start;
	}

	.notifications-wrap.default > div {
		display: flex;
		flex-direction: column;
		width: 100%;
		align-items: flex-end;
	}

	.notifications-wrap.default > div > * + * {
		margin-top: 1rem;
	}

	.notifications-wrap.default .notification {
		pointer-events: auto;
		background: white;
		width: 100%;
		max-width: 400px;
		overflow: hidden;
		display: flex;
		max-height: 300px;
		border-radius: 5px;
	}

	.notifications-wrap.default .notification .notification-content,
	.notifications-wrap.default .notification .notification-control {
		background: rgba(0, 0, 0, 0.05);
	}

	.notifications-wrap.default
		.notification[data-notification-type='success']
		.notification-content,
	.notifications-wrap.default
		.notification[data-notification-type='success']
		.notification-control {
		background: rgba(0, 255, 0, 0.1);
	}

	.notifications-wrap.default
		.notification[data-notification-type='error']
		.notification-content,
	.notifications-wrap.default
		.notification[data-notification-type='error']
		.notification-control {
		background: rgba(255, 0, 0, 0.1);
	}

	.notifications-wrap.default
		.notification[data-notification-type='warn']
		.notification-content,
	.notifications-wrap.default
		.notification[data-notification-type='warn']
		.notification-control {
		background: rgba(255, 255, 50, 0.1);
	}

	.notifications-wrap.default .notification .notification-content {
		flex: 1;
		padding: 1rem;
		font-size: 0.9rem;
	}

	.notifications-wrap.default .notification .notification-control {
		display: flex;
		flex-direction: column;
	}
	.notifications-wrap.default .notification .notification-control button {
		flex: 1;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;
		padding: 0.5rem;
		border: 0;
		margin: 0;
		line-height: 1;
		cursor: pointer;
		background: rgba(0, 0, 0, 0.05);
	}
	.notifications-wrap.default .notification .notification-control button:hover,
	.notifications-wrap.default .notification .notification-control button:focus {
		background: rgba(0, 0, 0, 0.1);
	}

	@media only screen and (max-width: 640px) {
		.notifications-wrap.default {
			align-items: flex-end;
		}
		.notifications-wrap.default > div {
			align-items: center;
		}
	}
</style>
