import { ImageGroupName } from "../../assets.js";
import { ctx } from "../../context.js";
import { current } from "../../engine/Provider.js";
import { rect, v2 } from "../../engine/vector.js";
import Game from "../Game.js";
import World from "../World.js";
import ArmyEntity, { ArmyEntityArgs } from "./ArmyEntity.js";

export type UnitArgs<AnimGroupName extends ImageGroupName> = ArmyEntityArgs<AnimGroupName>

export default abstract class Unit<AnimGroupName extends ImageGroupName> extends ArmyEntity<AnimGroupName> {
	readonly vel: V2 = v2(0, 0)

	angle: number = 0

	pathBackward: V2[] = []
	lastDestination: V2 = this.pos.slice()

	abstract getSpeed(): number

	override updateImpl(dt: number): void {
		const world = current(Game).world

		const speed = this.getSpeed()
		const radius = this.getRadius()
		const path = this.pathBackward

		const aabb = rect(this.pos[0] - radius, this.pos[1] - radius, this.pos[0] + radius, this.pos[1] + radius)

		// Wall collisions
		for (let y = Math.floor(this.pos[1] - radius); y < Math.ceil(this.pos[1] + radius); ++y) {
			for (let x = Math.floor(this.pos[0] - radius); x < Math.ceil(this.pos[0] + radius); ++x) {
				if (!world.isSolid(x, y)) continue

				if (aabb.iAabb4(x, y, 1, 1)) {
					const inLeft = x + 1 - this.pos[0] + radius
					const inRight = this.pos[0] + radius - x
					const inUp = y + 1 - this.pos[1] + radius
					const inDown = this.pos[1] + radius - y

					const smallest = Math.min(inLeft, inRight, inUp, inDown)
					if (inLeft === smallest) this.pos[0] += inLeft
					else if (inRight === smallest) this.pos[0] -= inRight
					else if (inUp === smallest) this.pos[1] += inUp
					else this.pos[1] -= inDown
				}
			}
		}

		// Move along path
		if (this.pathBackward.length > 0
			&& this.pos.slice().add2(-.5, -.5).sub(path[path.length - 1]!).mag() <= radius) path.pop()

		const velTowardNode = v2(0, 0).mut()
		if (this.pathBackward.length > 0) {
			const targetNode = path[path.length - 1]!
			velTowardNode.set(...targetNode.slice().add2(.5, .5).sub(this.pos).normOr(0, 0).mul(speed).lock())
			this.angle = this.vel.radians()
		}

		// Softbody collisions
		const pushVel = v2(0, 0).mut()
		for (const e of world.unitsWithinBoundsInclusive(...aabb)) {
			if (e === this) continue

			const dist = this.pos.dist(e.pos)
			const otherRadius = e.getRadius()
			const pushFactor = Math.max(0, 1 - (dist - otherRadius) / radius)

			const jiggle = Math.random() * .0001

			const away = this.pos
				.slice()
				.sub(e.pos)
				.normOr(Math.random(), Math.random())

			pushVel.add(away
				.mul(speed * pushFactor)
				.add(away.slice().rot90().mul(jiggle))
			)

			const dest = this.pathBackward[0]
			// We've collided with someone headed to the same place who stopped;
			// consider our journey complete.
			if (pushFactor > .25 && dest && e.pathBackward.length === 0 && dest.dist(e.lastDestination) < .1) {
				this.pathBackward.length = 0
				velTowardNode.set(0, 0)
			}
		}

		this.vel.mut().set(...velTowardNode.lock()).add(pushVel)
		if (this.vel.mag() > speed) this.vel.mut().normOr(0, 0).mul(speed)
		this.pos.mut().add(this.vel.slice().mul(dt))
	}

	startMovingTo(dest: V2, world: World) {
		this.pathBackward = world.pathfindBackward(this.pos, dest) ?? []

		if (this.pathBackward) {
			this.lastDestination = dest.slice()
		} else {
			this.lastDestination = this.pos.slice()
		}
	}

	override renderImpl() {
		ctx.save()

		const camera = current(Game).camera

		const sprite = this.getCurrentSprite()

		const len = this.getRadius() * 2
		const spriteSize = sprite.sizeWithin(len)
		const worldPos = this.pos.slice()
		const canvasPos = camera.worldPosToCanvas(worldPos).lock()

		ctx.translate(...canvasPos)
		if (this.angle > Math.PI * .5 && this.angle < Math.PI * 1.5) {
			ctx.scale(-1, 1)
			// ctx.rotate((Math.PI - this.angle) * .25)
		} else {
			// ctx.rotate(((this.angle + Math.PI * .25) % (2 * Math.PI) - Math.PI * .25) * .25)
		}

		ctx.translate(...spriteSize.slice().neg().mul(.5 * camera.worldSizeToCanvasFactor()).lock())

		sprite.render(0, 0, len * camera.worldSizeToCanvasFactor())

		ctx.restore()
	}
}
