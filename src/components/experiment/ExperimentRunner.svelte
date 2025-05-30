<script lang="ts">
	import { FiniteStateMachine } from "runed";
	import Ongoing from "./Ongoing.svelte";
	import Rating from "./Rating.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import type { MyEvents, MyStates } from "./types.js";
	import { onDestroy, onMount } from "svelte";
	import Baseline from "./Baseline.svelte";

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

	onDestroy(() => {
		URL.revokeObjectURL(img_url);
	});

	const StateMap = {
		baseline: Baseline,
		stimulus: Ongoing,
		go: Ongoing,
		rating: Rating,
	};

	const experiment_state_machine = new FiniteStateMachine<MyStates, MyEvents>(
		"baseline",
		{
			baseline: {
				start: "stimulus",
				cancel: () => {
					openState = false;
				},
			},
			stimulus: {
				_enter: () => {
					experiment_state_machine.debounce(3000, "s_fin");
				},
				s_fin: "go",
				cancel: () => {
					openState = false;
				},
			},
			go: {
				g_fin: "rating",
				cancel: () => {
					openState = false;
				},
			},
			rating: {
				_enter: () => {},
				cancel: () => {
					openState = false;
				},
			},
		},
	);

	const step_size = 100 / (((data.length / (data.speed / 3.6)) * 1000) / 5);

	let State = $state(StateMap[experiment_state_machine.current]);

	$effect(() => {
		State = StateMap[experiment_state_machine.current];
	});
</script>

<State {step_size} state_machine={experiment_state_machine} {img_url} />
