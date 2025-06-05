export class LevelFinished extends Error {
    constructor(message, hasWon) {
        super(message);
        this.hasWon = hasWon;
        this.name = "LevelFinished";
    }
}
