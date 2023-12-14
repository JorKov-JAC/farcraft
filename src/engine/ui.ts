import { canvas } from "../global.js"
import { createProviderKey, current } from "./Provider.js"
import { v2 } from "./vector.js"

const containerSizeKey = createProviderKey(v2(canvas.width, canvas.height))

/**
 * Represents a position on the screen based on different coordinate spaces. The
 * final position is the sum of all the individual positions.
 */
class ScreenPos {
	/**
	 * A position in normalized screen space, where 0..1 maps to both 0..width
	 * and 0..height. Because width and height likely differ, this will give
	 * rectangular coordinates.
	 */
	rect = v2(0, 0)
	/**
	 * A position in normalized screen space, where 0..1 maps to
	 * 0..min(width, height). This maintains a 1:1 aspect ratio (hence square).
	 */
	sq = v2(0, 0)

	/** Like {@link rect}, but relative to the current container. */
	relRect = v2(0, 0)
	/** Like {@link sq}, but relative to the current container. */
	relSq = v2(0, 0)

	private constructor() {}

	static rect(rect: V2): Mut<ScreenPos> {
		const pos = new ScreenPos() as Mut<ScreenPos>
		return pos.setRect(rect)
	}

	static sq(sq: V2): Mut<ScreenPos> {
		const pos = new ScreenPos() as Mut<ScreenPos>
		return pos.setSq(sq)
	}

	static relRect(relRect: V2): Mut<ScreenPos> {
		const pos = new ScreenPos() as Mut<ScreenPos>
		return pos.setRelRect(relRect)
	}

	static relSq(relSq: V2): Mut<ScreenPos> {
		const pos = new ScreenPos() as Mut<ScreenPos>
		return pos.setRelSq(relSq)
	}

	setRect(this: Mut<ScreenPos>, rect: V2): Mut<ScreenPos> {
		this.rect = rect.slice()
		return this
	}

	setSq(this: Mut<ScreenPos>, sq: V2): Mut<ScreenPos> {
		this.sq = sq.slice()
		return this
	}

	setRelRect(this: Mut<ScreenPos>, relRect: V2): Mut<ScreenPos> {
		this.relRect = relRect.slice()
		return this
	}

	setRelSq(this: Mut<ScreenPos>, relSq: V2): Mut<ScreenPos> {
		this.relSq = relSq.slice()
		return this
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	mut(): Mut<ScreenPos> { return this as any }
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	lock(this: Mut<ScreenPos>): ScreenPos { return this as any }

	get pos(): V2 {
		const containerSize = current(containerSizeKey)

		const minRootDimension = Math.min(canvas.width, canvas.height)

		return this.rect.slice().mul2(canvas.width, canvas.height)
			.add( this.sq.slice().mul(minRootDimension) )
			.add( this.relRect.slice().mulV2(containerSize) )
			.add( this.relSq.slice().mul(containerSize.min()) )
	}
}
