import { invoke } from "@tauri-apps/api/core";
import type { BlockKind, PlannedTrial } from "./blocks_state.js";

/**
 * Which kind of run a marker belongs to. `calibration`, `test` and `session` are not blocks of
 * the trial plan, they are there so those runs can be told apart from real data in a recording.
 */
export type MarkerBlockType = BlockKind | "calibration" | "test" | "session";

export interface LsLMarkerJson extends Record<string, unknown> {
	block: number,
	block_type: MarkerBlockType,
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

/**
 * A marker for one trial of the plan. `block_type` overrides the trial's own kind, which a test
 * run needs: its plan holds ordinary stimulus trials, only the recording must not confuse them
 * with the real thing.
 */
export function eventFromTrial(trial: PlannedTrial, state: StateMarker, img_data?: number, data?: Record<string, number>, block_type?: MarkerBlockType): LsLMarkerJson {
	return {
		block: trial.block + 1,
		block_type: block_type ?? trial.kind,
		trial: trial.trial_in_block + 1,
		state,
		image_id: img_data,
		data
	}
}

/** Marks the start of a session. It belongs to no block and no trial. */
export function sessionMarker(): LsLMarkerJson {
	return {
		block: 0,
		block_type: "session",
		trial: 0,
		state: "None"
	}
}

export async function publish_event(event: LsLMarkerJson) {
	await invoke("publish_lsl", { event });
}
