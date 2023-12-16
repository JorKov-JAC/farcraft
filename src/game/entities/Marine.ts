import SerializableId from "../SerializableId.js";
import Unit from "./Unit.js";

export default class Marine extends Unit {
	override getSpeed(): number {
		return 2
	}
	override getRadius(): number {
		return .4
	}
	override getMaxHealth(): number {
		return 40
	}
	override classId(): SerializableId {
		return SerializableId.MARINE
	}
}
