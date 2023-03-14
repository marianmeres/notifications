<script>
	import { fade } from 'svelte/transition';

	// the store created by createNotificationsStore()
	export let notifications;

	// topmost container settings (not reachable via theme)

	// right|center|left
	export let posX = 'right';
	export let posXMobile = 'center';
	// top|center|bottom
	export let posY = 'top';
	export let posYMobile = 'bottom';
	//
	export let wrapPadding = '1rem';
	export let wrapZIndex = '9999';
	//

	// quick-n-dirty addons
	export let wrapClass = '';
	export let wrapCss = '';
	export let notifClass = '';
	export let notifCss = '';

	//
	export let ariaCloseLabel = 'Discard';

	//
	export let theme = 'default';
	export let themeVars = {};

	// sanitize
	let x, y, xMobile, yMobile;
	// y
	const LCR = /^left|center|right$/;
	$: x = LCR.test(`${posX}`) ? posX : 'right';
	$: xMobile = LCR.test(`${posXMobile}`) ? posXMobile : 'center';
	// y
	const TCB = /^top|center|bottom$/;
	$: y = TCB.test(`${posY}`) ? posY : 'top';
	$: yMobile = TCB.test(`${posYMobile}`) ? posYMobile : 'bottom';

	$: cssVars = Object.entries(themeVars || {})
		.reduce((m, [k, v]) => {
			m.push(`--${k}:${v}`);
			return m;
		}, [])
		.join(';');
</script>

<!-- Global notification live region, render this permanently at the end of the document -->
<div
	class="notifications position-y-mobile-{yMobile} position-y-{y} theme-{theme} {wrapClass}"
	style="padding: {wrapPadding}; z-index: {wrapZIndex}; {cssVars}; {wrapCss};"
	aria-live="assertive"
	aria-atomic="true"
>
	<div class="position-x-mobile-{xMobile} position-x-{x}">
		{#if $notifications.length}
			{#each $notifications as n}
				<!-- use your own component -->
				{#if n?.component}
					<svelte:component
						this={n.component.component || n.component}
						{...n.component.props || {}}
						notification={n}
						{notifications}
					/>
				{:else}
					<div
						transition:fade={{ duration: 300 }}
						class="notification {notifClass}"
						class:cursor-pointer={typeof n.onClick === 'function'}
						style={notifCss}
						data-notification-type={n.type}
						role="alert"
						on:mouseover={() => notifications.event(n.id, notifications.EVENT.MOUSEOVER)}
						on:click={() => notifications.event(n.id, notifications.EVENT.CLICK)}
					>
						<!--
							putting additional div here, so we can utilize base background
							above (that is use semi-transparent colors on top of it)
						-->
						<div class="bg">
							<div class="content">
								{#if n.html}{@html n.html}{:else}{n.text}{/if}
							</div>
							<div class="control">
								<button
									aria-label={ariaCloseLabel}
									on:click|preventDefault|stopPropagation={() =>
										notifications.remove(n.id)}
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
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<!--prettier-ignore-->
<style>.cursor-pointer {
  cursor: pointer;
}

.notifications {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  flex-direction: row;
}
.notifications.position-y-mobile-top {
  align-items: flex-start;
}
.notifications.position-y-mobile-center {
  align-items: center;
}
.notifications.position-y-mobile-bottom {
  align-items: flex-end;
}
.notifications > div {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.notifications > div.position-x-mobile-left {
  align-items: flex-start;
}
.notifications > div.position-x-mobile-center {
  align-items: center;
}
.notifications > div.position-x-mobile-right {
  align-items: flex-end;
}
.notifications .notification {
  pointer-events: auto;
}

@media only screen and (min-width: 640px) {
  .notifications.position-y-top {
    align-items: flex-start;
  }
  .notifications.position-y-center {
    align-items: center;
  }
  .notifications.position-y-bottom {
    align-items: flex-end;
  }
  .notifications > div.position-x-left {
    align-items: flex-start;
  }
  .notifications > div.position-x-center {
    align-items: center;
  }
  .notifications > div.position-x-right {
    align-items: flex-end;
  }
}
.notifications.theme-default {
  --space_between: 1rem;
  --box_width: 400px;
  --box_border: none;
  --box_font_size: .95rem;
  --box_font_family: inherit;
  --box_color: rgba(0, 0, 0, .9);
  --box_border_radius: 5px;
  --box_base_background: white;
  --box_background: rgba(0, 0, 0, 0.05);
  --box_background_hover: rgba(0, 0, 0, 0.1);
  --box_max_height: 6rem;
  --box_filter: drop-shadow(1px 1px 0px rgb(0 0 0 / 0.3)) ;
  --content_line_height: 1.25;
  --content_padding: .75rem 1rem;
  --content_text_align: left;
  --control_button_color: var(--box_color);
  --control_button_color_active: var(--box_color);
  --control_button_padding: .5rem;
  --control_button_background: rgba(0, 0, 0, 0.0);
  --control_button_background_active: rgba(0, 0, 0, 0.05);
  --box_color_success: var(--box_color);
  --box_background_success: rgba(0, 255, 0, 0.1);
  --box_background_success_hover: rgba(0, 255, 0, 0.15);
  --box_color_error: var(--box_color);
  --box_background_error: rgba(255, 0, 0, 0.1);
  --box_background_error_hover: rgba(255, 0, 0, 0.15);
  --box_color_warn: var(--box_color);
  --box_background_warn: rgba(255, 255, 0, 0.1);
  --box_background_warn_hover: rgba(255, 255, 0, 0.15);
}
.notifications.theme-default > div > * + * {
  margin-top: var(--space_between);
}
.notifications.theme-default .notification {
  background: var(--box_base_background);
  width: 100%;
  max-width: var(--box_width);
  border: var(--box_border);
  font-size: var(--box_font_size);
  font-family: var(--box_font_family);
  color: var(--box_color);
  border-radius: var(--box_border_radius);
  filter: var(--box_filter);
}
.notifications.theme-default .notification .bg {
  display: flex;
  background: var(--box_background);
  border-radius: var(--box_border_radius);
  position: relative;
}
.notifications.theme-default .notification .bg .content {
  flex: 1;
  line-height: var(--content_line_height);
  padding: var(--content_padding);
  overflow-y: auto;
  max-height: var(--box_max_height);
  text-align: var(--content_text_align);
}
.notifications.theme-default .notification .bg .control {
  display: flex;
  flex-direction: column;
}
.notifications.theme-default .notification .bg .control button {
  flex: 1;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  border: 0;
  margin: 0;
  line-height: 1;
  cursor: pointer;
  color: var(--control_button_color);
  padding: var(--control_button_padding);
  background: var(--control_button_background);
  border-top-right-radius: var(--box_border_radius);
  border-bottom-right-radius: var(--box_border_radius);
}
.notifications.theme-default .notification .bg .control button:hover, .notifications.theme-default .notification .bg .control button:focus {
  color: var(--control_button_color_active);
  background: var(--control_button_background_active);
  outline: none;
}
.notifications.theme-default .notification[data-notification-type=success] .bg {
  color: var(--box_color_success);
  background: var(--box_background_success);
}
.notifications.theme-default .notification[data-notification-type=error] .bg {
  color: var(--box_color_error);
  background: var(--box_background_error);
}
.notifications.theme-default .notification[data-notification-type=warn] .bg {
  color: var(--box_color_warn);
  background: var(--box_background_warn);
}
.notifications.theme-default .notification:hover .bg {
  background: var(--box_background_hover, var(--box_background));
}
.notifications.theme-default .notification:hover[data-notification-type=success] .bg {
  background: var(--box_background_success_hover, var(--box_background_success));
}
.notifications.theme-default .notification:hover[data-notification-type=error] .bg {
  background: var(--box_background_error_hover, var(--box_background_error));
}
.notifications.theme-default .notification:hover[data-notification-type=warn] .bg {
  background: var(--box_background_warn_hover, var(--box_background_warn));
}</style>
