<script lang="ts">
	import Countdown from "$components/Countdown.svelte";
	import { baseline_debounce } from "$lib/state_machine.js";
	import { TaskInstructions } from "$lib/task_instructions_state.js";
	import { invoke } from "@tauri-apps/api/core";
	import type { ExperimentStateProps } from "./types.js";
	import { Settings } from "$lib/settings_state.js";

	let { running = $bindable(), state_machine }: ExperimentStateProps =
		$props();

	async function start_experiment() {
		baseline_debounce(state_machine).catch((e) => {
			if (e === "Cancelled") {
				return;
			}
			throw e;
		});
		await invoke("init_logger", { name: Settings.current.subject_name });

		running = true;
	}

	if (running) {
		baseline_debounce(state_machine).catch((e) => {
			if (e === "Cancelled") {
				return;
			}
			throw e;
		});
	}
</script>

{#if running}
	<div class="fixation-cross-container">
		<div
			class="fixation-cross"
			style="--cross-size: 20px; --cross-thickness: 2px; --cross-color: black;"
		></div>
	</div>
	<div class="flex mt-5 container m-auto justify-center">
		<Countdown duration={2} />
	</div>
{:else}
	<div class="fixation-cross-container">
		{$TaskInstructions}
	</div>
	<div class="flex mt-5 container m-auto justify-center">
		<button
			type="button"
			class="btn preset-filled-primary-500"
			onclick={async () => await start_experiment()}>Go</button
		>
	</div>
{/if}

<style>
	.fixation-cross-container {
		background-color: white;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 80%;
		height: 80vh; /* Or a specific height if you prefer */
		position: relative; /* Or relative, depending on your layout */
		top: 10%;
		left: 10%;
	}

	.fixation-cross {
		width: var(--cross-size);
		height: var(--cross-size);
		position: relative;
	}

	.fixation-cross::before,
	.fixation-cross::after {
		content: "";
		position: absolute;
		background-color: var(--cross-color);
	}

	/* Horizontal line */
	.fixation-cross::before {
		left: 50%;
		top: 50%;
		width: var(--cross-size);
		height: var(--cross-thickness);
		transform: translate(-50%, -50%);
	}

	/* Vertical line */
	.fixation-cross::after {
		left: 50%;
		top: 50%;
		width: var(--cross-thickness);
		height: var(--cross-size);
		transform: translate(-50%, -50%);
	}
</style>
