import SerializableId from "./SerializableId.js";
import { SerializationSafe } from "./Serialize.js";


export type SForm<T> = RemoveNever<{
	[K in keyof T]: T[K] extends (Record<any, unknown> | Array<unknown>)
			? [number]
		: T[K] extends undefined ? never
		: T[K] extends SerializationSafe ? T[K]
		: never
}>

export type DForm<T> = RemoveNever<{
	[K in keyof T]: T[K] extends (Record<any, unknown> | Array<unknown>)
			? symbol
		: T[K] extends (...a:any[]) => any ? never
		: T[K]
}>

export type CustomDForm<T> = {
	[K in keyof DForm<T>]: DForm<T>[K] extends symbol
		? T[K] | symbol
		: DForm<T>[K]
}

export type CustomDFormOf<T extends Serializable<T, unknown>>
	= T extends Serializable<T, infer U> ? CustomDForm<U> : never

export default interface Serializable<T extends Serializable<T, unknown> = never, U = never> {
	classId(): SerializableId
	preSerialization?(): void
	serializationForm?(): U
	postSerialization?(): void
	/** The result must have a prototype */
	customDForm?(this: never, dForm: DForm<U>): Promise<CustomDForm<U>>
	postDeserialize?(): void
}
