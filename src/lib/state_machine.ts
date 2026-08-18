import { FiniteStateMachine, PersistedState } from "runed";
import { LsLEvent, publish_event } from "./lsl.js";
import { invoke } from "@tauri-apps/api/core";
import { stimulus_debounce } from "./debounce.js";
import { StimulusModState } from "./stimulus_time_mod.js";
import { jittered_duration } from "./jitter.js";
import type { PlannedTrial } from "./blocks_state.js";
export type MyStates = "baseline" | "stimulus" | "go" | "rating" | "confirm" | "canceled";
export type MyEvents = "start" | "s_fin" | "g_fin" | "rated" | "confirmed" | "cancel";

// global reactive variable to track the experiment progress
export const ExperimentIteration = new PersistedState("ex_iter", 0);

interface Log {
	baseline_time: string,
	stimulus_time: string,
	go_time: string,
	rating_time: string,
}

export function create_state_machine(cancel_callback: () => void, plan: PlannedTrial[]): FiniteStateMachine<MyStates, MyEvents> {
	// We just created the experiment state machine so we are in the first iteration.
	ExperimentIteration.current = 0;

	let log: Log = {
		baseline_time: "",
		stimulus_time: "",
		go_time: "",
		rating_time: ""
	}

	// Logs the finished trial and moves on, or ends the experiment. Shared by the rating
	// screen and by the confirmation screen that replaces it on trials without a stimulus.
	// The block bookkeeping is stamped here so the screens never need to know about blocks.
	function advance(data: any): MyStates | void {
		const trial = plan[ExperimentIteration.current];
		let x = {
			...log,
			...data,
			block: trial.block + 1,
			trial_in_block: trial.trial_in_block + 1,
			has_stimulus: trial.stimulus,
		};
		console.log(x);
		invoke("add_rating", { rating: x });

		ExperimentIteration.current += 1;
		if (ExperimentIteration.current < plan.length) {
			return "baseline"
		} else {
			// fertig save data
			cancel_callback();
		}
	}

	const experiment_state_machine = new FiniteStateMachine<MyStates, MyEvents>(
		"baseline",
		{
			baseline: {
				_enter: async () => {
					log.baseline_time = new Date().toISOString();
					await publish_event(LsLEvent.Baseline);
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
					await publish_event(LsLEvent.Stimulus);
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
					await publish_event(LsLEvent.Movement);
				},
				// Without a stimulus there is nothing to rate, the subject only confirms.
				g_fin: () => {
					return plan[ExperimentIteration.current]?.stimulus ? "rating" : "confirm";
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
					await publish_event(LsLEvent.Rating);
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
					await publish_event(LsLEvent.Rating);
				},
				confirmed: (data: any) => {
					return advance(data);
				},
				cancel: () => {
					cancel_callback();
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

