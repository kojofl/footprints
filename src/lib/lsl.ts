import { invoke } from "@tauri-apps/api/core";
import type { BlockKind, PlannedTrial } from "./blocks_state.js";

export enum LsLEvent {
	Idle = "Idle",
	Baseline = "Baseline",
	Stimulus = "Stimulus",
	Movement = "Movement",
	Rating = "Rating"
}

export interface LsLMarkerJson extends Record<string, unknown> {
	block: number,
	block_type: BlockKind | "calibration",
	trial: number,
	state: StateMarker,
	image_id?: number,
	data?: Record<string, number>
}

type StateMarker = "None" |
	"Baseline" |
	"Stimulus" |
	"Go" |
	"RatingPrompt" |
	"RatingValance" |
	"RatingArousal";

export function eventFromTrial(trial: PlannedTrial, state: StateMarker, img_data?: number, data?: Record<string, number>): LsLMarkerJson {
	return {
		block: trial.block + 1,
		block_type: trial.kind,
		trial: trial.trial_in_block + 1,
		state,
		image_id: img_data,
		data
	}
}

export async function publish_event(event: LsLMarkerJson) {
	await invoke("publish_lsl", { event });
}
