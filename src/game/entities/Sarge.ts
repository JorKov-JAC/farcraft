import assets from "../../assets.js";
import Anim from "../Anim.js";
import SerializableId from "../SerializableId.js";
import { ArmyEntityArgs } from "./ArmyEntity.js";
import Unit from "./Unit.js";

export default class Marine extends Unit<"sarge"> {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(args: Omit<ArmyEntityArgs<"sarge">, "initialAnimation">) {
		super({...args, initialAnimation: new Anim("sarge", "idle")})
	}
	
	override updateImpl(dt: number): void {
		super.updateImpl(dt)

		const maxSpeed = this.getSpeed()
		const radius = this.getRadius()
		const speed = this.vel.mag()
		if (this.attackCooldown > 0) {
			if (this.anim.animationName !== "shoot") {
				this.anim = new Anim("sarge", "shoot")
			} else {
				this.anim.setNorm(1 - this.attackCooldown / this.getAttackTime())
			}
		} else if (this.vel.mag() > maxSpeed * .1) {
			if (this.anim.animationName !== "move") {
				this.anim = new Anim("sarge", "move")
			} else {
				this.anim.advance(speed / (radius * 2) * dt)
			}
		} else {
			if (this.anim.animationName !== "idle") {
				this.anim = new Anim("sarge", "idle")
			} else {
				this.anim.advance(dt)
			}
		}
	}

	override getSpeed(): number {
		return 2.5
	}
	override getAttackRange(): number {
		return 4
	}
	override getAttackDamage(): number {
		return 12
	}
	override getAttackTime(): number {
		return 1
	}
	override getAttackSounds(): (keyof (typeof assets)["sounds"])[] {
		return ["laserCannon1", "laserCannon2"]
	}
	override getRadius(): number {
		return .5
	}
	override getMaxHealth(): number {
		return 60
	}
	override classId(): SerializableId {
		return SerializableId.SARGE
	}
}
