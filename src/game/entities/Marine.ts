import assets, { SoundName } from "../../assets.js";
import Anim from "../Anim.js";
import SerializableId from "../SerializableId.js";
import { ArmyEntityArgs } from "./ArmyEntity.js";
import Unit from "./Unit.js";

/** A light infantry unit. */
export default class Marine extends Unit<"marine"> {
	// eslint-disable-next-line @typescript-eslint/no-useless-constructor
	constructor(args: Omit<ArmyEntityArgs<"marine">, "initialAnimation">) {
		super({...args, initialAnimation: new Anim("marine", "idle")})
	}
	
	override updateImpl(dt: number): void {
		super.updateImpl(dt)

		const maxSpeed = this.getSpeed()
		const radius = this.getRadius()
		const speed = this.vel.mag()
		if (this.attackCooldown > 0) {
			if (this.anim.animationName !== "shoot") {
				this.anim = new Anim("marine", "shoot")
			} else {
				this.anim.setNorm(1 - this.attackCooldown / this.getAttackTime())
			}
		} else if (this.vel.mag() > maxSpeed * .1) {
			if (this.anim.animationName !== "move") {
				this.anim = new Anim("marine", "move")
			} else {
				this.anim.advance(speed / (radius * 2) * dt)
			}
		} else {
			if (this.anim.animationName !== "idle") {
				this.anim = new Anim("marine", "idle")
			} else {
				this.anim.advance(dt)
			}
		}
	}

	override getSpeed(): number {
		return 3
	}
	override getAttackRange(): number {
		return 5
	}
	override getAttackDamage(): number {
		return 8
	}
	override getAttackTime(): number {
		return 1
	}
	override getAttackSounds(): (keyof (typeof assets)["sounds"])[] {
		return ["pulseRifle1", "pulseRifle2"]
	}
	override getDeathSound(): SoundName {
		return "marineDeath"
	}
	override getRadius(): number {
		return .4
	}
	override getMaxHealth(): number {
		return 40
	}

	// Serialization
	override classId(): SerializableId {
		return SerializableId.MARINE
	}
}
