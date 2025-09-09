<script lang="ts">
	import { Rating } from "@skeletonlabs/skeleton-svelte";
	import type { ExperimentStateProps } from "./types.js";
	import { Settings } from "$lib/settings_state.js";
	import { SpeedState } from "$lib/speed_state.js";
	import { LengthState } from "$lib/length_state.js";

	const props: ExperimentStateProps = $props();

	let valence_rating = $state(
		Settings.current.rating.valence ? 3 : undefined,
	);
	let arousal_rating = $state(
		Settings.current.rating.arousal ? 3 : undefined,
	);
	let step = $state(Settings.current.rating.valence ? 0 : 1);

	function onKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case "1": {
				if (step === 0) {
					valence_rating = Number(e.key);
				} else {
					arousal_rating = Number(e.key);
				}
				break;
			}
			case "2": {
				if (step === 0) {
					valence_rating = Number(e.key);
				} else {
					arousal_rating = Number(e.key);
				}
				break;
			}
			case "3": {
				if (step === 0) {
					valence_rating = Number(e.key);
				} else {
					arousal_rating = Number(e.key);
				}
				break;
			}
			case "4": {
				if (step === 0) {
					valence_rating = Number(e.key);
				} else {
					arousal_rating = Number(e.key);
				}
				break;
			}
			case "5": {
				if (step === 0) {
					valence_rating = Number(e.key);
				} else {
					arousal_rating = Number(e.key);
				}
				break;
			}
			case "Enter": {
				cont();
			}
		}
	}
	function cont() {
		if (step === 0 && Settings.current.rating.arousal) {
			step++;
		} else {
			props.state_machine.send("rated", {
				baseline_speed: SpeedState.current,
				modification: props.duration.name,
				effective_speed:
					((LengthState.current as number) /
						(props.duration.time / 1000)) *
					3.6,
				name: props.img_name,
				n_valence: props.img_valence,
				n_arousal: props.img_arousal,
				valence: valence_rating,
				arousal: arousal_rating,
			});
		}
	}
</script>

<div class="container flex m-auto items-center justify-center h-screen">
	<div class="mx-auto w-full">
		<img class="m-auto" src={props.img_url} alt="stimulus" />
	</div>
	{#if step === 0}
		<form
			class="mx-auto w-full m-auto flex flex-col"
			onsubmit={() => {
				cont();
			}}
		>
			<label class="m-auto">
				<span class="">Valence</span>
				<Rating
					value={valence_rating}
					onValueChange={(e) => (valence_rating = e.value)}
				/>
			</label>
			<button class="btn" type="submit">Submit</button>
		</form>
	{:else}
		<form
			class="mx-auto w-full m-auto flex flex-col"
			onsubmit={() => cont()}
		>
			<label class="m-auto">
				<span class="">Arousal</span>
				<Rating
					value={arousal_rating}
					onValueChange={(e) => (arousal_rating = e.value)}
				/>
			</label>
			<button class="btn" type="submit">Submit</button>
		</form>
	{/if}
</div>

<svelte:window on:keydown|preventDefault={onKeyDown} />
