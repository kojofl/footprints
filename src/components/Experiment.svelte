<script lang="ts">
	import { Modal } from "@skeletonlabs/skeleton-svelte";
	import ExperimentRunner from "./experiment/ExperimentRunner.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { Nothing, SpeedState } from "$lib/speed_state.js";
	import { LengthState } from "$lib/length_state.js";
	let openState = $state(false);

	function start_experiment() {
		openState = true;
	}

	async function calibrate() {
		await invoke("open_calibration");
	}
	let speed = $derived(
		SpeedState.current === Nothing ? undefined : SpeedState.current,
	);
</script>

<form
	class="mx-auto my-10 w-full max-w-md space-y-4 flex flex-col"
	onsubmit={start_experiment}
>
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
	<button
		class="btn preset-filled-primary-500 dark:preset-filled-primary-500"
		type="submit">Start</button
	>
	<Modal
		open={openState}
		onOpenChange={(e) => (openState = e.open)}
		contentBase="card bg-surface-100-900 space-y-4 shadow-xl min-w-screen min-h-screen"
		backdropClasses="backdrop-blur-sm"
	>
		{#snippet content()}
			<ExperimentRunner
				bind:openState
				speed={speed!}
				length={LengthState.current as number}
			/>
		{/snippet}
	</Modal>
</form>

<style>
</style>
