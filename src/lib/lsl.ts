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

/**
 * The phase a marker belongs to. The `Calibration*` values only ever appear on a marker whose
 * `block_type` is `calibration`.
 */
export type StateMarker = "None" |
	"Baseline" |
	"Stimulus" |
	"Go" |
	"RatingPrompt" |
	"RatingValance" |
	"RatingArousal" |
	"CalibrationStart" |
	"CalibrationStop" |
	"CalibrationDiscarded" |
	"CalibrationConfirmed" |
	"CalibrationResult";

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

/** The largest value the 16 bit `image_id` slot can hold. */
const MAX_IMAGE_ID = 65535;

export interface CalibrationDetails {
	/** Calibrated speed in km/h, only on the `CalibrationResult` marker. */
	result_speed?: number
}

/**
 * A marker of the speed calibration, which has no block and no trial plan of its own: the trial
 * is the calibration step and the state alone says what happened to it.
 *
 * A calibration has no image, so the `image_id` slot carries the calibrated speed as km/h * 100.
 * Two decimals is exactly what the value has, and the 8 bit payload could not hold it.
 */
export function calibrationMarker(step: number, state: StateMarker, details: CalibrationDetails = {}): LsLMarkerJson {
	// A mis-measured step can produce an absurd speed, and anything above the slot's range would
	// fail to deserialize into a u16 and reject the whole marker.
	const speed_fixed_point = details.result_speed === undefined
		? undefined
		: Math.min(MAX_IMAGE_ID, Math.max(0, Math.round(details.result_speed * 100)));

	return {
		block: 0,
		block_type: "calibration",
		trial: step,
		state,
		image_id: speed_fixed_point,
		speed: "none"
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

/**
 * Publishes without blocking the caller, for the synchronous event handlers of the calibration.
 * Those drive a timer and must not wait on an IPC round trip.
 */
export function publish_event_detached(event: LsLMarkerJson): void {
	publish_event(event).catch((e) => console.error("Failed to publish an LsL marker", e));
}
