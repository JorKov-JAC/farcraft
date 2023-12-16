import ArmyEntity from "./ArmyEntity.js";

export default abstract class Unit extends ArmyEntity {
	vel: V2
	radius: number

	angle: number = 0

	path: Pos[] | null
	lastDestination: V2 | null = null

	abstract getSpeed(): number

	baseUpdate(dt: number) {
		
	}

	abstract updateImpl(dt: number): void
}
