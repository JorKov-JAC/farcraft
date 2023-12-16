import Serializable from "./Serializable.js";
import { SerializationSafe } from "./Serialize.js";

type SerializableCallback<T extends Serializable<any, any>, Args extends Array<any> = [], Result = void> = [
	T,
	{[K in keyof T]: K extends SerializationSafe
		? (
			T[K] extends (...a: Args) => Result
				? K
				: never
		) : never}[keyof T]
]
export default SerializableCallback
