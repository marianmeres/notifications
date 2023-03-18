<script>
	import { writable } from 'svelte/store';
	import { onDestroy, onMount } from 'svelte';
	import { getRandomHumanReadable } from '@marianmeres/random-human-readable';
	import { createClog } from '@marianmeres/clog';
	import { createNotificationsStore } from '$lib';
	import './_playground/tooltip.css';
	import Notifications from '$lib/svelte/Notifications.svelte';
	import CustomN from './_playground/CustomN.svelte';
	import Button from './_playground/Button.svelte';
	import Code from './_playground/Code.svelte';
	import Console from './_playground/Console.svelte';
	import Block from './_playground/Block.svelte';
	import Box from './_playground/Box.svelte';
	import Types from './_playground/Types.svelte';
	import {
		getRandomArrayItem,
		getRandomInt,
		randomTxt,
		sleep,
		times,
	} from './_playground/utils.js';
	import ClipCopy from './_playground/ClipCopy.svelte';

	export let data;

	const clog = createClog('example');

	const TYPES = ['info', 'success', 'warn', 'error'];
	const TTLS = [0, 5];

	//
	const storeConfig = writable({ maxCapacity: 4, sortOrder: 'asc' });
	const componentProps = writable({ posX: 'right', posY: 'top', wrapPadding: '1rem' });
	const borderThemeVars = writable({});
	const themeVars = writable({});
	const boxThemeVars = writable({});
	const infoThemeVars = writable({});

	//
	const notifications = createNotificationsStore([], {
		defaultTtl: 0,
		maxCapacity: $storeConfig.maxCapacity,
		sortOrder: $storeConfig.sortOrder,
		logger: clog,
	});

	onDestroy(
		storeConfig.subscribe(({ maxCapacity, sortOrder }) => {
			notifications.setMaxCapacity(maxCapacity);
			notifications.setSortOrder(sortOrder);
		})
	);

	let log = [];

	let text = randomTxt();
	let type;
	let isHtml = true;
	let randomDupes = true;
	let ttl = notifications.options.defaultTtl;
	let outputRef;

	//
	const create = (all = false) => {
		const on = (eventName, self, all, data) => {
			if (eventName !== notifications.EVENT.MOUSEOVER) {
				log = [
					`${new Date().toISOString().slice(14, 19)} ${eventName}: ${self.id}`,
					...log,
				];
			}
		};
		const onClick = (self, all, data) => console.log(`Clicked on ${self.id}`);
		if (all) {
			const html = TYPES.map(randomTxt);
			(async () => {
				for (let idx = 0; idx < TYPES.length; idx++) {
					const type = TYPES[idx];
					const created = new Date();
					notifications.add({ html: html[idx], ttl: 0, type, on, created, onClick });
					if (randomDupes && Math.random() >= 0.5) {
						times(getRandomInt(1, 5), () => {
							notifications.add({ html: html[idx], type, created });
						});
					}
					// so the `created` prop will be different, and sorting will work as expected
					await sleep(10);
				}
			})();
		} else {
			notifications.add({
				text: isHtml ? undefined : text,
				html: isHtml ? text : undefined,
				type,
				on,
				onClick,
				ttl,
				component: /^xxx$/i.test(text) ? CustomN : undefined,
			});

			text = randomTxt();
			type = getRandomArrayItem(TYPES);
		}
	};

	onMount(() => create(true));
</script>

<svelte:head>
	<title>Notifications playground and theme configurator</title>
</svelte:head>

<div class="header">
	<h1>
		<a href="https://github.com/marianmeres/notifications" target="_blank">
			@marianmeres/notifications
		</a>
		playground and theme editor
	</h1>
	<p style="margin: 0;">
		Generic store library for notifications and Svelte component for their rendering. Read
		full
		<a href="https://github.com/marianmeres/notifications" target="_blank">
			documentation</a
		> at GitHub.
	</p>
</div>

<div class="layout">
	<div class="left">
		<div class="manager">
			<Block><ClipCopy {outputRef} /></Block>

			<Block>
				<label>
					<span><b>Text</b> <small>(try "xxx")</small></span>
					<textarea bind:value={text} rows="3" style="font-size: .9rem;" />
				</label>

				<div style="display: flex;">
					<div style="flex: 1; padding-right: .5rem;">
						<label>
							<span><b>Type</b></span>
							<select bind:value={type}>
								{#each TYPES as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</label>
					</div>
					<div style="flex: 1; padding-left: .5rem;">
						<label>
							<span><b>Expiry</b> <small>(seconds)</small></span>
							<select bind:value={ttl}>
								{#each TTLS as i}
									<option value={i}>{i}</option>
								{/each}
							</select>
						</label>
					</div>
				</div>

				<p data-tooltip="up" aria-label="Dupes are ignored (count badge is shown).">
					<small>
						Same <code>[text,type]</code> pair is considered as duplicate.
					</small>
				</p>

				<div style="display: flex">
					<div style="flex: 1;">
						<Button on:click={() => create(false)}>Create</Button>
					</div>
					<div>
						<label style="margin-bottom: 0">
							<input type="checkbox" bind:checked={isHtml} />
							Allow html
						</label>
					</div>
				</div>
			</Block>

			<Block>
				<div style="display: flex">
					<div style="flex: 1;">
						<Button on:click={() => create(true)}>Create all types</Button>
					</div>
					<div>
						<label style="margin-bottom: 0">
							<input type="checkbox" bind:checked={randomDupes} />
							Random dupes
						</label>
					</div>
				</div>
			</Block>

			<Block><Box {themeVars} {componentProps} /></Block>

			<Block><Types {themeVars} {TYPES} /></Block>

			<Block>
				<div style="display: flex;">
					<div style="flex: 1; padding-right: .5rem;">
						<label style="margin-bottom: .5rem">
							<span><b>Store capacity</b></span>
							<select bind:value={$storeConfig.maxCapacity}>
								{#each [4, 8] as value}
									<option {value}>{value}</option>
								{/each}
							</select>
						</label>
					</div>
					<div style="flex: 1; padding-left: .5rem;">
						<label style="margin-bottom: .5rem">
							<span><b>Sort order</b></span>
							<select bind:value={$storeConfig.sortOrder}>
								{#each ['asc', 'desc'] as value}
									<option {value}>{value}</option>
								{/each}
							</select>
						</label>
					</div>
				</div>
				<p style="margin-bottom: 0">
					<small> Changes will have effect on next create. </small>
				</p>
			</Block>

			<!--<Block><Console {log} /></Block>-->
		</div>

		<footer>
			Author: Marian Meres, <a href="mailto:marian@meres.sk">marian@meres.sk</a><br/>
			Version: { data?.VERSION }
		</footer>
	</div>
	<div class="right">
		<Code {themeVars} {componentProps} {storeConfig} bind:outputRef />
		<Notifications
			{notifications}
			posX={$componentProps.posX}
			posY={$componentProps.posY}
			wrapPadding={$componentProps.wrapPadding}
			themeVars={$themeVars}
			wrapPosition="fixed"
		/>
	</div>
</div>

<style lang="scss">
	:global(a),
	:global(a:hover),
	:global(code) {
		color: #7f1d1d;
	}

	.header {
		background: #e7e5e4;
		margin: 0 0 1rem 0;
		padding: 1rem;
		h1 {
			margin: 0 0 1rem 0;
			padding: 0;
			font-size: 1.2rem;
			font-weight: bolder;
		}
	}

	.layout {
		display: flex;
		.left {
			width: 400px;
			display: flex;
			flex-direction: column;
		}
		.right {
			flex: 1;
			position: relative;
			//background: white;
			padding-right: 1rem;
		}
	}

	.manager {
		width: 100%;
		padding: 0 1rem;

		label {
			margin-bottom: 1rem;
			display: block;
			width: 100%;
			& > span {
				display: block;
				margin-bottom: 0.2rem;
				& small {
					opacity: 75%;
				}
			}
			& input[type='number'],
			& textarea,
			& select {
				display: block;
				width: 100%;
			}
		}
	}

	footer {
		font-size: 0.85rem;
		padding: 0 1.5rem;
		color: gray;
		a {
			color: gray;
			text-decoration: none;
		}
	}

	:global(table.inputs) {
		width: 100%;
		font-size: 0.8rem;
		white-space: nowrap;
		:global(th) {
			font-weight: normal;
		}
		:global(td) {
			width: 100%;
			padding-left: 1rem;
			:global(input) {
				width: 100%;
			}
		}
	}
</style>
