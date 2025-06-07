<script lang="ts">
	import { FiniteStateMachine } from "runed";
	import Ongoing from "./Ongoing.svelte";
	import Rating from "./Rating.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import type { MyEvents, MyStates } from "./types.js";
	import { onDestroy, onMount } from "svelte";
	import Baseline from "./Baseline.svelte";
	import { fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import { LsLEvent, publish_event } from "$lib/lsl.js";

	interface Experiment {
		openState: boolean;
		speed: number;
		length: number;
	}

	let { openState = $bindable(), ...data }: Experiment = $props();

	let img_url = $state("");

	onMount(async () => {
		const img_buffer: ArrayBuffer = await invoke("get_image");
		const blob = new Blob([img_buffer], { type: "image/webp" });
		img_url = URL.createObjectURL(blob);
	});

	onDestroy(async () => {
		URL.revokeObjectURL(img_url);
		await publish_event(LsLEvent.Idle);
	});

	const StateMap = {
		baseline: Baseline,
		stimulus: Ongoing,
		go: Ongoing,
		rating: Rating,
	};

	let start = 0;

	const experiment_state_machine = new FiniteStateMachine<MyStates, MyEvents>(
		"baseline",
		{
			baseline: {
				_enter: async () => {
					await publish_event(LsLEvent.Baseline);
				},
				start: "stimulus",
				cancel: () => {
					openState = false;
				},
			},
			stimulus: {
				_enter: async () => {
					await publish_event(LsLEvent.Stimulus);
					experiment_state_machine.debounce(3000, "s_fin");
				},
				s_fin: "go",
				cancel: () => {
					openState = false;
				},
			},
			go: {
				_enter: async () => {
					await publish_event(LsLEvent.Movement);
					start = new Date().getTime();
				},
				g_fin: "rating",
				cancel: () => {
					openState = false;
				},
				_exit: () => {
					console.log((new Date().getTime() - start) / 1000);
				},
			},
			rating: {
				_enter: async () => {
					await publish_event(LsLEvent.Rating);
				},
				cancel: () => {
					openState = false;
				},
			},
		},
	);

	const duration = (data.length / (data.speed / 3.6)) * 1000;

	let State = $state(StateMap[experiment_state_machine.current]);

	$effect(() => {
		State = StateMap[experiment_state_machine.current];
	});

	const flyInConfig = {
		x: 200,
		duration: 500,
		easing: quintOut,
	};

	const flyOutConfig = {
		x: -200,
		duration: 500,
		easing: quintOut,
	};
</script>

{#key State}
	<div
		class="absolute min-w-screen min-h-screen p-4"
		in:fly={flyInConfig}
		out:fly={flyOutConfig}
	>
		<State {duration} state_machine={experiment_state_machine} {img_url} />
	</div>
{/key}
