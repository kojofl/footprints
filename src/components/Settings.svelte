<script lang="ts">
	import { LengthState } from "$lib/length_state.js";
	import Lightswitch from "./Lightswitch.svelte";
	import { Settings } from "$lib/settings_state.js";
	import { invoke } from "@tauri-apps/api/core";
	import { SpeedState } from "$lib/speed_state.js";
	import { NumIterations } from "$lib/num_iter_state.js";
	import {
		TaskInstructions,
		handleTaskInstructionsFile,
		triggerFileUpload,
	} from "$lib/task_instructions_state.js";
	import { watch } from "runed";

	let { openState = $bindable() } = $props();

	let files: FileList | undefined = $state();

	watch(
		() => files,
		() => {
			if (files?.item(0)) {
				Settings.current.task_instructions = files.item(0)!.name;
			}
		},
	);

	async function calibrate() {
		await invoke("open_calibration");
	}
	function save() {
		openState = false;
	}

	function clearInfoFile(event: any) {
		event.preventDefault();
		Settings.current.task_instructions = "";
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
		<span class="label-text text-lg">Rating categories</span>
		<label class="flex items-center space-x-2">
			<input
				class="checkbox"
				type="checkbox"
				bind:checked={Settings.current.rating.valence}
			/>
			<p>Valence</p>
		</label>
		<label class="flex items-center space-x-2">
			<input
				class="checkbox"
				type="checkbox"
				bind:checked={Settings.current.rating.arousal}
			/>
			<p>Arousal</p>
		</label>
		<label class="label">
			<span class="label-text text-lg">Task Instructions</span>
			<div class="flex gap-2 w-full">
				<input
					type="file"
					accept=".txt"
					bind:files
					onchange={handleTaskInstructionsFile}
					hidden
				/>
			</div>
			<div class="flex justify-between">
				<p>Choose file</p>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<p onclick={clearInfoFile}>X</p>
			</div>
			<p>
				{Settings.current.task_instructions == ""
					? "No file selected"
					: Settings.current.task_instructions}
			</p>
		</label>
	</div>
</form>
