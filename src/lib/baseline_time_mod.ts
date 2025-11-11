import { PersistedState } from "runed";

interface BaselineMod {
	duration: number | "",
	jitter: number | ""
}

function get_custom_state(): PersistedState<BaselineMod> {
	const BaselineModState: PersistedState<BaselineMod> = new PersistedState("BaselineMod", {
		duration: 2.5,
		jitter: 0.5
	});
	const originalDescriptor = Object.getOwnPropertyDescriptor(
		Object.getPrototypeOf(BaselineModState),
		'current'
	);

	if (!originalDescriptor || !originalDescriptor.set) {
		console.error("Could not find original setter for 'current'. Patching aborted.");
	} else {
		const originalSetter = originalDescriptor.set;

		const newSetter = function(this: { set: (newValue: number | null | "") => void; get: (() => any) | undefined; configurable: true; enumerable: boolean | undefined; }, newValue: number | null | "") {
			let valueToSet = newValue;
			if (newValue === null) {
				valueToSet = "";
			}

			originalSetter.call(this, valueToSet);
		};

		Object.defineProperty(
			BaselineModState,
			'current',
			{
				set: newSetter,
				get: originalDescriptor.get,
				configurable: true,
				enumerable: originalDescriptor.enumerable
			}
		);
	}
	return BaselineModState;
}

export const BaselineModState = get_custom_state();
