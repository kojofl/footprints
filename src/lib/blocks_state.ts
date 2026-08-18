import { PersistedState } from "runed";
import { NumIterations } from "./num_iter_state.js";

/**
 * One block of the experiment. Every trial of a block is presented the same way: with an
 * emotional stimulus, or with a fixation cross in its place.
 */
export interface Block {
	// `number | ""` because clearing the settings input persists an empty string, the same
	// reason the other numeric settings use this shape, see `jitter.ts`.
	trials: number | "";
	stimulus: boolean;
}

/** A single trial resolved from the block list. `block` and `trial_in_block` are 0 based. */
export interface PlannedTrial {
	block: number;
	trial_in_block: number;
	stimulus: boolean;
}

// Seeded from the previous flat trial count so existing installs migrate to a single stimulus
// block of the same length. This is its own storage key rather than a `Settings` field
// because `PersistedState` does not merge defaults into an already stored object.
export const Blocks = new PersistedState<Block[]>("blocks", [
	{ trials: Number(NumIterations.current) || 2, stimulus: true },
]);

export function block_trials(block: Block): number {
	return Math.max(0, Math.floor(Number(block.trials) || 0));
}

export function total_trials(blocks: Block[]): number {
	return blocks.reduce((sum, block) => sum + block_trials(block), 0);
}

/**
 * Flattens the block list into one entry per trial. The index into this array is the global
 * trial counter (`ExperimentIteration`), which never restarts at a block boundary. That is
 * what keeps the image sampling without replacement running across blocks.
 */
export function build_trial_plan(blocks: Block[]): PlannedTrial[] {
	const plan: PlannedTrial[] = [];
	blocks.forEach((block, i) => {
		const trials = block_trials(block);
		for (let trial = 0; trial < trials; trial++) {
			plan.push({ block: i, trial_in_block: trial, stimulus: block.stimulus });
		}
	});
	return plan;
}
