// HACK This is kinda gross; buffers from different contexts are lumped together
//      based on which context decoded them first.
/** A cache which maps sound names to their AudioBuffer (or a promise thereof). */
const loadedSounds: Record<string, AudioBuffer|Promise<AudioBuffer>> = Object.create(null)

/**
 * Loads a sound.
 * 
 * @param audioContext The context to use for decoding the sound.
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData}.
 * @param src The URI of the sound.
 */
export async function loadSound(audioContext: AudioContext, src: string) {
	// Check if we need to load the sound rather than use it from the cache:
	if (!loadedSounds[src]) {
		// Create a promise and store its resolve function
		let resolver
		loadedSounds[src] = new Promise(resolve => resolver = resolve)

		// Fetch sound
		const response = await fetch(src)
		const buffer = await response.arrayBuffer()
		
		// Begin decoding data in the audio context
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
		resolver!(audioContext.decodeAudioData(buffer))
	}

	return loadedSounds[src]!
}

/** Information for a playing sound within a {@link SoundManager}. */
interface SoundEntry {
	sound: AudioBufferSourceNode
	totallyPlayedPromise: Promise<void>
	resolveTotallyPlayedPromise: (() => void) | null
}

/**
 * Manages the playing of sounds.
 * 
 * @template T A record of sound names to URIs relative to the assets folder.
 */
export class SoundManager<T extends Record<string, string>> {
	audioContext: AudioContext

	private namesToSounds: Map<keyof T, AudioBuffer>
	private namesToOngoingSounds: Map<keyof T, SoundEntry[]> = new Map()
	/** Currently playing music. */
	private music: SoundEntry | null = null

	private constructor(audioContext: AudioContext, namesToSounds: Map<keyof T, AudioBuffer>) {
		this.audioContext = audioContext
		this.namesToSounds = namesToSounds
	}

	/**
	 * Async constructor.
	 * 
	 * @param soundAssets A record of sound names to URIs relative to the assets
	 * folder.
	 */
	static async create<T extends Record<string, string>>(soundAssets: T): Promise<SoundManager<T>> {
		const audioContext = new AudioContext()

		// Load all sounds
		const names: string[] = []
		const promises: Promise<AudioBuffer>[] = []

		// Load all sounds in parallel:
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

	/** Sets up a {@link SoundEntry}. */
	private soundNode(name: keyof T, options?: Omit<AudioBufferSourceOptions, "buffer">): SoundEntry {
		// Create buffer source node
		const buffer = this.namesToSounds.get(name)!
		const sound = new AudioBufferSourceNode(this.audioContext, { ...options, buffer })

		// Setup up promise
		let resolveTotallyPlayedPromise: (() => void) | null = null
		const totallyPlayedPromise = new Promise<void>(resolve => {
			resolveTotallyPlayedPromise = resolve
		})
		
		const soundEntry = {
			sound,
			totallyPlayedPromise,
			resolveTotallyPlayedPromise
		}

		sound.addEventListener("ended", () => {
			// @ts-expect-error Doesn't know that it isn't null anymore
			soundEntry.resolveTotallyPlayedPromise?.()
		})

		return soundEntry
	}

	private play(sound: AudioBufferSourceNode): Promise<void> {
		sound.connect(this.audioContext.destination)

		const promise = new Promise<void>(resolve => {
			sound.addEventListener("ended", () => { resolve() })
		})
		sound.start()
		return promise
	}

	playSound(name: keyof T): Promise<void> {
		const soundEntry = this.soundNode(name)
		
		// Play the sound
		const endPromise = this.play(soundEntry.sound)

		// Add to ongoing sounds
		let ongoingSounds = this.namesToOngoingSounds.get(name)
		if (!ongoingSounds) {
			this.namesToOngoingSounds.set(name, ongoingSounds = [])
		}
		ongoingSounds.push(soundEntry)

		// Remove from ongoing sounds when done
		void endPromise.then(() => {
			const index = ongoingSounds!.indexOf(soundEntry)
			ongoingSounds!.splice(index, 1)
		})

		return soundEntry.totallyPlayedPromise
	}

	stopSounds() {
		const soundEntries = Array.from(this.namesToOngoingSounds.values()).flat()
		for (const entry of soundEntries) {
			entry.resolveTotallyPlayedPromise = null
			entry.sound.stop()
		}
		this.namesToOngoingSounds.clear()
	}

	playMusic(name: keyof T): Promise<void> {
		// Stop current music
		this.stopMusic()

		// Play song
		const soundEntry = this.soundNode(name)
		this.music = soundEntry
		const endPromise = this.play(this.music.sound)

		// Remove song when done
		void endPromise.then( () => {
			if (this.music === soundEntry) this.music = null
		})

		return soundEntry.totallyPlayedPromise
	}

	playSoundtrackUntilStopped(names: (keyof T)[]) {
		let index = 0

		const playNext = () => {
			void this.playMusic(names[index++ % names.length]!)
				.then(playNext)
		}

		playNext()
	}

	stopMusic() {
		if (this.music) {
			this.music.resolveTotallyPlayedPromise = null
			this.music.sound.stop()
			this.music = null
		}
	}
}
