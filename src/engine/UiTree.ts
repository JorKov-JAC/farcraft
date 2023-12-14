import { Panel, MouseEventType } from "./ui";
import { rectFromV2s, v2 } from "./vector.js";


export default class UiTree {
	panels: Panel[] = [];

	mouseEventsToHandle: { type: MouseEventType; pos: V2; handled: boolean} [] = [];
	ongoingMouseHolds: Panel[] = [];

	update(dt: number) {
		this.panels.forEach(e => {
			// @ts-expect-error update is a private method
			e.update(dt)
		})

		for (const child of this.childrenBackward()) {
			if (this.mouseEventsToHandle.length <= 0) break

			// @ts-expect-error actualPos is private
			const actualPos = child.actualPos
			// @ts-expect-error actualSize is private
			const actualSize = child.actualSize

			const childBounds = rectFromV2s(actualPos, actualSize)

			for (const mouseEvent of this.mouseEventsToHandle) {
				if (!childBounds.aabbV2(mouseEvent.pos)) continue

				// Handle event
				mouseEvent.handled = true
				switch (mouseEvent.type) {
					case MouseEventType.DOWN: {
						child.onPress()
						this.ongoingMouseHolds.push(child)
						break
					}
					case MouseEventType.UP: {
						const clickedChild = this.ongoingMouseHolds.find(e => e === child)
						this.emptyOngoingMouseHolds()
						child.onDrop()
						clickedChild?.onClick()
						break
					}
				}
			}
			this.mouseEventsToHandle = this.mouseEventsToHandle.filter(e => !e.handled)
		}

		// If a mouse up wasn't handled, tell everyone to go home:
		if (this.mouseEventsToHandle.some(e => e.type === MouseEventType.UP)) {
			this.emptyOngoingMouseHolds()
		}
		// Drop the rest of the events
		this.mouseEventsToHandle.length = 0
	}

	render() {
		this.panels.forEach(e => {
			// @ts-expect-error render is private
			e.render()
		})
	}

	private emptyOngoingMouseHolds() {
		this.ongoingMouseHolds.forEach(e => {
			e.onUnpress()
		})
		this.ongoingMouseHolds.length = 0
	}

	private *childrenBackward() {
		for (let i = this.panels.length; i-- > 0;) {
			const child = this.panels[i]!
			// @ts-expect-error childrenBackward is private
			const childBackward = child.childrenBackward()
			yield* childBackward
		}
	}

	private addMouseEvent(event: MouseEvent, type: MouseEventType) {
		this.mouseEventsToHandle.push({
			type: type,
			pos: v2(event.offsetX, event.offsetY),
			handled: false
		})
	}

	mouseDown(event: MouseEvent) {
		this.addMouseEvent(event, MouseEventType.DOWN)
	}

	mouseUp(event: MouseEvent) {
		this.addMouseEvent(event, MouseEventType.UP)
	}
}
