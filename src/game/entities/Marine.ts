import Anim from "../Anim.js";
import SerializableId from "../SerializableId.js";
import { ArmyEntityArgs } from "./ArmyEntity.js";
import Unit from "./Unit.js";

export default class Marine extends Unit<"marine">  {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(args: Omit<ArmyEntityArgs<"marine">, "initialAnimation">) {
		super({...args, initialAnimation: new Anim("marine", "idle")})
	}
	
	override updateImpl(dt: number): void {
		super.updateImpl(dt)

		const maxSpeed = this.getSpeed()
		const radius = this.getRadius()
		const speed = this.vel.mag()
		if (this.vel.mag() > maxSpeed * .1) {
			if (this.anim.animationName !== "move") {
				this.anim = new Anim("marine", "move")
			}

			this.anim.advance(speed / (radius * 2) * dt)
		} else {
			if (this.anim.animationName === "move")
			this.anim = new Anim("marine", "idle")
		}
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
