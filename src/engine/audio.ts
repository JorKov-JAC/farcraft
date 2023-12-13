export async function loadSound(audioContext: AudioContext, src: string) {
	const response = await fetch(src)
	const buffer = await response.arrayBuffer()
	return audioContext.decodeAudioData(buffer)
}

export class SoundManager<T extends Record<string, string>> {
	audioContext: AudioContext
	private namesToSounds: Map<keyof T, AudioBuffer>

	private constructor(audioContext: AudioContext, namesToSounds: Map<keyof T, AudioBuffer>) {
		this.audioContext = audioContext
		this.namesToSounds = namesToSounds
	}

	static async create<T extends Record<string, string>>(soundAssets: T): Promise<SoundManager<T>> {
		const audioContext = new AudioContext()

		const names: string[] = []
		const promises: Promise<AudioBuffer>[] = []

		for (const assetName in soundAssets) {
			names.push(assetName)
			const path = "assets/" + soundAssets[assetName]!
			promises.push(loadSound(audioContext, path))
		}
		const sounds = await Promise.all(promises)

		const namesToSounds: Map<string, AudioBuffer> = new Map()
		for (let i = 0; i < names.length; ++i) {
			namesToSounds.set(names[i]!, sounds[i]!)
		}

		return new SoundManager(audioContext, namesToSounds)
	}

	/**
	 * Gets the image asset with the given name.
	 */
	playSound(name: keyof T): Promise<void> {
		const buffer = this.namesToSounds.get(name)!
		const sound = new AudioBufferSourceNode(this.audioContext, { buffer })
		sound.connect(this.audioContext.destination)

		const promise = new Promise<void>(resolve => sound.onended = () => { resolve() })

		sound.start()

		return promise
	}
}
