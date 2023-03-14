<script>
	import { createClog } from '@marianmeres/clog';
	import { createNotificationsStore } from '$lib';
	import Notifications from '$lib/components/Notifications.svelte';
	import { getRandomHumanReadable } from '@marianmeres/random-human-readable';
	import CustomN from './CustomN.svelte';

	const clog = createClog('example');

	// prettier-ignore
	const randomTxt = () => {
		const ucf = (s) => s.slice(0, 1).toUpperCase() + s.slice(1);
		const rhr = () => getRandomHumanReadable({ adjCount: 2, colorsCount: 1, nounsCount: 1, joinWith: ' ' });
		return [ '<b>', ucf(rhr()), '</b><br /><small>', ucf(rhr()), ' and ', rhr(), '.</small>' ].join('');
	}

	const getRandomInt = (min, exclusiveMax) => {
		min = Math.ceil(min);
		exclusiveMax = Math.floor(exclusiveMax);
		return Math.floor(Math.random() * (exclusiveMax - min) + min);
	};

	const getRandomArrayItem = (arr) => arr[getRandomInt(0, arr.length)];

	const TYPES = ['info', 'success', 'warn', 'error'];
	const TTLS = [0, 5, 10, 20, 60];

	//
	const notifications = createNotificationsStore([], {
		defaultTtl: 0,
		maxCapacity: 5,
	});

	let log = [];

	let text = randomTxt();
	let type;
	let isHtml = true;
	let ttl = notifications.options.defaultTtl;
	let themeVars = {};

	let posX = 'right';
	let posY = 'top';

	const create = () => {
		const id = Math.random().toString(36).slice(2);
		const isCustom = text === 'xxx';

		notifications.add({
			id,
			text: isHtml ? undefined : text,
			html: isHtml ? text : undefined,
			type,
			on: (eventName, data, self, all) => {
				log = [`${new Date().toISOString().slice(11, 19)} ${eventName}: ${id}`, ...log];
			},
			onClick: (self, all, data) => {
				if (self.ttl) {
					self.ttl = 0;
					notifications.event(self.id, 'auto disposal disabled');
				}
			},
			ttl,
			component: isCustom ? CustomN : undefined,
		});

		text = randomTxt();
		type = getRandomArrayItem(TYPES);
		ttl = getRandomArrayItem(TTLS);
	};
</script>

<!-- prettier-ignore -->
<div class="manager">
	<h1>
		<a href="https://github.com/marianmeres/notifications" target="_blank">
			@marianmeres/notifications
		</a>
		playground
	</h1>

	<p>
		<label>
			<span>Text <small style="opacity: 75%;">(try "xxx")</small></span>
			<textarea bind:value={text} rows="3" />
		</label>
	</p>

	<p>
		<label>
			<input type="checkbox" bind:checked={isHtml} />
			Allow html
		</label>
	</p>

	<p>
		<label>
			<span>Type</span>
			<select bind:value={type}>
				{#each TYPES as type}
					<option value={type}>{type}</option>
				{/each}
			</select>
		</label>
	</p>

	<p>
		<label>
			<span>
				Expiry time
				<small style="opacity: 75%;">(in seconds, 0 no expiry)</small>
			</span>
			<select bind:value={ttl}>
				{#each TTLS as i}
					<option value={i}>{i}</option>
				{/each}
			</select>
		</label>
	</p>

	<button on:click|preventDefault={create} class="create">Create</button>

	<hr />

	<table>
		<tr>
			<td><button on:click|preventDefault={() => { posX='left';   posY='top'; }}>↖</button></td>
			<td><button on:click|preventDefault={() => { posX='center'; posY='top'; }}>↑</button></td>
			<td><button on:click|preventDefault={() => { posX='right';  posY='top' }}>↗</button></td>
		</tr>
		<tr>
			<td><button on:click|preventDefault={() => { posX='left';   posY='center'; }}>←</button></td>
			<td><button on:click|preventDefault={() => { posX='center'; posY='center'; }}>•</button></td>
			<td><button on:click|preventDefault={() => { posX='right';  posY='center' }}>→</button></td>
		</tr>
		<tr>
			<td><button on:click|preventDefault={() => { posX='left';   posY='bottom'; }}>↙</button></td>
			<td><button on:click|preventDefault={() => { posX='center'; posY='bottom'; }}>↓</button></td>
			<td><button on:click|preventDefault={() => { posX='right';  posY='bottom' }}>↘</button></td>
		</tr>
	</table>

	<hr />
	<p style="margin: 1rem 0 0 0;">
		In this playground, the clicked notifications will not be auto disposed.<br/>
		<small style="opacity: 75%;">The <code>onClick</code> handler
			sets <code>n.ttl = 0</code></small>
	</p>

	<hr />
		<b>Theme</b>
		<div>
			<button on:click={() => themeVars = {}}>Default</button>
			<button on:click={() => themeVars = {
				box_border: 0,
				box_border_radius: 0,
				box_width: '100%',
				box_color: 'white',
				control_button_color: 'white',
				content_text_align: 'center',
				filter: 'none',
				//
				box_background: 'crimson',
				box_background_hover: 'maroon',
				//
				box_background_warn: 'tomato',
				box_background_warn_hover: 'saddlebrown',
				//
				box_background_error: 'mediumvioletred',
				box_background_error_hover: 'midnightblue',
				//
				box_background_success: 'mediumseagreen',
				box_background_success_hover: 'forestgreen',
			}}>Customized <code>themeVars</code></button>
		</div>
	<hr />

	{#if log.length}
		<b>Event log</b>
		<small
			on:click={() => log = []}
			style="text-decoration: underline; cursor: pointer;"
		>clear</small>
		<pre>{log.slice(0, 15).join("\n")}</pre>
	{/if}

	<p>
		<small>
			<a
				href="https://github.com/marianmeres/notifications/blob/master/src/routes/%2Bpage.svelte"
				target="_blank"
				style="color: gray"
			>
				This page source.
			</a>
		</small>
	</p>
</div>

<Notifications {notifications} {posX} {posY} {themeVars} />

<style lang="scss">
	.manager {
		max-width: 350px;
		background: rgba(0, 0, 0, 0.15);
		padding: 1rem;
		min-height: 100vh;
		font-size: 1rem;

		h1 {
			margin: 0 0 1rem 0;
			padding: 0;
			font-size: 1.2rem;
		}
		label {
			display: block;
			width: 100%;
			& > span {
				display: block;
				margin-bottom: 0.2rem;
			}

			& input[type='number'],
			& textarea,
			& select {
				display: block;
				width: 100%;
			}
		}
		td button {
			width: 2rem;
		}
		table {
			margin-bottom: 1rem;
		}
		button.create {
			font-weight: bolder;
			background: lightblue;
		}
	}

	pre {
		margin: 0.5rem 0;
		background: white;
		padding: 0.2rem;
		max-height: 300px;
		overflow-y: scroll;
		font-size: 0.8rem;
		width: 100%;
	}
</style>
