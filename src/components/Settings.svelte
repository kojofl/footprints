<script lang="ts">
	import { LengthState } from "$lib/length_state.js";
	import Lightswitch from "./Lightswitch.svelte";
	import { Settings } from "$lib/settings_state.js";
	import { invoke } from "@tauri-apps/api/core";
	import { SpeedState } from "$lib/speed_state.js";
	import { NumIterations } from "$lib/num_iter_state.js";

	let { openState = $bindable() } = $props();
	async function calibrate() {
		await invoke("open_calibration");
	}
	function save() {
		openState = false;
	}
</script>

<div class="flex justify-between">
	<h3 class="h3">Settings</h3>
	<Lightswitch />
</div>

<form class="space-y-2" onsubmit={save}>
	<div class="space-y-2">
		<span class="label-text text-lg">Some on/off setting:</span>
		<label class="flex items-center space-x-2">
			<input
				class="checkbox"
				type="checkbox"
				bind:checked={Settings.current.show_countdown}
			/>
			<p>Show countdown</p>
		</label>

		<label class="label">
			<span class="label-text">Walking Speed in km/h</span>
			<input
				type="number"
				class="input"
				placeholder="Speed"
				step="0.01"
				required
				bind:value={SpeedState.current}
			/>
		</label>
		<button type="button" onclick={async () => await calibrate()}
			>Calibrate Speed</button
		>
		<label class="label">
			<span class="label-text">Track length in m</span>
			<input
				type="number"
				class="input"
				placeholder="Length in m"
				required
				bind:value={LengthState.current}
			/>
		</label>
		<label class="label">
			<span class="label-text">Experiment Iterations</span>
			<input
				type="number"
				class="input"
				placeholder="Number of Iterations"
				step="1"
				required
				bind:value={NumIterations.current}
			/>
		</label>
		<span class="label-text text-lg">Speed variations</span>
		<label class="flex items-center space-x-2">
			<input
				class="checkbox"
				type="checkbox"
				bind:checked={Settings.current.very_slow}
			/>
			<p>-20%</p>
		</label>
		<label class="flex items-center space-x-2">
			<input
				class="checkbox"
				type="checkbox"
				bind:checked={Settings.current.slow}
			/>
			<p>-10%</p>
		</label>
		<label class="flex items-center space-x-2">
			<input
				class="checkbox"
				type="checkbox"
				bind:checked={Settings.current.fast}
			/>
			<p>10%</p>
		</label>
		<label class="flex items-center space-x-2">
			<input
				class="checkbox"
				type="checkbox"
				bind:checked={Settings.current.very_fast}
			/>
			<p>20%</p>
		</label>
	</div>
</form>
