export default class GameStateManager {
    state;
    constructor(state) {
        this.state = state;
        state.enter();
    }
    switch(newState) {
        this.state.exit();
        this.state = newState;
        newState.enter();
    }
    update(dt) {
        this.state.update(dt);
    }
}
export class GameState {
    enter() { }
    exit() { }
}
//# sourceMappingURL=GameState.js.map