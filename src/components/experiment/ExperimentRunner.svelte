<script lang="ts">
	import Ongoing from "./Ongoing.svelte";
	import Rating from "./Rating.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { onDestroy } from "svelte";
	import Baseline from "./Baseline.svelte";
	import { fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";
	import { LsLEvent, publish_event } from "$lib/lsl.js";
	import {
		create_state_machine,
		ExperimentIteration,
	} from "$lib/state_machine.js";
	import { resource, watch } from "runed";
	import { SpeedState } from "$lib/speed_state.js";
	import { NumIterations } from "$lib/num_iter_state.js";
	import { Settings } from "$lib/settings_state.js";

	interface Experiment {
		openState: boolean;
		length: number;
	}

	let { openState = $bindable(), ...data }: Experiment = $props();

	let running = $state(false);

	const img_url = resource(
		() => ExperimentIteration.current,
		async (_url, _prev_url, { data, onCleanup }) => {
			onCleanup(() => {
				URL.revokeObjectURL(data);
			});

			const img_buffer: ArrayBuffer = await invoke("get_image");
			const blob = new Blob([img_buffer], { type: "image/webp" });
			return URL.createObjectURL(blob);
		},
	);

	const StateMap = {
		baseline: Baseline,
		stimulus: Ongoing,
		go: Ongoing,
		rating: Rating,
	};

	function close() {
		openState = false;
	}

	const experiment_state_machine = create_state_machine(
		close,
		NumIterations.current as number,
	);

	function expandArray(arr: any[], n: number) {
		console.log(arr, n);
		const repeats = Math.ceil(n / arr.length);
		console.log(repeats);

		return arr.flatMap((element) => Array(repeats).fill(element));
	}

	let durations = $derived.by(() => {
		let base = [
			{
				name: "Normal",
				time:
					(data.length / ((SpeedState.current as number) / 3.6)) *
					1000,
			},
		];
		const mask: [boolean, string, number][] = [
			[Settings.current.very_slow, "Very slow", 1.2],
			[Settings.current.slow, "Slow", 1.1],
			[Settings.current.fast, "Fast", 0.9],
			[Settings.current.very_fast, "Very fast", 0.8],
		];
		for (const el of mask) {
			if (el[0]) {
				base.push({
					name: el[1],
					time: base[0].time * el[2],
				});
			}
		}
		let arr = expandArray(base, NumIterations.current as number);
		for (var i = arr.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		console.log(arr);
		return arr;
	});
	let index = $state(0);
	watch(
		() => ExperimentIteration.current,
		() => {
			index += 1;
		},
	);

	let State = $state(StateMap[experiment_state_machine.current]);

	$effect(() => {
		State = StateMap[experiment_state_machine.current];
	});

	onDestroy(async () => {
		experiment_state_machine.send("cancel");
		URL.revokeObjectURL(img_url.current!);
		await publish_event(LsLEvent.Idle);
	});
</script>

{#key State}
	<div
		class="absolute min-w-screen min-h-screen p-4"
		in:fly={{
			x: 200,
			duration: 500,
			easing: quintOut,
		}}
		out:fly={{
			x: -200,
			duration: 500,
			easing: quintOut,
		}}
	>
		<State
			bind:running
			duration={durations[index]}
			state_machine={experiment_state_machine}
			img_url={img_url.current}
		/>
	</div>
{/key}
