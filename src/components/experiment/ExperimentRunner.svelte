<script lang="ts">
	import { FiniteStateMachine } from "runed";
	import Baseline from "./Baseline.svelte";
	import Stimulus from "./Stimulus.svelte";
	import Go from "./Go.svelte";
	import Rating from "./Rating.svelte";
	import type { MyEvents, MyStates } from "./types.js";

	interface Experiment {
		openState: boolean;
		speed: number;
		length: number;
	}

	let { openState = $bindable(), ...data }: Experiment = $props();

	const StateMap = {
		baseline: Baseline,
		stimulus: Stimulus,
		go: Go,
		rating: Rating,
	};

	const f = new FiniteStateMachine<MyStates, MyEvents>("baseline", {
		baseline: {
			start: "stimulus",
			cancel: () => {
				openState = false;
			},
		},
		stimulus: {
			_enter: () => {
				f.debounce(2000, "s_fin");
			},
			s_fin: "go",
			cancel: () => {
				openState = false;
			},
		},
		go: {
			_enter: () => {
				f.debounce(2000, "g_fin");
			},
			g_fin: "rating",
			cancel: () => {
				openState = false;
			},
		},
		rating: {
			_enter: () => {
				f.debounce(2000, "cancel");
			},
			cancel: () => {
				openState = false;
			},
		},
	});

	const step_size = 100 / (((data.length / (data.speed / 3.6)) * 1000) / 5);

	let State = $state(StateMap[f.current]);

	$effect(() => {
		State = StateMap[f.current];
	});
</script>

<State state_machine={f} {step_size} />
