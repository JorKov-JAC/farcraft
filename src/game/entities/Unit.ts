import { Sprite } from "../../engine/images.js";
import { v2 } from "../../engine/vector.js";
import { images } from "../../global.js";
import World from "../World.js";
import ArmyEntity from "./ArmyEntity.js";

export default abstract class Unit extends ArmyEntity {
	readonly vel: V2 = v2(0, 0)

	angle: number = 0

	pathBackward: V2[] = []
	lastDestination: V2 = this.pos.slice()

	abstract getSpeed(): number

	override updateImpl(dt: number): void {
		const speed = this.getSpeed()
		const path = this.pathBackward

		if (this.pathBackward.length > 0
			&& this.pos.slice().floor().equals(path[path.length - 1]!)) path.pop()

		if (this.pathBackward.length > 0) {
			const nextPath = path[path.length - 1]!
			this.vel.mut().set(...nextPath.slice().sub(this.pos).normOr(0, 0).mul(speed).lock())
		}

		this.pos.mut().add(this.vel.slice().mul(dt))
		this.angle = this.vel.radians()
	}

	startMovingTo(dest: V2, world: World) {
		this.pathBackward = world.pathfindBackward(this.pos, dest) ?? []

		if (this.pathBackward) {
			this.lastDestination = dest.slice()
		} else {
			this.lastDestination = this.pos.slice()
		}
	}

	override getCurrentSprite(): Sprite {
		return images.getAnim("marine", "idle").frames[0]!
	}
}
