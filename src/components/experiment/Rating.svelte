<script lang="ts">
	import { Rating } from "@skeletonlabs/skeleton-svelte";
	import type { ExperimentStateProps } from "./types.js";

	const props: ExperimentStateProps = $props();

	let valence_rating = $state(3);
	let arousal_rating = $state(3);
	let step = $state(0);

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
				if (step === 0) {
					step++;
				} else {
					props.state_machine.send("rated");
				}
			}
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
			onsubmit={() => step++}
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
			onsubmit={() => props.state_machine.send("rated")}
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
