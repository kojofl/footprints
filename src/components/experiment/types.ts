import { FiniteStateMachine } from "runed";

export type MyStates = "baseline" | "stimulus" | "go" | "rating";
export type MyEvents = "start" | "s_fin" | "g_fin" | "cancel";

export interface ExperimentStateProps {
	duration: number;
	state_machine: FiniteStateMachine<MyStates, MyEvents>;
	img_url?: string;
}
