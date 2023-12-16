import Serializable from "./Serializable.js"
import SerializableId from "./SerializableId.js";

export default abstract class Entity implements Serializable {
	abstract classId(): SerializableId

	baseUpdate(dt: number) {
		this.updateImpl(dt)
	}
	abstract updateImpl(dt: number): void

	baseRender() {
		this.renderImpl()
	}
	abstract renderImpl(): void

	shouldCleanUp() { return false }
}
