<script lang="ts">
	import { Rating } from "@skeletonlabs/skeleton-svelte";
	import type { ExperimentStateProps } from "./types.js";

	const props: ExperimentStateProps = $props();

	let valence_rating = $state(3);
	let arousal_rating = $state(3);
</script>

<div class="container flex m-auto items-center justify-center h-screen">
	<div class="mx-auto w-full">
		<img class="m-auto" src={props.img_url} alt="stimulus" />
	</div>
	<form
		class="mx-auto w-full m-auto flex flex-col"
		onsubmit={() => props.state_machine.send("cancel")}
	>
		<label class="m-auto">
			<span class="">Valence</span>
			<Rating
				value={valence_rating}
				onValueChange={(e) => (valence_rating = e.value)}
			/>
		</label>
		<label class="m-auto my-5">
			<span class="">Arousal</span>
			<Rating
				value={arousal_rating}
				onValueChange={(e) => (arousal_rating = e.value)}
			/>
		</label>
		<button class="btn" type="submit">Submit</button>
	</form>
</div>
