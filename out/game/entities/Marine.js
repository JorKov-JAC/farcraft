import Anim from "../Anim.js";
import Unit from "./Unit.js";
export default class Marine extends Unit {
    constructor(args) {
        args.initialAnimation = new Anim("marine", "idle");
        super(args);
    }
    getSpeed() {
        return 2;
    }
    getRadius() {
        return .4;
    }
    getMaxHealth() {
        return 40;
    }
    classId() {
        return 6;
    }
}
//# sourceMappingURL=Marine.js.map