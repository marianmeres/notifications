<script>
	import { createClog } from '@marianmeres/clog';
	import { createNotificationsStore } from '$lib';
	import Notifications from '$lib/components/Notifications.svelte';

	const clog = createClog('example');
	const notifications = createNotificationsStore();

	let log = '';

	let text = 'Lorem ipsum <b>dolor sit</b> amet, consectetur adipiscing elit.';
	let type;
	let isHtml = true;

	const create = () => {
		// clog(text, type, isHtml);
		const bkp = text;
		const id = Math.random().toString(36).slice(2);
		text = `${id} ${text}`;

		notifications.add({
			id,
			text: isHtml ? undefined : text,
			html: isHtml ? text : undefined,
			type,
			on: (eventName, data, self, all) => {
				log = `${eventName}: ${id}`;
			},
		});
		text = bkp;
	};
</script>

<form>
	<h1>Notifications example</h1>

	<label>
		<span>Text</span>
		<textarea bind:value={text} rows="4" />
	</label>

	<label>
		<input type="checkbox" bind:checked={isHtml} />
		Allow html
	</label>

	<label>
		<span>Type</span>
		<select bind:value={type}>
			{#each ['info', 'warn', 'error', 'success'] as type}
				<option value={type}>{type}</option>
			{/each}
		</select>
	</label>

	<button class="mt-4" on:click|preventDefault={create}>Create notification</button>
</form>

{#if log}
	<pre style="padding: 1rem;">{JSON.stringify(log, null, 2)}</pre>
{/if}

<Notifications {notifications} theme="default" />

<style>
	form {
		max-width: 400px;
		background: rgba(0, 0, 0, 0.2);
		padding: 1rem;
		margin: 1rem;
	}
	form h1 {
		margin: 0 0 1rem 0;
		padding: 0;
	}

	form label {
		display: block;
		width: 100%;
		margin-bottom: 1rem;
	}
	form label > span {
		display: block;
		margin-bottom: 0.5rem;
	}
	form label textarea,
	form label select {
		display: block;
		width: 100%;
	}
</style>
