import Serializable from "./Serializable.js";
import { SerializationSafe } from "./Serialize.js";

/**
 * A callback which can be serialized.
 * 
 * This is a tuple containing an object and the name of a method on that object.
 * The object must be serializable.
 */
type SerializableCallback<T extends Serializable<any, any>, Args extends ReadonlyArray<any> = [], Result = void> = [
	// The object containing the method to call:
	T,
	// A union of all valid method names:
	{[K in keyof T]: K extends SerializationSafe
		? (
			T[K] extends (...a: Args) => Result
				? K
				: never
		) : never}[keyof T]
]
export default SerializableCallback
