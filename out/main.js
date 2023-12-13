import assets from "./assets.js";
import { SoundManager } from "./engine/audio.js";
import { ImageManager } from "./engine/images.js";
const canvas = document.getElementById("game");
canvas.width = 640;
canvas.height = canvas.width / 4 * 3;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
const images = await ImageManager.create(assets.images);
const sounds = await SoundManager.create(assets.sounds);
context.drawImage(images.getImage("infantry"), 0, 0);
setInterval(() => {
    sounds.stopMusic();
    console.log("Stopped!!!!!");
}, 2000);
while (true) {
    await sounds.playMusic("death");
    console.log("Sounded!");
}
//# sourceMappingURL=main.js.map