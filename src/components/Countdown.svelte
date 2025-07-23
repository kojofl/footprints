<script lang="ts">
	import { Settings } from "$lib/settings_state.js";
	import { onMount } from "svelte";
	import { quintOut } from "svelte/easing";
	import { fly } from "svelte/transition";

	interface Props {
		duration: number;
	}

	const props: Props = $props();

	// We use this to indicate when the debounce is going to happen
	// if we have this at 0 the debounce happens when we display 1.
	// This is arbitrary but i think this looks the best i.e. when
	// specifying duration = 3 you will see 3,2,1,0 and the 3 and 0
	// will be shown slightly shorter.
	let elapsed = $state(600);
	// A countdown of 0 seconds would not make sense
	let duration = $state(Math.max(props.duration, 1) * 1000);

	onMount(() => {
		let last_time = performance.now();

		let frame = requestAnimationFrame(function update(time) {
			frame = requestAnimationFrame(update);

			elapsed += Math.min(time - last_time, duration - elapsed);
			last_time = time;
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	});

	const flyInConfig = {
		y: -30,
		duration: 2000,
		easing: quintOut,
	};

	const flyOutConfig = {
		y: 30,
		duration: 2000,
		easing: quintOut,
	};

	const countdown = $derived(props.duration - Math.floor(elapsed / 1000));
</script>

{#if Settings.current.show_countdown}
	{#key countdown}
		<div
			class="absolute text-lg"
			in:fly={flyInConfig}
			out:fly={flyOutConfig}
		>
			{countdown}s
		</div>
	{/key}
{/if}
