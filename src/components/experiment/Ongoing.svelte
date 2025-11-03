<script lang="ts">
	import Countdown from "$components/Countdown.svelte";
	import { fade } from "svelte/transition";
	import type { ExperimentStateProps } from "./types.js";
	import { onDestroy } from "svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { Settings } from "$lib/settings_state.js";

	const { state_machine, duration, img_url }: ExperimentStateProps = $props();

	let start_go = $derived(state_machine.current !== "stimulus");
	let tracker: HTMLDivElement | undefined = $state();
	// svelte-ignore non_reactive_update
	let animation: Animation;

	async function pause() {
		animation.pause();
	}

	async function play() {
		animation.play();
	}

	async function start() {
		if (Settings.current.sound_cue) {
			await invoke("play_sound");
		}
		animation = tracker!.animate([{ right: "100%" }, { right: "0" }], {
			duration: duration.time,
			easing: "linear",
		});
		animation.onfinish = () => {
			state_machine.send("g_fin");
		};
	}

	$effect(() => {
		if (tracker) {
			start();
		}
	});

	onDestroy(() => {
		if (animation) {
			animation.cancel();
		}
	});
</script>

<div class="fixation-cross-container">
	<img style="width: 55vw;" src={img_url} alt="stimulus" />
</div>
<div class="flex flex-col mt-6">
	{#if start_go}
		<div class="flex container m-auto">
			<div
				class="relative h-15 w-full overflow-clip rounded-md bg-lime-100"
			>
				<div
					class="bg-lime-600 absolute h-full w-full"
					bind:this={tracker}
				></div>
			</div>
		</div>
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
		height: 80vh;
		position: relative;
		top: 10%;
		left: 10%;
	}
</style>
