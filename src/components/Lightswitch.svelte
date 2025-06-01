<script lang="ts">
	import { mode } from "$lib/mode_state.js";
	import SunMoon from "@lucide/svelte/icons/sun-moon";

	function onClick() {
		const newMode = mode.current === "dark" ? "light" : "dark";
		mode.current = newMode;
	}
</script>

<nav>
	<button
		class="btn-icon hover:preset-tonal"
		title="Toggle dark mode."
		data-lightswitch
		onclick={onClick}
	>
		<SunMoon size={20} />
	</button>
</nav>
