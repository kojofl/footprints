import { PersistedState } from "runed";

function get_custom_state(): PersistedState<number | ""> {
	const LengthState: PersistedState<number> = new PersistedState("length", 10);
	const originalDescriptor = Object.getOwnPropertyDescriptor(
		Object.getPrototypeOf(LengthState),
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
			LengthState,
			'current',
			{
				set: newSetter,
				get: originalDescriptor.get,
				configurable: true,
				enumerable: originalDescriptor.enumerable
			}
		);
	}
	return LengthState;
}

export const LengthState = get_custom_state();
