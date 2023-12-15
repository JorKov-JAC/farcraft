import { ctx } from "../../context.js";
import { canvas } from "../../context.js";
import { createProviderKey, provide } from "../Provider.js";
import { v2 } from "../vector.js";
import { ScreenCoord } from "./ScreenCoord.js";


export const containerPosKey = createProviderKey(v2(0, 0));
export const containerSizeKey = createProviderKey(v2(canvas.width, canvas.height))

export abstract class Panel {
	private actualPos: V2 = v2(0, 0);
	private actualSize: V2 = v2(0, 0);

	pos: ScreenCoord;
	size: ScreenCoord;

	children: Panel[] = [];

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

		this.children.forEach(e => { e.baseRender(); });
		ctx.restore();
	}

	baseUpdate(dt: number) {
		// Update coordinates before so that they're available in the update
		this.actualPos = this.pos.canvasPos;
		this.actualSize = this.size.canvasSize;

		this.updateImpl(dt);

		// Update screen coordinates
		this.actualPos = this.pos.canvasPos;
		this.actualSize = this.size.canvasSize;

		// Update children
		provide(containerPosKey, this.actualPos, () => {
			provide(containerSizeKey, this.actualSize, () => {
				this.children.forEach(e => { e.baseUpdate(dt); });
			});
		});
	}

	*descendantsBackward(): Generator<Panel> {
		for (let i = this.children.length; i-- > 0;) {
			const child = this.children[i]!;
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

	abstract renderImpl(): void;

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
}
