<script>
	import { createClog } from '@marianmeres/clog';
	import Button from './Button.svelte';
	import { derived } from "svelte/store";
	const clog = createClog('Code');

	export let themeVars;
	export let componentProps;
	export let storeConfig;

	export let outputRef;

	const defaults = {
		space_between: "1rem",
		box_border_radius: "5px",
		box_width: "400px",
		count_display: "flex",
		count_color: "#ffffff",
		count_background: "#3f3f46",
		control_button_color: "#000000",
		control_button_opacity: ".5",
		icon_display: "flex",
		icon_opacity: ".9",
		box_border: "1px solid #0f172a",
		box_filter: "none",
		box_color_info: "#0f172a",
		box_background_info: "#f5f5f4",
		box_background_info_hover: "#e7e5e4",
		box_color_success: "#14532d",
		box_background_success: "#dcfce7",
		box_background_success_hover: "#bbf7d0",
		box_color_warn: "#713f12",
		box_background_warn: "#fef9c3",
		box_background_warn_hover: "#fef08a",
		box_color_error: "#7f1d1d",
		box_background_error: "#fee2e2",
		box_background_error_hover: "#fecaca"
	};

	const outThemeVars = derived([themeVars], ([tv]) => {
		return Object.entries(tv).reduce((m, [k, v]) => {
			if (v !== defaults[k]) m[k] = v;
			return m;
		}, {});
	});

	// $: clog($outThemeVars);

	// $: clog($themeVars);
	// $: clog($componentProps);
	// $: clog($storeConfig);

	// quick hackish
	const cleanup = (str) =>
		str
			.replace(/\s{4}"/g, '    ') // remove key quote start
			.replace(/":/g, ':') // remove key qoute end
			.replace('}', '  }'); // fix offset
</script>

<div class="output">
	<pre bind:this={outputRef}>&lt;!--
  Code bellow is generated based on your settings. You can safely modify it by hand.
  Check docs for full list of supported theme vars.
  Install: npm i @marianmeres/notifications
--&gt;

&lt;script&gt;
  import {`{ createNotificationsStore }`} from '@marianmeres/notifications';
  import Notifications from '@marianmeres/notifications/Notifications.svelte';

  // create store instance (check docs for full list of factory options)
  const notifications = createNotificationsStore([], {`{
    maxCapacity: ${$storeConfig.maxCapacity},
    sortOrder: '${$storeConfig.sortOrder}',
  }`});
&lt;/script&gt;

&lt;button on:click={`{() => notifications.add("Hey ho, let's go!")}`}&gt;Test&lt;/button&gt;

&lt;!--
  This component should be placed either:
    - just before closing &lt;/body&gt; tag (with position="fixed" prop), or
    - just before closing tag of the parent (with position="absolute" prop, while parent
      being positioned "relative")

  If you just want to try it out without any customizations, this should just work:
  &lt;Notifications {`{notifications}`} /&gt;
--&gt;
&lt;Notifications
  {`{notifications}`}
  position="fixed"
  posX="{$componentProps.posX}"
  posXMobile="center"
  posY="{$componentProps.posY}"
  posYMobile="bottom"
  wrapPadding="{$componentProps.wrapPadding}"
  themeVars={`{${cleanup(JSON.stringify($outThemeVars, null, 4))}}`}
/&gt;
</pre>
</div>

<style lang="scss">
	.output {
		padding: 1rem;
		margin: 0 0;
		border-radius: 5px;
		background: #f4f4f5;
		color: #3f3f46;
		pre {
			margin: 0;
			padding: 0;
		}
	}
</style>
