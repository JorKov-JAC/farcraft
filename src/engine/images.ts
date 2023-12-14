import { ImageAsset, ImageAssets } from "../assets.js"
import { raise } from "./util.js"
import { v2 } from "./vector.js"

export function loadImage(src: string): Promise<HTMLImageElement> {
	const img = new Image()

	const promise = new Promise<HTMLImageElement>((resolve, reject) => {
		img.onload = () => { resolve(img) }
		img.onerror = reject
	})

	img.src = src

	return promise
}

interface Sprite {
	bitmap: ImageBitmap
	offset: V2
	size: V2
}

type SpriteInfos<T extends ImageAssets> = { [K in keyof T]: SpriteInfo<T[K]> }

interface SpriteInfo<T extends ImageAsset> {
	image: HTMLImageElement
	sprites: Sprite[]
	animFrames: AnimFrames<T>
}

type AnimFrames<T extends ImageAsset> = {
	[K in keyof T["anims"]]: { frames: Sprite[] }
		& (T["anims"][K] extends { duration: number } ? { duration: number } : {})
}

async function createSpriteInfo<T extends ImageAsset>(image: HTMLImageElement, imageAsset: T): Promise<SpriteInfo<T>> {
	const sprites: Sprite[] = []

	for (const spritesDef of imageAsset.spritesDefs) {
		for (const span of spritesDef.spans) {
			const totalRectTileCount = span.gridRect.rectArea()
			let remaining = Math.min(span.count ?? totalRectTileCount, totalRectTileCount)

			const coord = v2(0, 0)

			getTiles:
			for (let row = 0; row < span.gridRect[1]; ++row) {
				for (let col = 0; col < span.gridRect[0]; ++col) {
					// Don't go above count:
					if (--remaining < 0) break getTiles

					coord.mut()
						.set(... span.start)
						.add([
							spritesDef.gridSize[0] * col,
							spritesDef.gridSize[1] * row
						])
						.add(spritesDef.actualOffset)

					// TODO Parallel processing
					const bitmap = await createImageBitmap(
						image,
						...coord,
						...spritesDef.actualSize,
						{ resizeQuality: "pixelated" }
					)
					const offset = spritesDef.baseOffset.slice().neg().lock()
					const size = spritesDef.baseSize.slice().lock()

					sprites.push({ bitmap, offset, size })
				}
			}
		}
	}

	const animFrames: AnimFrames<T> = Object.create(null)
	const animDefs = imageAsset.anims
	for (const animName in animDefs) {
		const animDef = animDefs[animName]!
		const frames = animDef.frames.map(
			spriteIdx => sprites[spriteIdx] ?? raise(Error(`Sprite index ${spriteIdx} not found.`))
		)

		const anim: { duration?: number, frames: Sprite[] } = { frames }
		if ("duration" in animDef) anim.duration = animDef.duration

		// @ts-expect-error Modifying generic object
		animFrames[animName] = anim
	}

	return { image, sprites, animFrames }
}

export class ImageManager<T extends ImageAssets> {
	private namesToSpriteInfos: SpriteInfos<T>

	private constructor(namesToSpriteInfos: SpriteInfos<T>) {
		this.namesToSpriteInfos = namesToSpriteInfos
	}

	static async create<T extends ImageAssets>(imageAssets: T): Promise<ImageManager<T>> {
		const names: string[] = []
		const imagePromises: Promise<HTMLImageElement>[] = []

		for (const assetName in imageAssets) {
			names.push(assetName)
			const path = "assets/" + imageAssets[assetName]!.path
			imagePromises.push(loadImage(path))
		}
		const images = await Promise.all(imagePromises)

		const namesToImages: Record<string, HTMLImageElement> = Object.create(null)
		for (let i = 0; i < names.length; ++i) {
			namesToImages[names[i]!] = images[i]!
		}

		const namesToImageInfos: Record<string, SpriteInfo<any>> = Object.create(null)
		for (const assetName in imageAssets) {
			const imageAssetDef = imageAssets[assetName]!
			const image = namesToImages[assetName]!
			const spriteInfo = createSpriteInfo(image, imageAssetDef)
			// TODO Parallelize
			namesToImageInfos[assetName] = await spriteInfo
		}

		return new ImageManager(namesToImageInfos as SpriteInfos<T>)
	}

	/**
	 * Gets the image asset with the given name.
	 */
	getImage(name: keyof T): HTMLImageElement {
		return this.namesToSpriteInfos[name].image
	}

	getAnim<SpriteK extends keyof T, AnimK extends keyof T[SpriteK]["anims"]>
	(spriteName: SpriteK, animName: AnimK): AnimFrames<T[SpriteK]>[AnimK] {
		return this.namesToSpriteInfos[spriteName].animFrames[animName]
	}
}
