import { Settings } from "$lib/settings_state.js";
import { writable } from "svelte/store";


export const TaskInstructions = writable("");


export async function handleTaskInstructionsFile(event: Event) {
	const input = event.target as HTMLInputElement;
	if (input.files && input.files[0]) {
		const file = input.files[0];

		if (file.type === "text/plain") {
			const text = await file.text();

			TaskInstructions.set(text);
			Settings.current.task_instructions = text;
		} else {
			alert("Please upload a .txt file");
		}
	}
}

export function triggerFileUpload(input: HTMLInputElement | null) {
	input?.click();
}

