<script lang="ts">
	import Ongoing from "./Ongoing.svelte";
	import Rating from "./Rating.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { onDestroy, onMount } from "svelte";
	import Baseline from "./Baseline.svelte";
	import { fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import { LsLEvent, publish_event } from "$lib/lsl.js";
	import { create_state_machine } from "$lib/state_machine.js";

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

	const StateMap = {
		baseline: Baseline,
		stimulus: Ongoing,
		go: Ongoing,
		rating: Rating,
	};

	function close() {
		openState = false;
	}

	const experiment_state_machine = create_state_machine(close);

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

	onDestroy(async () => {
		experiment_state_machine.send("cancel");
		URL.revokeObjectURL(img_url);
		await publish_event(LsLEvent.Idle);
	});
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
