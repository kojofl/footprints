<script lang="ts">
	let { children } = $props();
</script>

<div class="bg-primary-500/25 h-full">
	{@render children?.()}
</div>
