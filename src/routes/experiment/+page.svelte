<script lang="ts">
	import Navbar from "$components/Navbar.svelte";
	import { Modal } from "@skeletonlabs/skeleton-svelte";
	import ExperimentRunner from "./components/ExperimentRunner.svelte";
	import { SpeedState } from "$lib/speed_state.js";
	import { LengthState } from "$lib/length_state.js";
	import { Settings } from "$lib/settings_state.js";
    import { invoke } from "@tauri-apps/api/core";
    import { ExperimentIteration } from "$lib/state_machine.js";
	import { Blocks, total_trials } from "$lib/blocks_state.js";

	let openState = $state(false);

	$inspect(ExperimentIteration.current);

	let trials = $derived(total_trials(Blocks.current));

	async function start_experiment() {
		// An empty block configuration has no trials to run.
		if (trials === 0) {
			return;
		}
		await invoke("init_logger", { name: Settings.current.subject_name });
		openState = true;
	}
</script>

<Navbar />
<main class="container flex m-auto items-center flex-col">
	<form
		class="mx-auto my-10 w-full max-w-md space-y-4 flex flex-col"
		onsubmit={start_experiment}
	>
		<label class="label hidden">
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
		<label class="label hidden">
			<span class="label-text">Total walking distance per trial in m</span>
			<input
				type="number"
				class="input"
				placeholder="Distance in m"
				required
				bind:value={LengthState.current}
			/>
		</label>
		<label class="label">
			<span class="label-text">Subject Name</span>
			<input
				type="text"
				class="input"
				placeholder="Subject name"
				required
				bind:value={Settings.current.subject_name}
			/>
		</label>
		<label class="label">
			<span class="label-text">Study Name</span>
			<input
				type="text"
				class="input"
				placeholder="Study name"
				required
				bind:value={Settings.current.study_name}
			/>
		</label>

		<button
			class="btn preset-filled-primary-500 dark:preset-filled-primary-500"
			type="submit"
			disabled={trials === 0}>Start</button
		>
		{#if trials === 0}
			<p class="text-sm opacity-75">
				No trials configured, add a block in the settings.
			</p>
		{/if}
		<Modal
			open={openState}
			onOpenChange={(e) => (openState = e.open)}
			contentBase="card bg-surface-100-900 space-y-4 shadow-xl min-w-screen min-h-screen"
			backdropClasses="backdrop-blur-sm"
		>
			{#snippet content()}
				<ExperimentRunner
					bind:openState
					length={LengthState.current as number}
				/>
			{/snippet}
		</Modal>
	</form>
</main>
