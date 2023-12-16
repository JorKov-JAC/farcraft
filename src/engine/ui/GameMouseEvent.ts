
export const enum MouseEventType {
	DOWN,
	UP
}

export const enum MouseButton {
	LEFT = 0,
	RIGHT = 1,
	MIDDLE = 2,
	_SIZE
}

export class GameMouseEvent {
	type: MouseEventType
	button: MouseButton
	pos: V2

	constructor(type: MouseEventType, button: MouseButton, pos: V2) {
		this.type = type
		this.button = button
		this.pos = pos
	}
}
