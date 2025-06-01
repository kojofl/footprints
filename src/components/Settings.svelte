<script lang="ts">
	import Lightswitch from "./Lightswitch.svelte";

	let { openState = $bindable() } = $props();
	function save() {
		openState = false;
	}
</script>

<div class="flex justify-between">
	<h3 class="h3">Settings</h3>
	<Lightswitch />
</div>

<form class="space-y-2" onsubmit={save}>
	<div class="space-y-2">
		<span class="label-text text-lg">Some select setting:</span>
		<label class="flex items-center space-x-2">
			<input
				class="radio"
				type="radio"
				checked
				name="radio-direct"
				value="1"
			/>
			<p>Option 1</p>
		</label>
		<label class="flex items-center space-x-2">
			<input class="radio" type="radio" name="radio-direct" value="2" />
			<p>Option 2</p>
		</label>
		<label class="flex items-center space-x-2">
			<input class="radio" type="radio" name="radio-direct" value="3" />
			<p>Option 3</p>
		</label>
		<span class="label-text text-lg">Some on/off setting:</span>
		<label class="flex items-center space-x-2">
			<input class="checkbox" type="checkbox" checked />
			<p>Option 1</p>
		</label>
		<label class="flex items-center space-x-2">
			<input class="checkbox" type="checkbox" />
			<p>Option 2</p>
		</label>
		<label class="flex items-center space-x-2">
			<input class="checkbox" type="checkbox" />
			<p>Option 3</p>
		</label>
		<button class="btn preset-filled-primary-500">Save</button>
	</div>
</form>
