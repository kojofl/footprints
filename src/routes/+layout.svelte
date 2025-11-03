<script lang="ts">
	import "../app.css";
	import { mode } from "$lib/mode_state.js";
	import { getCurrentWindow } from "@tauri-apps/api/window";

	let { children } = $props();
	$effect(() => {
		document.documentElement.setAttribute("data-mode", mode.current);
	});

	async function onKeyDown(e: KeyboardEvent) {
		if (e.key === "F11") {
			const w = getCurrentWindow();
			const set = await w.isFullscreen();
			await w.setFullscreen(!set);
		}
	}
</script>

{@render children?.()}

<svelte:window on:keydown|preventDefault={onKeyDown} />
