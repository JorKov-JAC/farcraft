import { ImageGroupName } from "../../assets.js";
import Anim from "../Anim.js";
import SerializableId from "../SerializableId.js";
import { ArmyEntityArgs } from "./ArmyEntity.js";
import Unit from "./Unit.js";

export default class Marine extends Unit<"marine">  {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(args: Omit<ArmyEntityArgs<"marine">, "initialAnimation">) {
		args.initialAnimation = new Anim("marine", "idle")
		super(args)
	}

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
