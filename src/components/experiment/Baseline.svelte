<script lang="ts">
	import Countdown from "$components/Countdown.svelte";
	import { baseline_debounce } from "$lib/state_machine.js";
	import type { ExperimentStateProps } from "./types.js";

	const { state_machine }: ExperimentStateProps = $props();
	const size = 20;
	const thickness = 2;
	const color = "black";
	let started = $state(false);

	function start_experiment() {
		baseline_debounce(state_machine).catch((e) => {
			if (e === "Cancelled") {
				return;
			}
			throw e;
		});
		started = true;
	}
</script>

<div class="fixation-cross-container">
	<div
		class="fixation-cross"
		style="--cross-size: {size}px; --cross-thickness: {thickness}px; --cross-color: {color};"
	></div>
</div>
<div class="flex mt-5 container m-auto justify-center">
	{#if !started}
		<button
			type="button"
			class="btn preset-filled-primary-500"
			onclick={start_experiment}>Go</button
		>
	{:else}
		<Countdown duration={2} />
	{/if}
</div>

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
