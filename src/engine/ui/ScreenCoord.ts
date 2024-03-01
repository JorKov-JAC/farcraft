import { canvas } from "../../context.js";
import { current } from "../Provider.js";
import { v2 } from "../vector.js";
import { containerSizeKey } from "./Panel.js";
import { containerPosKey } from "./Panel.js";

/**
 * Represents a position on the screen based on different coordinate spaces. The
 * final position is the sum of all the individual positions.
 */

export class ScreenCoord {
	/**
	 * A position in normalized screen space, where 0..1 maps to both 0..width
	 * and 0..height. Because width and height likely differ, this will give
	 * rectangular coordinates.
	 */
	private rootRect: V2
	/**
	 * A position in normalized screen space, where 0..1 maps to
	 * 0..min(width, height). This maintains a 1:1 aspect ratio (hence square).
	 */
	private rootSq: V2

	/** Like {@link rootRect}, but relative to the current container. */
	private rect: V2
	/** Like {@link rootSq}, but relative to the current container. */
	private sq: V2

	private constructor(rootRect: V2, rootSq: V2, rect: V2, sq: V2) {
		this.rootRect = rootRect
		this.rootSq = rootSq
		this.rect = rect
		this.sq = sq
	}

	static rootRect(x: number, y: number): Mut<ScreenCoord> {
		return new ScreenCoord(v2(x, y), v2(0,0), v2(0,0), v2(0,0)) as Mut<ScreenCoord>;
	}

	static rootSq(x: number, y: number): Mut<ScreenCoord> {
		return new ScreenCoord(v2(0, 0), v2(x, y), v2(0, 0), v2(0, 0)) as Mut<ScreenCoord>;
	}

	static rect(x: number, y: number): Mut<ScreenCoord> {
		return new ScreenCoord(v2(0, 0), v2(0, 0), v2(x, y), v2(0, 0)) as Mut<ScreenCoord>;
	}

	static sq(x: number, y: number): Mut<ScreenCoord> {
		return new ScreenCoord(v2(0, 0), v2(0, 0), v2(0, 0), v2(x, y)) as Mut<ScreenCoord>;
	}

	copy(): Mut<ScreenCoord> {
		return new ScreenCoord(this.rootRect, this.rootSq, this.rect, this.sq) as Mut<ScreenCoord>
	}

	reset(this: Mut<ScreenCoord>): Mut<ScreenCoord> {
		this.rootRect.mut().set(0, 0)
		this.rootSq.mut().set(0, 0)
		this.rect.mut().set(0, 0)
		this.sq.mut().set(0, 0)

		return this
	}

	addRootRect(this: Mut<ScreenCoord>, x: number, y: number): Mut<ScreenCoord> {
		this.rootRect.mut().add2(x, y);
		return this;
	}

	addRootSq(this: Mut<ScreenCoord>, x: number, y: number): Mut<ScreenCoord> {
		this.rootSq.mut().add2(x, y);
		return this;
	}

	addRect(this: Mut<ScreenCoord>, x: number, y: number): Mut<ScreenCoord> {
		this.rect.mut().add2(x, y);
		return this;
	}

	addSq(this: Mut<ScreenCoord>, x: number, y: number): Mut<ScreenCoord> {
		this.sq.mut().add2(x, y);
		return this;
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	mut(): Mut<ScreenCoord> { return this as any; }
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	lock(this: Mut<ScreenCoord>): ScreenCoord { return this as any; }

	private get canvasSpace(): V2 {
		const containerSize = current(containerSizeKey);

		const minRootDimension = Math.min(canvas.width, canvas.height);

		return this.rootRect.slice().mul2(canvas.width, canvas.height)
			.add(this.rootSq.slice().mul(minRootDimension))
			.add(this.rect.slice().mulV2(containerSize))
			.add(this.sq.slice().mul(containerSize.min()));
	}

	get canvasSize(): V2 {
		const res = this.canvasSpace

		res[0] = Math.max(0, res[0])
		res[1] = Math.max(0, res[1])

		return res
	}

	get canvasPos(): V2 {
		const containerPos = current(containerPosKey);
		return this.canvasSpace.mut().add(containerPos);
	}
}
