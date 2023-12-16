export default class GameStateManager {
    state;
    constructor(state) {
        this.state = state;
    }
    switch(newState) {
        this.state.exit();
        this.state = newState;
    }
}
export class GameState {
    exit() { }
}
//# sourceMappingURL=GameState.js.map