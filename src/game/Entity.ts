import Serializable from "./Serializable.js"
import SerializableId from "./SerializableId.js";

export default abstract class Entity implements Serializable {
	abstract classId(): SerializableId
	abstract update(dt: number): void
	abstract render(): void
}
