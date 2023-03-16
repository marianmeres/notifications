<script>
	import { createClog } from '@marianmeres/clog';

	const clog = createClog('Types');

	export let themeVars;
	export let TYPES;

	let type = 'info';

	let color = {
		info: '#0f172a',
		success: '#14532d',
		warn: '#713f12',
		error: '#7f1d1d',
	};
	let background = {
		info: '#f5f5f4',
		success: '#dcfce7',
		warn: '#fef9c3',
		error: '#fee2e2',
	};
	let backgroundHover = {
		info: '#e7e5e4',
		success: '#bbf7d0',
		warn: '#fef08a',
		error: '#fecaca',
	};

	const updateColor = (type, val) => ($themeVars[`box_color_${type}`] = val);
	const updateBg = (type, val) => ($themeVars[`box_background_${type}`] = val);
	const updateBgHov = (type, val) => ($themeVars[`box_background_${type}_hover`] = val);

	// touch now, so the generated code will be complete
	TYPES.forEach((t) => {
		updateColor(t, color[t]);
		updateBg(t, background[t]);
		updateBgHov(t, backgroundHover[t]);
	});

	// rerender on update
	$: if (color) updateColor(type, color[type]);
	$: if (background) updateBg(type, background[type]);
	$: if (backgroundHover) updateBgHov(type, backgroundHover[type]);
</script>

<div style="margin-bottom: .5rem;">
	<b>Type &nbsp;</b>
	{#each TYPES as t}
		<button class="tab" class:active={type === t} on:click={() => (type = t)}>
			{t}
		</button>
	{/each}
</div>

<div>
	<table class="inputs">
		<tr>
			<th>Colors</th>
			<td>
				<div style="display: flex; justify-content: space-between;">
					<input
						type="color"
						bind:value={color[type]}
						data-tooltip="up"
						aria-label="Text"
					/>
					<span style="width:1rem;" />
					<input
						type="color"
						bind:value={background[type]}
						data-tooltip="up"
						aria-label="Background"
					/>
					<span style="width:1rem;" />
					<input
						type="color"
						bind:value={backgroundHover[type]}
						data-tooltip="up"
						aria-label="Background hover"
					/>
				</div>
			</td>
		</tr>
	</table>
</div>

<style lang="scss">
	button.tab {
		border: 0;
		background: none;
		padding: 0 0.5rem;
		display: inline-block;
		margin-right: 0.3rem;
		border-radius: 5px;
		font-size: 0.9rem;
		&:hover {
			background: rgba(255, 255, 255, 0.7);
		}
		&.active {
			font-weight: bold;
			background: rgba(255, 255, 255, 0.7);
		}
	}
</style>
