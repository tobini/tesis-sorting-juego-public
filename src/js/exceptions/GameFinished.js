export class GameFinished extends Error {
    constructor(message) {
        super(message);
        this.name = "GameFinished";
    }
}