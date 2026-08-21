import { invoke } from "@tauri-apps/api/core";
import type { BlockKind, PlannedTrial } from "./blocks_state.js";
import type { SpeedKind } from "./durations.js";

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
	speed?: SpeedKind,
	data?: Record<string, number>
}

type StateMarker = "None" |
	"Baseline" |
	"Stimulus" |
	"Go" |
	"RatingPrompt" |
	"RatingValance" |
	"RatingArousal";

/** Everything about a marker that the trial itself does not determine. */
export interface MarkerDetails {
	/** Stimulus image of the trial, left out on trials that show none. */
	image_id?: number,
	/** Walking condition of the trial, defaults to `none` for the slots without walking. */
	speed?: SpeedKind,
	/** Payload, externally tagged to match the Rust `MarkerPayload`, e.g. `{ Rating: 5 }`. */
	data?: Record<string, number>,
	/**
	 * Overrides the trial's own kind, which a test run needs: its plan holds ordinary stimulus
	 * trials, only the recording must not confuse them with the real thing.
	 */
	block_type?: MarkerBlockType
}

/** A marker for one trial of the plan. */
export function eventFromTrial(trial: PlannedTrial, state: StateMarker, details: MarkerDetails = {}): LsLMarkerJson {
	return {
		block: trial.block + 1,
		block_type: details.block_type ?? trial.kind,
		trial: trial.trial_in_block + 1,
		state,
		image_id: details.image_id,
		speed: details.speed ?? "none",
		data: details.data
	}
}

/** Marks the start of a session. It belongs to no block and no trial. */
export function sessionMarker(): LsLMarkerJson {
	return {
		block: 0,
		block_type: "session",
		trial: 0,
		state: "None",
		speed: "none"
	}
}

export async function publish_event(event: LsLMarkerJson) {
	await invoke("publish_lsl", { event });
}
