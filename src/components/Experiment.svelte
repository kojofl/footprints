<script lang="ts">
	import { Modal } from "@skeletonlabs/skeleton-svelte";
	import ExperimentRunner from "./experiment/ExperimentRunner.svelte";
	let openState = $state(false);
	let speed: number | undefined = $state(undefined);
	let length: number | undefined = $state(undefined);

	function start_experiment() {
		openState = true;
	}
</script>

<h1 class="pb-5">Footprints experiment Setup</h1>

<form class="mx-auto w-full max-w-md space-y-4" onsubmit={start_experiment}>
	<label class="label">
		<span class="label-text">Walking Speed in km/h</span>
		<input
			type="number"
			class="input"
			placeholder="Speed"
			required
			bind:value={speed}
		/>
	</label>
	<label class="label">
		<span class="label-text">Track length in m</span>
		<input
			type="number"
			class="input"
			placeholder="Length in m"
			required
			bind:value={length}
		/>
	</label>
	<button type="submit">Start</button>
	<Modal
		open={openState}
		onOpenChange={(e) => (openState = e.open)}
		contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl min-w-screen min-h-screen"
		backdropClasses="backdrop-blur-sm"
	>
		{#snippet content()}
			<ExperimentRunner bind:openState speed={speed!} length={length!} />
		{/snippet}
	</Modal>
</form>

<style>
	:root {
		font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
		font-size: 16px;
		line-height: 24px;
		font-weight: 400;

		color: #0f0f0f;
		background-color: #f6f6f6;

		font-synthesis: none;
		text-rendering: optimizeLegibility;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		-webkit-text-size-adjust: 100%;
	}

	h1 {
		text-align: center;
	}

	input,
	button {
		border-radius: 8px;
		border: 1px solid transparent;
		padding: 0.6em 1.2em;
		font-size: 1em;
		font-weight: 500;
		font-family: inherit;
		color: #0f0f0f;
		background-color: #ffffff;
		transition: border-color 0.25s;
		box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
	}

	button {
		cursor: pointer;
	}

	button:hover {
		border-color: #396cd8;
	}
	button:active {
		border-color: #396cd8;
		background-color: #e8e8e8;
	}

	input,
	button {
		outline: none;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			color: #f6f6f6;
			background-color: #2f2f2f;
		}

		input,
		button {
			color: #ffffff;
			background-color: #0f0f0f98;
		}
		button:active {
			background-color: #0f0f0f69;
		}
	}
</style>
