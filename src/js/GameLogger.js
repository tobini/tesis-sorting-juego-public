import {Game} from "./Game.js";
import {Helpers} from "./Helpers.js";

export class GameLogger {

    constructor(game) {
        this._game = game;
    }

    logGameStart() {
        let now = Date.now();
        let gameId = this._game.id();
        let settings = this._game.gameSettings();
        let gameName = this._game.gameName();
        let currentLevel = this._game.currentLevel();

        console.debug(`[GAME START]\nGame Version: ${Game.GAME_VERSION}\nGameID: ${gameId}\nGame Name: ${gameName}\nDate: ${Helpers.formatDate(now)}, Time: ${Helpers.formatTime(now)}\nStarting From Level Number: ${currentLevel}\nGame Settings: ${JSON.stringify(settings, null, 2)}`)
    }

    logLevelStart() {
        let now = Date.now();
        let settings = this._game.currentLevelSettings()
        let currentLevel = this._game.currentLevel();

        console.debug(`[LEVEL START]\nDate: ${Helpers.formatDate(now)}, Time: ${Helpers.formatTime(now)}\nLevel Number: ${currentLevel}\nLevel Settings: ${JSON.stringify(settings, null, 2)}`)
    }

    logTutorialStart() {
        let now = Date.now();
        console.debug(`[TUTORIAL START]\nDate: ${Helpers.formatDate(now)}, Time: ${Helpers.formatTime(now)}`)
    }

    logAction(actionNumber, action) {
        console.debug(`[ACTION] ${actionNumber},${Helpers.formatTime(action.timestamp)},${action.label},${this._game.presentSortablesFromAction(action)}`);
    }
}
