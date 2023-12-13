const loadedSounds = Object.create(null);
export async function loadSound(audioContext, src) {
    if (!loadedSounds[src]) {
        let resolver;
        loadedSounds[src] = new Promise(resolve => resolver = resolve);
        const response = await fetch(src);
        const buffer = await response.arrayBuffer();
        resolver(audioContext.decodeAudioData(buffer));
    }
    return loadedSounds[src];
}
export class SoundManager {
    audioContext;
    namesToSounds;
    namesToOngoingSounds = new Map();
    music = null;
    constructor(audioContext, namesToSounds) {
        this.audioContext = audioContext;
        this.namesToSounds = namesToSounds;
    }
    static async create(soundAssets) {
        const audioContext = new AudioContext();
        const names = [];
        const promises = [];
        for (const assetName in soundAssets) {
            names.push(assetName);
            const path = "assets/" + soundAssets[assetName];
            promises.push(loadSound(audioContext, path));
        }
        const sounds = await Promise.all(promises);
        const namesToSounds = new Map();
        for (let i = 0; i < names.length; ++i) {
            namesToSounds.set(names[i], sounds[i]);
        }
        return new SoundManager(audioContext, namesToSounds);
    }
    soundNode(name, options) {
        const buffer = this.namesToSounds.get(name);
        const sound = new AudioBufferSourceNode(this.audioContext, { ...options, buffer });
        let resolveTotallyPlayedPromise = null;
        const totallyPlayedPromise = new Promise(resolve => {
            resolveTotallyPlayedPromise = resolve;
        });
        const soundEntry = {
            sound,
            totallyPlayedPromise,
            resolveTotallyPlayedPromise
        };
        sound.addEventListener("ended", () => {
            soundEntry.resolveTotallyPlayedPromise?.();
        });
        return soundEntry;
    }
    play(sound) {
        sound.connect(this.audioContext.destination);
        const promise = new Promise(resolve => {
            sound.addEventListener("ended", () => { resolve(); });
        });
        sound.start();
        return promise;
    }
    playSound(name) {
        const soundEntry = this.soundNode(name);
        const endPromise = this.play(soundEntry.sound);
        let ongoingSounds = this.namesToOngoingSounds.get(name);
        if (!ongoingSounds) {
            this.namesToOngoingSounds.set(name, ongoingSounds = []);
        }
        ongoingSounds.push(soundEntry);
        void endPromise.then(() => {
            const index = ongoingSounds.indexOf(soundEntry);
            ongoingSounds.splice(index, 1);
        });
        return soundEntry.totallyPlayedPromise;
    }
    stopSounds() {
        const soundEntries = Array.from(this.namesToOngoingSounds.values()).flat();
        for (const entry of soundEntries) {
            entry.resolveTotallyPlayedPromise = null;
            entry.sound.stop();
        }
        this.namesToOngoingSounds.clear();
    }
    playMusic(name) {
        this.stopMusic();
        const soundEntry = this.soundNode(name);
        this.music = soundEntry;
        const endPromise = this.play(this.music.sound);
        void endPromise.then(() => {
            if (this.music === soundEntry)
                this.music = null;
        });
        return soundEntry.totallyPlayedPromise;
    }
    playSoundtrackUntilStopped(names) {
        let index = 0;
        const playNext = () => {
            void this.playMusic(names[index++ % names.length])
                .then(playNext);
        };
        playNext();
    }
    stopMusic() {
        if (this.music) {
            this.music.resolveTotallyPlayedPromise = null;
            this.music.sound.stop();
            this.music = null;
        }
    }
}
//# sourceMappingURL=audio.js.map