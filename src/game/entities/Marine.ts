import SerializableId from "../SerializableId.js";
import Unit from "./Unit.js";

export default class Marine extends Unit {
	override getMaxHealth(): number {
		throw new Error("Method not implemented.");
	}
	override updateImpl(dt: number): void {
		super.updateImpl(dt)
		throw new Error("Method not implemented.");
	}
	override render(): void {
		super.render()
		throw new Error("Method not implemented.");
	}
	override classId(): SerializableId {
		return SerializableId.MARINE
	}
}
