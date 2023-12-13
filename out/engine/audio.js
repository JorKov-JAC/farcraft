export async function loadSound(audioContext, src) {
    const response = await fetch(src);
    const buffer = await response.arrayBuffer();
    return audioContext.decodeAudioData(buffer);
}
export class SoundManager {
    audioContext;
    namesToSounds;
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
    playSound(name) {
        const buffer = this.namesToSounds.get(name);
        const sound = new AudioBufferSourceNode(this.audioContext, { buffer });
        sound.connect(this.audioContext.destination);
        const promise = new Promise(resolve => sound.onended = () => { resolve(); });
        sound.start();
        return promise;
    }
}
//# sourceMappingURL=audio.js.map