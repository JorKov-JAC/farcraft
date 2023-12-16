import { MouseEventType, GameMouseEvent, MouseButton } from "./GameMouseEvent";
import { Panel } from "./Panel";
import { rectFromV2s } from "../vector.js";
import { UiClock } from "../clock.js";


export default class UiTree {
	panels: Panel[] = [];
	clock = new UiClock()

	mouseEventsToHandle: { event: GameMouseEvent; handled: boolean } [] = [];
	ongoingMouseHolds: { button: MouseButton, panel: Panel }[] = [];

	update(dt: number) {
		this.clock.update(dt)

		this.panels.forEach(e => {
			e.baseUpdate(dt)
		})

		for (const child of this.descendantsBackward()) {
			if (this.mouseEventsToHandle.length <= 0) break

			const actualPos = child.getActualPos()
			const actualSize = child.getActualSize()

			const childBounds = rectFromV2s(actualPos, actualSize)

			for (const handlableMouseEvent of this.mouseEventsToHandle) {
				const event = handlableMouseEvent.event

				if (!childBounds.iAabbV2(event.pos)) continue

				// Handle event
				handlableMouseEvent.handled = true
				switch (event.type) {
					case MouseEventType.DOWN: {
						if (event.button === MouseButton.LEFT) {
							child.onPress(event.pos)
						} else if (event.button === MouseButton.RIGHT) {
							child.onRightPress(event.pos)
						}
						this.ongoingMouseHolds.push({ button: event.button, panel: child })
						break
					}
					case MouseEventType.UP: {
						const childOngoingHolds = this.ongoingMouseHolds.filter(e => e.panel === child)
						this.emptyOngoingMouseHolds(event)

						if (event.button === MouseButton.LEFT) {
							child.onDrop(event.pos)
							childOngoingHolds
								.find(e => e.button === MouseButton.LEFT)
								?.panel
								.onClick(event.pos)
						}
						break
					}
				}
			}
			this.mouseEventsToHandle = this.mouseEventsToHandle.filter(e => !e.handled)
		}

		// If a mouse up wasn't handled, tell everyone to go home:
		this.mouseEventsToHandle
			.filter(e => e.event.type === MouseEventType.UP)
			.forEach(e => { this.emptyOngoingMouseHolds(e.event) })
		// Drop the rest of the events
		this.mouseEventsToHandle.length = 0
	}

	render() {
		this.panels.forEach(e => {
			e.baseRender()
		})
	}

	private emptyOngoingMouseHolds(mouseUpEvent: GameMouseEvent) {
		this.ongoingMouseHolds = this.ongoingMouseHolds.filter(e => {
			if (e.button !== mouseUpEvent.button) return true
			
			if (mouseUpEvent.button === MouseButton.LEFT) {
				e.panel.onUnpress(mouseUpEvent.pos)
			}

			return false
		})
	}

	private *descendantsBackward() {
		for (let i = this.panels.length; i --> 0;) {
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
