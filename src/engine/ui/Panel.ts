import { ctx } from "../../context.js";
import { canvas } from "../../context.js";
import { createProviderKey, provide } from "../Provider.js";
import { v2 } from "../vector.js";
import { ScreenCoord } from "./ScreenCoord.js";


export const containerPosKey = createProviderKey(v2(0, 0));
export const containerSizeKey = createProviderKey(v2(canvas.width, canvas.height))

export class Panel {
	private actualPos: V2 = v2(0, 0);
	private actualSize: V2 = v2(0, 0);

	readonly pos: ScreenCoord;
	readonly size: ScreenCoord;

	protected readonly _trueChildren: Panel[] = [];

	constructor(pos: ScreenCoord, size: ScreenCoord) {
		this.pos = pos;
		this.size = size;
	}

	baseRender() {
		ctx.save();

		ctx.beginPath();
		ctx.rect(...this.actualPos, ...this.actualSize);
		ctx.clip();
		provide(containerPosKey, this.actualPos, () => {
			provide(containerSizeKey, this.actualSize, () => {
				this.renderImpl();
			});
		});

		this._trueChildren.forEach(e => { e.baseRender(); });
		ctx.restore();
	}

	baseUpdate(dt: number) {
		// Update coordinates before so that they're available in the update
		this.actualPos = this.pos.canvasPos;
		this.actualSize = this.size.canvasSize;

		this.updateImpl(dt);

		// Update screen coordinates
		const floatPos = this.pos.canvasPos
		this.actualPos = floatPos.slice().round()
		this.actualSize = this.size.canvasSize.mut().add(floatPos).round().sub(this.actualPos)

		// Update children
		provide(containerPosKey, this.actualPos, () => {
			provide(containerSizeKey, this.actualSize, () => {
				this._trueChildren.forEach(e => { e.baseUpdate(dt); });
			});
		});
	}

	*descendantsBackward(): Generator<Panel> {
		for (let i = this._trueChildren.length; i-- > 0;) {
			const child = this._trueChildren[i]!;
			yield* child.descendantsBackward();
		}
		yield this;
	}

	getActualPos() {
		return this.actualPos
	}
	getActualSize() {
		return this.actualSize
	}

	/**
	 * Generally use {@link getChildren} instead unless you want to forward this
	 * panel's children array.
	 */
	getPublicChildren(): Panel[] {
		return this._trueChildren
	}

	getChildren(): ReadonlyArray<Panel> {
		return this.getPublicChildren()
	}
	addChildren(...children: Panel[]) {
		this.getPublicChildren().push(...children)
	}
	removeChild(child: Panel) {
		const publicChildren = this.getPublicChildren()
		const idx = publicChildren.indexOf(child)
		if (idx >= 0) {
			publicChildren.splice(idx, 1)
		}
	}

	renderImpl(): void { }

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	updateImpl(_dt: number): void { }

	/** Called when the mouse begins to press on this panel. */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onPress(_pos: V2) { }
	/** Called when the mouse is released somewhere other than this panel after this panel has been pressed. */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onUnpress(_pos: V2) { }
	/** Called when the mouse is released on this panel regardless of whether it was pressed before. */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onDrop(_pos: V2) { }
	/** Called when the mouse is pressed and released on this panel. */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onClick(_pos: V2) { }

	/** Like {@link onPress}, but for the right mouse button. */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onRightPress(_pos: V2) { }
}
