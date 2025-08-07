import { FiniteStateMachine, PersistedState, useDebounce } from "runed";
import { LsLEvent, publish_event } from "./lsl.js";
import { invoke } from "@tauri-apps/api/core";
export type MyStates = "baseline" | "stimulus" | "go" | "rating";
export type MyEvents = "start" | "s_fin" | "g_fin" | "rated" | "cancel";

// We use a custom debounce in favor of the inbuilt state machine debounce so we can cancel
// the state change when the experiment is stoped so no more lsl events get triggered.
export const baseline_debounce = useDebounce(
	(sm: FiniteStateMachine<MyStates, MyEvents>) => {
		sm.send("start");
	},
	() => 2000
);

export const stimulus_debounce = useDebounce(
	(sm: FiniteStateMachine<MyStates, MyEvents>) => {
		sm.send("s_fin");
	},
	() => 3000
);

// global reactive variable to track the experiment progress
export const ExperimentIteration = new PersistedState("ex_iter", 0);

export function create_state_machine(cancel_callback: () => void, iterations: number = 2): FiniteStateMachine<MyStates, MyEvents> {
	// We just created the experiment state machine so we are in the first iteration.
	ExperimentIteration.current = 0;
	const experiment_state_machine = new FiniteStateMachine<MyStates, MyEvents>(
		"baseline",
		{
			baseline: {
				_enter: async () => {
					await publish_event(LsLEvent.Baseline);
				},
				start: () => {
					return "stimulus";
				},
				cancel: () => {
					baseline_debounce.cancel();
					cancel_callback();
				},
			},
			stimulus: {
				_enter: async () => {
					await publish_event(LsLEvent.Stimulus);
					stimulus_debounce(experiment_state_machine).catch((e) => {
						if (e === "Cancelled") {
							return;
						}
						throw e;
					});
				},
				s_fin: "go",
				cancel: () => {
					stimulus_debounce.cancel();
					cancel_callback();
				},
			},
			go: {
				_enter: async () => {
					await publish_event(LsLEvent.Movement);
				},
				g_fin: "rating",
				cancel: () => {
					cancel_callback();
				},
				_exit: () => {
				},
			},
			rating: {
				_enter: async () => {
					await publish_event(LsLEvent.Rating);
				},
				rated: (data: any) => {
					invoke("add_rating", { rating: data });
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
		},
	);
	return experiment_state_machine
}

