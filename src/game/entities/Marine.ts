import SerializableId from "../SerializableId.js";
import Unit from "./Unit.js";

export default class Marine extends Unit {
	override getSpeed(): number {
		return 1
	}
	override getRadius(): number {
		return .5
	}
	override getMaxHealth(): number {
		return 40
	}
	override classId(): SerializableId {
		return SerializableId.MARINE
	}
}
