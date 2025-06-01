<script lang="ts">
	import "../app.css";
	import { mode } from "$lib/mode_state.js";

	let { children } = $props();
	$effect(() => {
		document.documentElement.setAttribute("data-mode", mode.current);
	});
</script>

{@render children?.()}
