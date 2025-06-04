<script lang="ts">
	import Countdown from "$components/Countdown.svelte";
	import { fade } from "svelte/transition";
	import type { ExperimentStateProps } from "./types.js";
	import { Channel, invoke } from "@tauri-apps/api/core";

	const { state_machine, step_size, img_url }: ExperimentStateProps =
		$props();
	let progress = $state(0);

	let start_go = $state(false);

	async function pause() {}

	type LoadingEvent =
		| {
				event: "update";
				data: {
					val: number;
				};
		  }
		| {
				event: "finish";
		  };
	const onEvent = new Channel<LoadingEvent>();

	onEvent.onmessage = (m) => {
		if (m.event === "finish") {
			state_machine.send("g_fin");
		} else {
			progress = m.data.val;
		}
	};

	async function start() {
		await invoke("register_loading_bar", {
			stepSize: step_size,
			onEvent,
		});
	}

	$effect(() => {
		if (state_machine.current === "go") {
			start_go = true;
			Promise.resolve(start());
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
