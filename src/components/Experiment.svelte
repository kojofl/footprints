<script lang="ts">
	import { Modal } from "@skeletonlabs/skeleton-svelte";
	import ExperimentRunner from "./experiment/ExperimentRunner.svelte";
	import { Nothing, SpeedState } from "$lib/speed_state.js";
	import { LengthState } from "$lib/length_state.js";
	import { Settings } from "$lib/settings_state.js";
	let openState = $state(false);

	function start_experiment() {
		openState = true;
	}

	let speed = $derived(
		SpeedState.current === Nothing ? undefined : SpeedState.current,
	);
</script>

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
				length={LengthState.current as number}
			/>
		{/snippet}
	</Modal>
</form>
