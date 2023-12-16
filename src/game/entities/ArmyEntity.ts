import Entity from "../Entity.js";

export const enum Owner {
	PLAYER,
	ENEMY,
	RESCUABLE
}

export default abstract class ArmyEntity extends Entity {
	health: number = this.getMaxHealth()
	owner: Owner
	pos: V2

	constructor(owner: Owner, pos: V2) {
		super()
		this.owner = owner
		this.pos = pos
	}

	abstract getMaxHealth(): number
}
