<script>
	import { fade } from 'svelte/transition';
	import { iconBytesizeInfo } from './iconBytesizeInfo.js';
	import { iconBytesizeCheckmark } from './iconBytesizeCheckmark.js';
	import { iconBytesizeBell } from './iconBytesizeBell.js';
	import { iconBytesizeAlert } from './iconBytesizeAlert.js';

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
	export let wrapPosition = 'fixed';
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

	// https://github.com/marianmeres/icons-fns
	// prettier-ignore
	const ICONS = {
		info: iconBytesizeInfo,
		success: iconBytesizeCheckmark,
		warn: iconBytesizeBell,
		error: iconBytesizeAlert,
	}

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

<div
	class="notifications position-y-mobile-{yMobile} position-y-{y} theme-{theme} {wrapClass}"
	style="position: {wrapPosition}; padding: {wrapPadding}; z-index: {wrapZIndex}; {cssVars}; {wrapCss};"
	aria-live="assertive"
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
						transition:fade|global={{ duration: 300 }}
						class="notification {notifClass}"
						class:cursor-pointer={typeof n.onClick === 'function'}
						style={notifCss}
						data-notification-type={n.type}
						data-notification-multiple={n.count > 1 ? true : undefined}
						role="alert"
						on:mouseover={() => notifications.event(n.id, notifications.EVENT.MOUSEOVER)}
						on:mouseout={() => notifications.event(n.id, notifications.EVENT.MOUSEOUT)}
						on:click={() => notifications.event(n.id, notifications.EVENT.CLICK)}
					>
						{#if n.count > 1}
							<div class="count">{n.count}</div>
						{/if}
						{#if n.icon}
							<div class="icon">
								{#if n.icon === true && ICONS[n.type]}
									{@html ICONS[n.type](null, 24)}
								{:else if typeof n.icon === 'function'}
									{@html n.icon()}
								{/if}
							</div>
						{/if}
						<div class="content">
							<div>
								{#if n.html}{@html n.html}{:else}{n.text}{/if}
							</div>
						</div>
						<div class="control">
							<button
								aria-label={ariaCloseLabel}
								on:click|preventDefault|stopPropagation={() => notifications.remove(n.id)}
							>
								<span>
									<!-- Copyright: https://icons.getbootstrap.com/icons/x/ -->
									<svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
										<path
											d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
										/>
									</svg>
								</span>
							</button>
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
  --box_border: 1px solid #0f172a;
  --box_font_size: .95rem;
  --box_font_family: inherit;
  --box_border_radius: 5px;
  --box_max_height: 10rem;
  --box_filter: none;
  --count_display: flex;
  --count_background: #3f3f46;
  --count_color: white;
  --count_font_size: 13px;
  --count_padding: 4px 8px;
  --count_border_radius: 10px;
  --count_inset: -8px -8px auto auto;
  --count_width: auto;
  --count_height: auto;
  --count_after_content: "";
  --icon_display: "flex";
  --icon_opacity: .9;
  --content_line_height: 1.25;
  --content_padding: .75rem 1rem;
  --content_text_align: left;
  --control_button_opacity: .5;
  --control_button_opacity_active: 1;
  --control_button_color: #000000;
  --control_button_color_active: var(--control_button_color);
  --control_button_padding: .5rem;
  --control_button_background: rgba(0, 0, 0, 0.0);
  --control_button_background_active: rgba(0, 0, 0, 0.05);
  --box_color_info: #0f172a;
  --box_background_info: #f5f5f4;
  --box_background_info_hover: #e7e5e4;
  --box_color_success: #14532d;
  --box_background_success: #dcfce7;
  --box_background_success_hover: #bbf7d0;
  --box_color_warn: #713f12;
  --box_background_warn: #fef9c3;
  --box_background_warn_hover: #fef08a;
  --box_color_error: #7f1d1d;
  --box_background_error: #fee2e2;
  --box_background_error_hover: #fecaca;
}
.notifications.theme-default > div > * + * {
  margin-top: var(--space_between);
}
.notifications.theme-default .notification {
  width: 100%;
  max-width: var(--box_width);
  border: var(--box_border);
  font-size: var(--box_font_size);
  font-family: var(--box_font_family);
  border-radius: var(--box_border_radius);
  filter: var(--box_filter);
  display: flex;
  position: relative;
}
.notifications.theme-default .notification .count {
  position: absolute;
  background: var(--count_background);
  color: var(--count_color);
  padding: var(--count_padding);
  border-radius: var(--count_border_radius);
  inset: var(--count_inset);
  line-height: 1;
  font-size: var(--count_font_size);
  width: var(--count_width);
  height: var(--count_height);
  display: var(--count_display);
  justify-content: center;
  align-items: center;
  pointer-events: none;
}
.notifications.theme-default .notification .count::after {
  content: var(--count_after_content);
}
.notifications.theme-default .notification .icon {
  display: var(--icon_display);
  flex-direction: column;
  justify-content: center;
  padding: 1rem 0 1rem 1rem;
  opacity: var(--icon_opacity);
}
.notifications.theme-default .notification .content {
  flex: 1;
  line-height: var(--content_line_height);
  padding: var(--content_padding);
  overflow-y: auto;
  max-height: var(--box_max_height);
  text-align: var(--content_text_align);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.notifications.theme-default .notification .control {
  display: flex;
  flex-direction: column;
}
.notifications.theme-default .notification .control button {
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
.notifications.theme-default .notification .control button span {
  opacity: var(--control_button_opacity);
}
.notifications.theme-default .notification .control button:hover, .notifications.theme-default .notification .control button:focus {
  color: var(--control_button_color_active);
  background: var(--control_button_background_active);
  outline: none;
}
.notifications.theme-default .notification .control button:hover span, .notifications.theme-default .notification .control button:focus span {
  opacity: var(--control_button_opacity_active);
}
.notifications.theme-default .notification[data-notification-type=info] {
  color: var(--box_color_info);
  background: var(--box_background_info);
}
.notifications.theme-default .notification[data-notification-type=success] {
  color: var(--box_color_success);
  background: var(--box_background_success);
}
.notifications.theme-default .notification[data-notification-type=warn] {
  color: var(--box_color_warn);
  background: var(--box_background_warn);
}
.notifications.theme-default .notification[data-notification-type=error] {
  color: var(--box_color_error);
  background: var(--box_background_error);
}
.notifications.theme-default .notification:hover[data-notification-type=info] {
  background: var(--box_background_info_hover, var(--box_background_info));
}
.notifications.theme-default .notification:hover[data-notification-type=success] {
  background: var(--box_background_success_hover, var(--box_background_success));
}
.notifications.theme-default .notification:hover[data-notification-type=warn] {
  background: var(--box_background_warn_hover, var(--box_background_warn));
}
.notifications.theme-default .notification:hover[data-notification-type=error] {
  background: var(--box_background_error_hover, var(--box_background_error));
}</style>
