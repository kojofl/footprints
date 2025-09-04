// We use a custom debounce in favor of the inbuilt state machine debounce so we can cancel
// the state change when the experiment is stoped so no more lsl events get triggered.

import { FiniteStateMachine, useDebounce } from "runed";
import type { MyEvents, MyStates } from "./state_machine.js";

export const baseline_debounce = (sm: FiniteStateMachine<MyStates, MyEvents>, delay: number) => {
	console.log(delay);
	useDebounce(
		() => {
			sm.send("start");
		},
		() => delay
	)();
}

export const stimulus_debounce = (sm: FiniteStateMachine<MyStates, MyEvents>, delay: number) => {
	console.log(delay);
	useDebounce(
		() => {
			sm.send("s_fin");
		},
		() => delay
	)();
}

