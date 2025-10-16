<script lang="ts">
	import { LengthState } from "$lib/length_state.js";
	import Lightswitch from "./Lightswitch.svelte";
	import { Settings } from "$lib/settings_state.js";
	import { invoke } from "@tauri-apps/api/core";
	import { SpeedState } from "$lib/speed_state.js";
	import { NumIterations } from "$lib/num_iter_state.js";
	import { watch } from "runed";
	import { Slider } from "@skeletonlabs/skeleton-svelte";

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
</script>

<div class="flex justify-between">
	<h3 class="h3">Settings</h3>
	<Lightswitch />
</div>

<!--TODO: scrolling-->
<div class="flex flex-col h-screen overflow-scroll">
	<form class="flex-grow space-y-2" onsubmit={save}>
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

			<label class="flex items-center space-x-2">
				<input
					class="checkbox"
					type="checkbox"
					bind:checked={Settings.current.sound_cue}
				/>
				<p>Sound cue</p>
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
			<span class="label-text text-lg">Baseline</span>
			<label class="flex items-center space-x-2">
				<Slider
					value={[Settings.current.baseline_duration]}
					onValueChange={(e) => (Settings.current.baseline_duration = e.value[0])}
					markers={[2, 3, 4, 5]}
					min={2}
					max={5}
				/>
				<p>Duration</p>
			</label>
			<label class="flex items-center space-x-2">
				<Slider
					value={[Settings.current.baseline_jitter]}
					onValueChange={(e) => {
						(Settings.current.baseline_jitter = e.value[0])}
						}
					markers={[
						0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0,
					]}
					min={0.0}
					max={2.0}
					step={0.2}
					mark={mark}
				/>
				<p>Jitter</p>
			</label>
			<span class="label-text text-lg">Stimulus</span>
			<label class="flex items-center space-x-2">
				<Slider
					value={[Settings.current.stimulus_duration]}
					onValueChange={(e) => (Settings.current.stimulus_duration = e.value[0])}
					markers={[2, 3, 4, 5]}
					min={2}
					max={5}
				/>
				<p>Duration</p>
			</label>
			<label class="flex items-center space-x-2">
				<Slider
					value={[Settings.current.stimulus_jitter]}
					onValueChange={(e) => (Settings.current.stimulus_jitter = e.value[0])}
					markers={[
						0.0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0,
					]}
					min={0.0}
					max={2.0}
					step={0.2}
					mark={mark}
				/>
				<p>Jitter</p>
			</label>
		</div>
	</form>
</div>

{#snippet mark(marker: number)} {marker.toFixed(1)} {/snippet}
