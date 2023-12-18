import assets, { ImageGroupName } from "../../assets.js";
import { ctx } from "../../context.js";
import { current } from "../../engine/Provider.js";
import { rect, v2 } from "../../engine/vector.js";
import { gameSounds } from "../../global.js";
import Game from "../Game.js";
import World from "../World.js";
import ArmyEntity, { ArmyEntityArgs, Owner } from "./ArmyEntity.js";

export type UnitArgs<AnimGroupName extends ImageGroupName> = ArmyEntityArgs<AnimGroupName>

const enum CommandType {
	IDLE,
	MOVE,
	ATTACK_MOVE
}

export default abstract class Unit<AnimGroupName extends ImageGroupName> extends ArmyEntity<AnimGroupName> {
	readonly vel: V2 = v2(0, 0)

	angle: number = 0

	pathBackward: V2[] = []
	lastCommandId: number = 0

	target: ArmyEntity<any> | null = null
	attackCooldown = 0

	command: CommandType = CommandType.IDLE


	abstract getSpeed(): number
	abstract getAttackRange(): number
	abstract getAttackTime(): number
	abstract getAttackDamage(): number
	abstract getAttackSounds(): (keyof (typeof assets)["sounds"])[]

	override takeDamage(amount: number, source: ArmyEntity<any>) {
		super.takeDamage(amount, source)
		if (!this.target) this.target = source
	}

	override updateImpl(dt: number): void {
		this.attackCooldown -= dt

		const world = current(Game).world

		const speed = this.getSpeed()
		const radius = this.getRadius()

		const aabb = rect(this.pos[0] - radius, this.pos[1] - radius, this.pos[0] + radius, this.pos[1] + radius)

		// Wall collisions
		let collidedWithWall = false
		for (let y = Math.floor(this.pos[1] - radius); y < Math.ceil(this.pos[1] + radius); ++y) {
			for (let x = Math.floor(this.pos[0] - radius); x < Math.ceil(this.pos[0] + radius); ++x) {
				if (!world.isSolid(x, y)) continue

				collidedWithWall = true

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


		// Try to find a target
		if (this.target && this.target.health <= 0) this.target = null
		const attackRange = this.getAttackRange()
		if (!this.target && this.command !== CommandType.MOVE) {
			for (const e of world.unitsWithinBoundsInclusive(
				this.pos[0] - attackRange,
				this.pos[1] - attackRange,
				this.pos[0] + attackRange,
				this.pos[1] + attackRange
			)) {
				if (this.owner === e.owner || e.owner === Owner.NEUTRAL) continue
				if (this.pos.dist(e.pos) <= attackRange && !world.isRayObstructed(this.pos, e.pos)) {
					this.target = e
				}
			}
		}

		// Try to attack target
		if (this.command === CommandType.MOVE) this.target = null
		if (this.target) {
			const dist = this.pos.dist(this.target.pos)
			if (dist > attackRange || world.isRayObstructed(this.pos, this.target.pos)) {
				if (this.command === CommandType.IDLE) {
					this.commandAttackMoveTo(this.target.pos, world, Math.random())
				} else {
					this.target = null
				}
			} else {
				if (this.attackCooldown <= 0) {
					this.target.takeDamage(this.getAttackDamage(), this)
					this.angle = this.target.pos.slice().sub(this.pos).radians()
					this.attackCooldown = this.getAttackTime()
					const attackSounds = this.getAttackSounds()
					const sound = attackSounds[Math.floor(Math.random() * attackSounds.length)]!
					void gameSounds.playSound(sound)
				}
			}
		}

		// Move along path
		if (this.pathBackward.length > 0
			&& (
				// We're close enough to our destination to stop
				this.pos.slice().sub(this.pathBackward[this.pathBackward.length - 1]!).mag() <= radius
				// We're in the destination tile and we hit a wall, so stop
				|| collidedWithWall
					&& this.pathBackward.length === 1
					&& this.pos.slice().floor().equals(this.pathBackward[0]!.slice().floor())
			)
		) this.pathBackward.pop()

		const velTowardNode = v2(0, 0).mut()
		if (this.attackCooldown <= 0) {
			if (this.pathBackward.length > 0) {
				const targetNode = this.pathBackward[this.pathBackward.length - 1]!
				velTowardNode.set(...targetNode.slice().sub(this.pos).normOr(0, 0).mul(speed).lock())
				this.angle = this.vel.radians()
			} else {
				this.command = CommandType.IDLE
			}
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

			const pushSpeed = speed * pushFactor
			pushVel.add(away
				.mul(pushSpeed)
				.add(away.slice().rot90().mul(jiggle))
			)

			// We've collided with someone headed to the same place who stopped;
			// consider our journey complete.
			if (pushSpeed * -pushVel.dot(velTowardNode) >= speed && this.pathBackward.length > 0 && e.pathBackward.length === 0 && this.lastCommandId === e.lastCommandId) {
				this.pathBackward.length = 0
				velTowardNode.set(0, 0)
				this.command = CommandType.IDLE
			}
		}

		this.vel.mut().set(...velTowardNode.lock()).add(pushVel)
		if (this.vel.mag() > speed) this.vel.mut().normOr(0, 0).mul(speed)
		this.pos.mut().add(this.vel.slice().mul(dt))
	}

	private startMovingTo(dest: V2, world: World, commandId: number, commandType: CommandType) {
		const pathBackward = world.pathfindBackward(this.pos, dest)

		if (pathBackward) {
			// First tile is current tile, get rid of it:
			pathBackward.pop()
			// Go to the center of each tile
			pathBackward.forEach(e => e.add2(.5, .5))
			// Set final position to be sub-tile position:
			pathBackward.splice(0, 0, dest.slice())

			this.pathBackward = pathBackward
			this.lastCommandId = commandId
			this.command = commandType
		} else {
			this.pathBackward = []
			this.lastCommandId = 0
			this.command = CommandType.IDLE
		}
	}

	commandMoveTo(dest: V2, world: World, commandId: number) {
		this.startMovingTo(dest, world, commandId, CommandType.MOVE)
	}

	commandAttackMoveTo(dest: V2, world: World, commandId: number) {
		this.startMovingTo(dest, world, commandId, CommandType.ATTACK_MOVE)
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
