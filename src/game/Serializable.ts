import SerializableId from "./SerializableId.js";
import { SerializationSafe } from "./Serialize.js";


type SerializationForm<T> = RemoveNever<{
	[K in keyof T]: T[K] extends (Record<any, unknown> | Array<unknown>)
			? {_: number}
		: T[K] extends undefined ? never
		: T[K] extends SerializationSafe ? T[K]
		: never
}>

export default interface Serializable<T extends Serializable<T, unknown>, U = never> {
	classId(): SerializableId
	deserialize?(serializationForm: SerializationForm<U>): Promise<T>
	prepareForSerialization?(): U
}
