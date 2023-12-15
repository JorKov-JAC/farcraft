import SerializableId from "./SerializableId.js";

export default interface Serializable<T extends object = never> {
	classId(): SerializableId
	deserialize?(serializable: T): Promise<object>
	/** If the resulting object references other objects, it must hold the sole
	 * reference to them. */
	prepareForSerialization?(): T
}
