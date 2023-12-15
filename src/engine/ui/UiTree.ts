import { MouseEventType, GameMouseEvent } from "./GameMouseEvent";
import { Panel } from "./Panel";
import { rectFromV2s } from "../vector.js";


export default class UiTree {
	panels: Panel[] = [];

	mouseEventsToHandle: { event: GameMouseEvent; handled: boolean } [] = [];
	ongoingMouseHolds: Panel[] = [];

	update(dt: number) {
		this.panels.forEach(e => {
			// @ts-expect-error update is a private method
			e.update(dt)
		})

		for (const child of this.descendantsBackward()) {
			if (this.mouseEventsToHandle.length <= 0) break

			// @ts-expect-error actualPos is private
			const actualPos = child.actualPos
			// @ts-expect-error actualSize is private
			const actualSize = child.actualSize

			const childBounds = rectFromV2s(actualPos, actualSize)

			for (const handlableMouseEvent of this.mouseEventsToHandle) {
				const event = handlableMouseEvent.event

				if (!childBounds.aabbV2(event.pos)) continue

				// Handle event
				handlableMouseEvent.handled = true
				switch (event.type) {
					case MouseEventType.DOWN: {
						child.onPress(event.pos)
						this.ongoingMouseHolds.push(child)
						break
					}
					case MouseEventType.UP: {
						const clickedChild = this.ongoingMouseHolds.find(e => e === child)
						this.emptyOngoingMouseHolds(event)
						child.onDrop(event.pos)
						clickedChild?.onClick(event.pos)
						break
					}
				}
			}
			this.mouseEventsToHandle = this.mouseEventsToHandle.filter(e => !e.handled)
		}

		// If a mouse up wasn't handled, tell everyone to go home:
		const unhandledUpEvent = this.mouseEventsToHandle.find(e => e.event.type === MouseEventType.UP)
		if (unhandledUpEvent) {
			this.emptyOngoingMouseHolds(unhandledUpEvent.event)
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

	private emptyOngoingMouseHolds(mouseUpEvent: GameMouseEvent) {
		this.ongoingMouseHolds.forEach(e => {
			e.onUnpress(mouseUpEvent.pos)
		})
		this.ongoingMouseHolds.length = 0
	}

	private *descendantsBackward() {
		for (let i = this.panels.length; i-- > 0;) {
			const child = this.panels[i]!
			const childBackward = child.descendantsBackward()
			yield* childBackward
		}
	}

	addMouseEvent(event: GameMouseEvent) {
		this.mouseEventsToHandle.push({
			event,
			handled: false
		})
	}
}
