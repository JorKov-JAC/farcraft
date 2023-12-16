import { ImageGroupName } from "../../assets.js";
import Anim from "../Anim.js";
import ArmyEntity, { Owner } from "./ArmyEntity.js";

export default class Corpse<T extends ImageGroupName> extends ArmyEntity<T> {
	radius: number
	timeRemaining: number

	constructor(pos: V2, radius: number, anim: Anim<T>) {
		super({pos, owner: Owner.NEUTRAL, initialAnimation: anim});
		this.radius = radius
		this.timeRemaining = anim.getDuration()
	}

	override updateImpl(dt: number): void {
		this.timeRemaining -= dt
		this.anim.advance(dt)
	}

	override shouldCleanUp(): boolean {
		return this.timeRemaining <= 0
	}

	override getRadius() {
		return this.radius
	}
}
