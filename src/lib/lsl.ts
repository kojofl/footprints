import { invoke } from "@tauri-apps/api/core";

export enum LsLEvent {
	Idle = "Idle",
	Baseline = "Baseline",
	Stimulus = "Stimulus",
	Movement = "Movement",
	Rating = "Rating"
}

export async function publish_event(event: LsLEvent) {
	await invoke("publish_lsl", { event });
}
