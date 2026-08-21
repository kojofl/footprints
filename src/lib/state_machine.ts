import { FiniteStateMachine, PersistedState } from "runed";
import { eventFromTrial, publish_event } from "./lsl.js";
import { invoke } from "@tauri-apps/api/core";
import { stimulus_debounce } from "./debounce.js";
import { StimulusModState } from "./stimulus_time_mod.js";
import { jittered_duration } from "./jitter.js";
import type { PlannedTrial } from "./blocks_state.js";
import { Settings } from "./settings_state.js";
import type { Duration } from "./durations.js";
import { SpeedState } from "./speed_state.js";
import { LengthState } from "./length_state.js";
import type { TrialImages } from "./trial_images.svelte.js";
export type MyStates = "baseline" | "stimulus" | "go" | "rating" | "confirm" | "pause" | "canceled";
export type MyEvents = "start" | "s_fin" | "g_fin" | "rated" | "confirmed" | "continued" | "cancel" | "publishLsL";

// global reactive variable to track the experiment progress
export const ExperimentIteration = new PersistedState("ex_iter", 0);

interface Log {
	baseline_time: string,
	stimulus_time: string,
	go_time: string,
	rating_time: string,
}

export function create_state_machine(cancel_callback: () => void, plan: PlannedTrial[], durations: Duration[], images: TrialImages): FiniteStateMachine<MyStates, MyEvents> {
	// We just created the experiment state machine so we are in the first iteration.
	ExperimentIteration.current = 0;

	// Nothing to run: the block configuration is empty. The machine has to start in the inert
	// `canceled` state, because every other state stamps a marker from `plan[…]` on entry and
	// would dereference a trial that does not exist.
	if (plan.length === 0) {
		const empty = new FiniteStateMachine<MyStates, MyEvents>("canceled", {
			baseline: {}, stimulus: {}, go: {}, rating: {}, confirm: {}, pause: {}, canceled: {},
		});
		cancel_callback();
		return empty;
	}

	let log: Log = {
		baseline_time: "",
		stimulus_time: "",
		go_time: "",
		rating_time: ""
	}

	// Advances the global trial counter and returns the next state, or ends the experiment.
	// A pause block renders its own screen; every other entry starts a fresh trial at the
	// baseline. No logging happens here, so pauses never write a trial row.
	function next_state(): MyStates | void {
		ExperimentIteration.current += 1;
		if (ExperimentIteration.current < plan.length) {
			return plan[ExperimentIteration.current].kind === "pause" ? "pause" : "baseline";
		} else {
			// fertig save data
			cancel_callback();
		}
	}

	// Logs the finished trial and moves on. Shared by the rating screen and by the
	// confirmation screen that replaces it on trials without a stimulus. The block bookkeeping
	// is stamped here so the screens never need to know about blocks.
	function advance(data: any): MyStates | void {
		const trial = plan[ExperimentIteration.current];
		const duration = durations[ExperimentIteration.current];
		let x = {
			...log,
			...data,
			baseline_speed: SpeedState.current,
			modification: duration.name,
			effective_speed:
				((LengthState.current as number) /
					(duration.time / 1000)) *
				3.6,
			name: images.current?.name,
			n_valence: images.current?.valence,
			n_arousal: images.current?.arousal,
			block: trial.block + 1,
			trial_in_block: trial.trial_in_block + 1,
			has_stimulus: trial.kind === "stimulus",
		};
		console.log(x);
		invoke("add_rating", { rating: x });

		return next_state();
	}

	// A pause block can be the very first entry, in which case the run opens on the break.
	const initial: MyStates = plan[0]?.kind === "pause" ? "pause" : "baseline";

	const experiment_state_machine = new FiniteStateMachine<MyStates, MyEvents>(
		initial,
		{
			baseline: {
				_enter: async () => {
					log.baseline_time = new Date().toISOString();
					const iteration = ExperimentIteration.current;
					// Resolves right away, the image was prefetched during the previous trial.
					// Only then does `images.current` belong to this trial.
					await images.promote(iteration);
					await publish_event(eventFromTrial(plan[iteration], "Baseline", images.current?.id));
					images.prefetch(iteration + 1);
				},
				start: () => {
					return "stimulus";
				},
				cancel: () => {
					cancel_callback();
					return "canceled";
				},
			},
			stimulus: {
				_enter: async () => {
					log.stimulus_time = new Date().toISOString();
					const trial = plan[ExperimentIteration.current];
					await publish_event(eventFromTrial(trial, "Stimulus", images.current?.id));
					const random = jittered_duration(StimulusModState.current);
					stimulus_debounce(experiment_state_machine, random * 1000)
				},
				s_fin: "go",
				cancel: () => {
					cancel_callback();
					return "canceled";
				},
			},
			go: {
				_enter: async () => {
					log.go_time = new Date().toISOString();
					const trial = plan[ExperimentIteration.current];
					await publish_event(eventFromTrial(trial, "Go", images.current?.id));
				},
				// Without a stimulus there is nothing to rate, the subject only confirms.
				g_fin: () => {
					return plan[ExperimentIteration.current]?.kind === "stimulus" &&
						(Settings.current.rating.arousal || Settings.current.rating.valence) ? "rating" : "confirm";
				},
				cancel: () => {
					cancel_callback();
					return "canceled";
				},
				_exit: () => {
				},
			},
			rating: {
				_enter: async () => {
					log.rating_time = new Date().toISOString();
					const trial = plan[ExperimentIteration.current];
					await publish_event(eventFromTrial(trial, "RatingPrompt", images.current?.id));
				},
				rated: (data: any) => {
					return advance(data);
				},
				cancel: () => {
					cancel_callback();
				},
			},
			// Stands in for `rating` on trials without a stimulus. It reuses the `Rating`
			// marker, the response phase is the same, only the CSV `has_stimulus` column
			// tells the two apart.
			confirm: {
				_enter: async () => {
					log.rating_time = new Date().toISOString();
					const trial = plan[ExperimentIteration.current];
					await publish_event(eventFromTrial(trial, "RatingPrompt", images.current?.id));
				},
				confirmed: (data: any) => {
					return advance(data);
				},
				cancel: () => {
					cancel_callback();
				},
			},
			// A break between blocks. It carries no trial, so it neither logs nor takes an
			// image out of the pool; it only waits for the experimenter to continue. Reuses the
			// Idle marker until the marker system is reworked.
			pause: {
				_enter: async () => {
					const iteration = ExperimentIteration.current;
					// A pause shows no image; promoting clears the one from the trial before it.
					await images.promote(iteration);
					await publish_event(eventFromTrial(plan[iteration], "None", images.current?.id));
					images.prefetch(iteration + 1);
				},
				continued: () => {
					return next_state();
				},
				cancel: () => {
					cancel_callback();
					return "canceled";
				},
			},
			// This is used to pseudo cancel the debounce since those are now created on the fly 
			// there is no trivial way of canceling them. To work around this we now have the caneceled
			// state. This state is only ever used when the experiment has been canceled and intentionally
			// has no event handlers. This leads to all ongoing debounces to fire without effect.
			canceled: {}
		},
	);
	return experiment_state_machine
}

