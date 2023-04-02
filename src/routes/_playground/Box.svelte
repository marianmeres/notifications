<script>
	import { createClog } from '@marianmeres/clog';

	const clog = createClog('Border');

	export let themeVars;
	export let componentProps;

	let shadow = '0';
	let borderRadius = '5';
	let borderColor = '#0f172a';
	let borderWidth = '1';
	let wrapPaddingX = '1';
	let wrapPaddingY = '1';
	let spaceBetween = '1';
	let fullWidth = false;
	let countDisplay = true;
	let countBg = '#3f3f46';
	let countColor = '#ffffff';
	let xColor = '#000000';
	let xOpacity = '.5';
	let iDisplay = true;
	let iOpacity = '.9';

	$: $themeVars.space_between = `${spaceBetween}rem`;
	$: $themeVars.box_border_radius = `${borderRadius}px`;
	$: $themeVars.box_width = fullWidth ? '100%' : '400px';
	$: $themeVars.count_display = countDisplay ? 'flex' : 'none';
	$: $themeVars.count_color = countColor;
	$: $themeVars.count_background = countBg;
	$: $themeVars.control_button_color = xColor;
	$: $themeVars.control_button_opacity = xOpacity;
	$: $themeVars.icon_display = iDisplay ? 'flex' : 'none';
	$: $themeVars.icon_opacity = iOpacity;
	$: $themeVars.box_border = `${borderWidth}px solid ${borderColor}`;
	$: $themeVars.box_filter = parseInt(shadow, 10)
		? `drop-shadow(2px 2px ${shadow}px rgb(0 0 0 / .3))`
		: 'none';
	$: $componentProps.wrapPadding = `${wrapPaddingY}rem ${wrapPaddingX}rem`;
</script>

<b>Box</b>

<table class="inputs">
	<tr>
		<th>Border</th>
		<td>
			<div style="display: flex; justify-content: space-between;">
				<input
					type="range"
					bind:value={borderWidth}
					min="0"
					max="5"
					step="1"
					data-tooltip="up"
					aria-label="Border width"
				/>
				<input
					type="range"
					bind:value={borderRadius}
					min="0"
					max="20"
					step="1"
					data-tooltip="up"
					aria-label="Border radius"
				/>
				<input
					type="color"
					bind:value={borderColor}
					data-tooltip="up"
					aria-label="Border color"
				/>
			</div>
		</td>
	</tr>
	<tr>
		<th>Shadow</th>
		<td><input type="range" bind:value={shadow} min="0" max="5" step="1" /></td>
	</tr>
	<tr>
		<th>Spacing</th>
		<td>
			<div style="display: flex; justify-content: space-between;">
				<input
					type="range"
					bind:value={wrapPaddingY}
					min="0"
					max="3"
					step="0.5"
					data-tooltip="up"
					aria-label="Parent container padding Y"
				/>
				<input
					type="range"
					bind:value={wrapPaddingX}
					min="0"
					max="3"
					step="0.5"
					data-tooltip="up"
					aria-label="Parent container padding X"
				/>
				<input
					type="range"
					bind:value={spaceBetween}
					min="-1"
					max="2"
					step="0.5"
					data-tooltip="up"
					aria-label="Space between"
				/>
			</div>
		</td>
	</tr>
	<tr>
		<th><label for="full">Full width</label></th>
		<td
			><input
				type="checkbox"
				id="full"
				style="width: auto"
				bind:checked={fullWidth}
			/></td
		>
	</tr>
	<tr>
		<th>Position</th>
		<td>
			<div style="display: flex;">
				<select style="flex: 1; margin-right: .5rem;" bind:value={$componentProps.posX}>
					{#each ['left', 'center', 'right'] as value}
						<option {value}>{value}</option>
					{/each}
				</select>
				<select style="flex: 1; margin-leftt: .5rem;" bind:value={$componentProps.posY}>
					{#each ['top', 'center', 'bottom'] as value}
						<option {value}>{value}</option>
					{/each}
				</select>
			</div>
		</td>
	</tr>
	<tr>
		<th>Dupes</th>
		<td>
			<div style="display: flex; justify-content: space-between; align-items: center;">
				<input
					type="checkbox"
					id="showcount"
					style="width: auto"
					bind:checked={countDisplay}
				/>
				<label for="showcount">
					<span style="padding: 0 .5rem;">show</span>
				</label>
				<input
					style="flex: 1; margin-right: .5rem;"
					type="color"
					bind:value={countBg}
					data-tooltip="up"
					aria-label="Count badge background"
				/>
				<input
					style="flex: 1; margin-left: .5rem;"
					type="color"
					bind:value={countColor}
					data-tooltip="up"
					aria-label="Count badge text color"
				/>
			</div>
		</td>
	</tr>
	<tr>
		<th>Type icon</th>
		<td>
			<div style="display: flex;">
				<input
					type="checkbox"
					id="idisplay"
					style="width: auto"
					bind:checked={iDisplay}
				/>
				<label for="idisplay">
					<span style="padding: 0 .5rem;">show</span>
				</label>
				<input
					style="flex: 1"
					type="range"
					bind:value={iOpacity}
					min="0.5"
					max="1"
					step="0.10"
					data-tooltip="up"
					aria-label="X icon opacity"
				/>
			</div>
		</td>
	</tr>
	<tr>
		<th>X icon</th>
		<td>
			<div style="display: flex;">
				<input
					style="flex: 1;"
					type="color"
					bind:value={xColor}
					data-tooltip="up"
					aria-label="X icon color"
				/>
				<span style="width: 1rem;" />
				<input
					style="flex: 1"
					type="range"
					bind:value={xOpacity}
					min="0"
					max="1"
					step="0.25"
					data-tooltip="up"
					aria-label="X icon opacity"
				/>
			</div>
		</td>
	</tr>
</table>
