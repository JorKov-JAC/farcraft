import Unit from "./Unit.js";
export default class Marine extends Unit {
    getMaxHealth() {
        throw new Error("Method not implemented.");
    }
    update(dt) {
        super.update(dt);
        throw new Error("Method not implemented.");
    }
    render() {
        super.render();
        throw new Error("Method not implemented.");
    }
    classId() {
        return 5;
    }
}
//# sourceMappingURL=Marine.js.map