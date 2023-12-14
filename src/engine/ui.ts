import { canvas, ctx } from "../global.js"
import { createProviderKey, current, provide } from "./Provider.js"
import { v2 } from "./vector.js"

const containerPosKey = createProviderKey(v2(0, 0))
const containerSizeKey = createProviderKey(v2(canvas.width, canvas.height))

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
	private rootRect = v2(0, 0)
	/**
	 * A position in normalized screen space, where 0..1 maps to
	 * 0..min(width, height). This maintains a 1:1 aspect ratio (hence square).
	 */
	private rootSq = v2(0, 0)

	/** Like {@link rootRect}, but relative to the current container. */
	private rect = v2(0, 0)
	/** Like {@link rootSq}, but relative to the current container. */
	private sq = v2(0, 0)

	private constructor() {}

	static rootRect(x: number, y: number): Mut<ScreenCoord> {
		const pos = new ScreenCoord() as Mut<ScreenCoord>
		return pos.setRootRect(x, y)
	}

	static rootSq(x: number, y: number): Mut<ScreenCoord> {
		const pos = new ScreenCoord() as Mut<ScreenCoord>
		return pos.setRootSq(x, y)
	}

	static rect(x: number, y: number): Mut<ScreenCoord> {
		const pos = new ScreenCoord() as Mut<ScreenCoord>
		return pos.setRect(x, y)
	}

	static sq(x: number, y: number): Mut<ScreenCoord> {
		const pos = new ScreenCoord() as Mut<ScreenCoord>
		return pos.setSq(x, y)
	}

	setRootRect(this: Mut<ScreenCoord>, x: number, y: number): Mut<ScreenCoord> {
		this.rootRect.mut().set(x, y)
		return this
	}

	setRootSq(this: Mut<ScreenCoord>, x: number, y: number): Mut<ScreenCoord> {
		this.rootSq.mut().set(x, y)
		return this
	}

	setRect(this: Mut<ScreenCoord>, x: number, y: number): Mut<ScreenCoord> {
		this.rect.mut().set(x, y)
		return this
	}

	setSq(this: Mut<ScreenCoord>, x: number, y: number): Mut<ScreenCoord> {
		this.sq.mut().set(x, y)
		return this
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	mut(): Mut<ScreenCoord> { return this as any }
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	lock(this: Mut<ScreenCoord>): ScreenCoord { return this as any }

	get canvasSize(): V2 {
		const containerSize = current(containerSizeKey)

		const minRootDimension = Math.min(canvas.width, canvas.height)

		return this.rootRect.slice().mul2(canvas.width, canvas.height)
			.add( this.rootSq.slice().mul(minRootDimension) )
			.add( this.rect.slice().mulV2(containerSize) )
			.add( this.sq.slice().mul(containerSize.min()) )
	}

	get canvasPos(): V2 {
		const containerPos = current(containerPosKey)
		return this.canvasSize.mut().add(containerPos)
	}
}

export abstract class Panel {
	private actualPos: V2 = v2(0,0)
	private actualSize: V2 = v2(0,0)

	pos: ScreenCoord
	size: ScreenCoord

	children: Panel[] = []

	constructor(pos: ScreenCoord, size: ScreenCoord) {
		this.pos = pos
		this.size = size
	}

	private recompose() {
		this.actualPos = this.pos.canvasPos
		this.actualSize = this.size.canvasSize

		provide(containerPosKey, this.actualPos, () => {
		provide(containerSizeKey, this.actualSize, () => {
			this.children.forEach(e => { e.recompose() })
		})
		})
	}

	private render() {
		ctx.save()

		ctx.beginPath()
		ctx.rect(...this.actualPos, ...this.actualSize)
		ctx.clip()
		provide(containerPosKey, this.actualPos, () => {
		provide(containerSizeKey, this.actualSize, () => {
			this.renderImpl()
		})
		})

		this.children.forEach(e => { e.render() })
		ctx.restore()
	}

	abstract renderImpl(): void

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	update(_dt: number): void {}
	onClick() {}
}
