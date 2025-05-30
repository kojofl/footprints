<script lang="ts">
	import Countdown from "$components/Countdown.svelte";
    import { fade } from "svelte/transition";
	import type { ExperimentStateProps } from "./types.js";

	const { state_machine, step_size, img_url }: ExperimentStateProps =
		$props();
	let progress = $state(0);
	let id: number | undefined = undefined;

	let start_go = $state(false);

	function move() {
		if (id) {
			return;
		}
		id = setInterval(frame, 5);
		function frame() {
			if (progress >= 100) {
				clearInterval(id);
				progress = 100;
				state_machine.send("g_fin");
			} else {
				progress += step_size;
			}
		}
	}

	function pause() {
		console.log(id);
		if (id) {
			clearInterval(id);
			id = undefined;
		}
	}

	function start() {
		move();
	}

	$effect(() => {
		if (state_machine.current === "go") {
			start_go = true;
			move();
		}
	});
</script>

<div class="fixation-cross-container">
	<img src={img_url} alt="stimulus" />
</div>
<div class="flex flex-col">
	{#if start_go}
		<div class="flex container m-auto" transition:fade>
			<progress class="progress h-8" value={progress} max="100"
			></progress>
		</div>
		<button onclick={start}>Start</button>
		<button onclick={pause}>Pause</button>
	{:else}
		<div class="flex container m-auto justify-center">
			<Countdown duration={3} />
		</div>
	{/if}
</div>

<style>
	.fixation-cross-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 80%;
		height: 80vh; /* Or a specific height if you prefer */
		position: relative; /* Or relative, depending on your layout */
		top: 10%;
		left: 10%;
	}
</style>
