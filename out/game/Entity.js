export default class Entity {
    baseUpdate(dt) {
        this.updateImpl(dt);
    }
    baseRender() {
        this.renderImpl();
    }
    shouldCleanUp() { return false; }
}
//# sourceMappingURL=Entity.js.map