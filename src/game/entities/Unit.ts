import assets, { ImageGroupName } from "../../assets.js";
import { current } from "../../engine/Provider.js";
import { rect, v2 } from "../../engine/vector.js";
import { gameSounds } from "../../global.js";
import Game from "../Game.js";
import World from "../World.js";
import ArmyEntity, { ArmyEntityArgs, Owner } from "./ArmyEntity.js";

/** Constructor arguments for {@link Unit}. */
export type UnitArgs<AnimGroupName extends ImageGroupName> = ArmyEntityArgs<AnimGroupName>

/** Type of command that can be issued to a {@link Unit}. */
const enum CommandType {
	IDLE,
	MOVE,
	ATTACK_MOVE
}

/** A unit which can be commanded. */
export default abstract class Unit<AnimGroupName extends ImageGroupName> extends ArmyEntity<AnimGroupName> {
	readonly vel: V2 = v2(0, 0)

	/** The unit's current path backward from its destination. */
	pathBackward: V2[] = []
	/**
	 * A unique ID for the command last given to this unit (the unit may still
	 * be trying to fulfill this command).
	 */
	lastCommandId: number = 0

	/** The unit's current attack target. */
	target: ArmyEntity<any> | null = null
	/** How many seconds until the unit can attack again. */
	attackCooldown = 0

	/** The unit's current command. */
	command: CommandType = CommandType.IDLE

	/** Gets this unit's max speed in tiles per second. */
	abstract getSpeed(): number
	/** Gets how far this unit's attacks reach in tiles. */
	abstract getAttackRange(): number
	/** Gets the number of seconds between attacks. */
	abstract getAttackTime(): number
	/** Gets how much damage an attack deals. */
	abstract getAttackDamage(): number
	/** Gets the names of the sounds used for an attack. */
	abstract getAttackSounds(): (keyof (typeof assets)["sounds"])[]

	override takeDamage(amount: number, source: ArmyEntity<any>) {
		super.takeDamage(amount, source)

		// Get angry at the attacker if we don't have a target:
		if (!this.target) this.target = source
	}

	override updateImpl(dt: number): void {
		// Recover from previous attack:
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
					// We're inside a wall, find the axis which would require
					// the least movement to leave the wall and go that way.

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


		// Lose target if it is dead
		if (this.target && this.target.health <= 0) this.target = null
		// Try to find a new target
		const attackRange = this.getAttackRange()
		if (!this.target && this.command !== CommandType.MOVE) {
			for (const e of world.unitsWithinBoundsInclusive(
				this.pos[0] - attackRange,
				this.pos[1] - attackRange,
				this.pos[0] + attackRange,
				this.pos[1] + attackRange
			)) {
				if (
					// Don't target own units:
					this.owner === e.owner
					// Don't target neutral units:
					|| e.owner === Owner.NEUTRAL
				) continue

				// Check if our attacks could reach the target
				if (this.pos.dist(e.pos) <= attackRange && !world.isRayObstructed(this.pos, e.pos)) {
					this.target = e
					break
				}
			}
		}

		// Stop fighting if we've been told to move:
		if (this.command === CommandType.MOVE) this.target = null

		// Try to attack target
		if (this.target) {
			const dist = this.pos.dist(this.target.pos)
			// Check if our attacks can reach the target
			if (dist > attackRange || world.isRayObstructed(this.pos, this.target.pos)) {
				if (this.command === CommandType.IDLE) {
					// Can't access the target and we have nothing better to do,
					// attack move toward it:
					this.commandAttackMoveTo(this.target.pos, world, Math.random())
				} else {
					// Give up and continue what we were doing:
					this.target = null
				}
			} else {
				if (this.attackCooldown <= 0) {
					// Attack the target
					this.target.takeDamage(this.getAttackDamage(), this)
					this.angle = this.target.pos.slice().sub(this.pos).radians()
					this.attackCooldown = this.getAttackTime()

					// Play a random attack sound
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
		// Don't try to move if we're recovering from our attack:
		if (this.attackCooldown <= 0) {
			if (this.pathBackward.length > 0) {
				// Move toward the next node
				const targetNode = this.pathBackward[this.pathBackward.length - 1]!
				velTowardNode.set(...targetNode.slice().sub(this.pos).normOr(0, 0).mul(speed).lock())
				this.angle = this.vel.radians()
			} else {
				// We aren't trying to go anywhere, become idle:
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

			// Add random jiggle to collisions to avoid getting stuck:
			const jiggle = Math.random() * .0001

			// Vector away from the colliding unit:
			const away = this.pos
				.slice()
				.sub(e.pos)
				.normOr(Math.random(), Math.random())

			const pushSpeed = speed * pushFactor
			pushVel.add(away
				.mul(pushSpeed)
				// Add jiggle perpendicular to the collision:
				.add(away.slice().rot90().mul(jiggle))
			)

			// We've collided with someone headed to the same place as we are,
			// but they stopped; to avoid every unit in a group struggling to
			// reach the exact same point, consider our (collective) journey
			// complete:
			if (pushSpeed * -pushVel.dot(velTowardNode) >= speed && this.pathBackward.length > 0 && e.pathBackward.length === 0 && this.lastCommandId === e.lastCommandId) {
				this.pathBackward.length = 0
				velTowardNode.set(0, 0)
				this.command = CommandType.IDLE
			}
		}

		this.vel.mut()
			// Velocity toward our next node:
			.set(...velTowardNode.lock())
			// Velocity from getting pushed around:
			.add(pushVel)
		// Cap our velocity to our max speed:
		if (this.vel.mag() > speed) this.vel.mut().normOr(0, 0).mul(speed)
		// Move:
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

	/**
	 * Commands this unit to move to the given position.
	 * 
	 * @param dest The destination in fractional tiles.
	 * @param world The world which the unit is in.
	 * @param commandId The unique ID for this command.
	 */
	commandMoveTo(dest: V2, world: World, commandId: number) {
		this.startMovingTo(dest, world, commandId, CommandType.MOVE)
	}

	/**
	 * Commands this unit to "attack move" to the given position.
	 * 
	 * @param dest The destination in fractional tiles.
	 * @param world The world which the unit is in.
	 * @param commandId The unique ID for this command.
	 */
	commandAttackMoveTo(dest: V2, world: World, commandId: number) {
		this.startMovingTo(dest, world, commandId, CommandType.ATTACK_MOVE)
	}
}
