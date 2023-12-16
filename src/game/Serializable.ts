import SerializableId from "./SerializableId.js";
import { SerializationSafe } from "./Serialize.js";


export type SerializationForm<T> = RemoveNever<{
	[K in keyof T]: T[K] extends (Record<any, unknown> | Array<unknown>)
			? {_: number}
		: T[K] extends undefined ? never
		: T[K] extends SerializationSafe ? T[K]
		: never
}>

export type DeserializationForm<T> = RemoveNever<{
	[K in keyof T]: T[K] extends (Record<any, unknown> | Array<unknown>)
			? ({_: number} | T[K])
		: T[K] extends (...a:any[]) => any ? never
		: T[K]
}>

export default interface Serializable<T extends Serializable<T, unknown> = never, U = never> {
	classId(): SerializableId
	preSerialization?(): void
	serializationForm?(): U
	postSerialization?(): void
	deserializationForm?(serializationForm: SerializationForm<U>): Promise<DeserializationForm<T>>
	postDeserialize?(): void
}
