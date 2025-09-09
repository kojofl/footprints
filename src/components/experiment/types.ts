import type { MyEvents, MyStates } from "$lib/state_machine.js";
import { FiniteStateMachine } from "runed";

export interface ExperimentStateProps {
	duration: {
		name: string,
		time: number
	};
	state_machine: FiniteStateMachine<MyStates, MyEvents>;
	running: boolean;
	img_valence?: "Low" | "High";
	img_arousal?: "Low" | "High";
	img_name?: string;
	img_url?: string;
}
