
export const enum MouseEventType {
	DOWN,
	UP
}

export class GameMouseEvent {
	type: MouseEventType
	pos: V2

	constructor(type: MouseEventType, pos: V2) {
		this.type = type
		this.pos = pos
	}
}
