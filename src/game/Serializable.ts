import SerializableId from "./SerializableId.js";
import { SerializationSafe } from "./Serialize.js";


/** A serializable form of a given type. */
export type SForm<T> = RemoveNever<{
	[K in keyof T]:
		// If the value is an object, we'll store a reference to it as an array
		// of its reference ID:
		T[K] extends (Record<any, unknown> | Array<unknown>) ? [number]
		// Ignore undefined properties:
		: T[K] extends undefined ? never
		// Some other serializable type that can be stored as-is:
		: T[K] extends SerializationSafe ? T[K]
		: never
}>

/**
 * The deserialized form of a given type before references and prototypes have
 * been set.
 */
export type DForm<T> = RemoveNever<{
	[K in keyof T]:
		// Reference to other objects are stored as symbols for now; they can be
		// used to setup references:
		T[K] extends (Record<any, unknown> | Array<unknown>) ? symbol
		// Methods are unavailable:
		: T[K] extends (...a:any[]) => any ? never
		: T[K]
}>

/** A modified {@link DForm} of a given type. */
export type CustomDForm<T> = {
	[K in keyof DForm<T>]: DForm<T>[K] extends symbol
		// References might be set to actual objects while performing custom
		// deserialization:
		? T[K] | symbol
		: DForm<T>[K]
}

/** Gets the {@link CustomDForm} for a given type. */
export type CustomDFormOf<T extends Serializable<T, unknown>>
	= T extends Serializable<T, infer U> ? CustomDForm<U> : never

/** Interface for serializable classes. */
export default interface Serializable<T extends Serializable<T, unknown> = never, U = never> {
	/** Gets the serialization ID for the class. */
	classId(): SerializableId
	/** Called before this object is serialized. */
	preSerialization?(): void
	/**
	 * Returns a custom object which will be serialized instead of this object.
	 */
	serializationForm?(): U
	/** Called after this object is serialized. */
	postSerialization?(): void
	/**
	 * Performs custom deserialization of a raw {@link DForm}.
	 * The result must have a prototype.
	 */
	customDForm?(this: never, dForm: DForm<U>): Promise<CustomDForm<U>>
	/** Called after this object is deserialized. */
	postDeserialize?(): void
}
