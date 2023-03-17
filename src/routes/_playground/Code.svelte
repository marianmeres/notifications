<script>
	import { createClog } from '@marianmeres/clog';
	import Button from './Button.svelte';
	const clog = createClog('Code');

	export let themeVars;
	export let componentProps;
	export let storeConfig;

	export let outputRef;

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
  themeVars={`{${cleanup(JSON.stringify($themeVars, null, 4))}}`}
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
