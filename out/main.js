import { getImage } from "./engine/images.js";
const canvas = document.getElementById("game");
canvas.width = 640;
canvas.height = canvas.width / 4 * 3;
const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
getImage("infantry").then(e => {
    console.log("Done!");
    context.drawImage(e, 0, 0);
});
//# sourceMappingURL=main.js.map