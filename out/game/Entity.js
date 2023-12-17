export default class Entity {
    pos;
    anim;
    constructor(args) {
        this.pos = args.pos;
        this.anim = args.initialAnimation;
    }
    baseUpdate(dt) {
        this.updateImpl(dt);
    }
    baseRender() {
        this.renderImpl();
    }
    shouldCleanUp() { return false; }
    getCurrentSprite() {
        return this.anim.getSprite();
    }
}
//# sourceMappingURL=Entity.js.map