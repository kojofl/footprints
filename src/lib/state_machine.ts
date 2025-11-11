import { FiniteStateMachine, PersistedState } from "runed";
import { LsLEvent, publish_event } from "./lsl.js";
import { invoke } from "@tauri-apps/api/core";
import { stimulus_debounce } from "./debounce.js";
import { Settings } from "./settings_state.js";
import { StimulusModState } from "./stimulus_time_mod.js";
export type MyStates = "baseline" | "stimulus" | "go" | "rating" | "canceled";
export type MyEvents = "start" | "s_fin" | "g_fin" | "rated" | "cancel";

// global reactive variable to track the experiment progress
export const ExperimentIteration = new PersistedState("ex_iter", 0);

interface Log {
	baseline_time: string,
	stimulus_time: string,
	go_time: string,
	rating_time: string,
}

export function create_state_machine(cancel_callback: () => void, iterations: number = 2): FiniteStateMachine<MyStates, MyEvents> {
	// We just created the experiment state machine so we are in the first iteration.
	ExperimentIteration.current = 0;

	let log: Log = {
		baseline_time: "",
		stimulus_time: "",
		go_time: "",
		rating_time: ""
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
					const max = StimulusModState.current.duration + StimulusModState.current.jitter;
					const min = StimulusModState.current.duration - StimulusModState.current.jitter;
					let random = Math.random() * (max - min + 1) + min;
					console.log(max, min, random);
					console.log(max, min, random);
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
				g_fin: "rating",
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
					let x = { ...log, ...data };
					console.log(x);
					invoke("add_rating", { rating: x });

					ExperimentIteration.current += 1;
					if (ExperimentIteration.current < iterations) {
						return "baseline"
					} else {
						// fertig save data
						cancel_callback();
					}
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

