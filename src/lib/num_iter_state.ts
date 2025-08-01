import { PersistedState } from "runed";

export const Nothing = "";

function get_custom_state(): PersistedState<number | ""> {
	const NumIterations: PersistedState<number | ""> = new PersistedState("num_iter", 2);
	const originalDescriptor = Object.getOwnPropertyDescriptor(
		Object.getPrototypeOf(NumIterations),
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
			NumIterations,
			'current',
			{
				set: newSetter,
				get: originalDescriptor.get,
				configurable: true,
				enumerable: originalDescriptor.enumerable
			}
		);
	}
	return NumIterations;
}


export const NumIterations = get_custom_state();
