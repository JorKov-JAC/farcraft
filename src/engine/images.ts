export function loadImage(src: string): Promise<HTMLImageElement> {
	const img = new Image()

	const promise = new Promise((resolve, reject) => {
		img.onload = () => resolve(img)
		img.onerror = reject
	}) as Promise<HTMLImageElement>

	img.src = src

	return promise
}

export class ImageManager<T extends Record<string, string>> {
	private namesToImages: Map<keyof T, HTMLImageElement>

	private constructor(namesToImages: Map<keyof T, HTMLImageElement>) {
		this.namesToImages = namesToImages
	}

	static async create<T extends Record<string, string>>(imageAssets: T): Promise<ImageManager<T>> {
		const names: string[] = []
		const promises: Promise<HTMLImageElement>[] = []

		for (const assetName in imageAssets) {
			names.push(assetName)
			const path = "assets/" + imageAssets[assetName]!
			promises.push(loadImage(path))
		}
		const images = await Promise.all(promises)

		const namesToImages = new Map()
		for (let i = 0; i < names.length; ++i) {
			namesToImages.set(names[i], images[i])
		}

		return new ImageManager(namesToImages)
	}

	/**
	 * Gets the image asset with the given name.
	 */
	getImage(name: keyof T): HTMLImageElement {
		return this.namesToImages.get(name)!
	}
}
