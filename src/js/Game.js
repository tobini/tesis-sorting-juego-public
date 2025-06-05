import {Firebase} from "./Firebase.js";
import {GameLogger} from "./GameLogger.js";
import {Helpers} from "./Helpers.js";
import {GameError} from "./exceptions/GameError.js";
import {GameFinished} from "./exceptions/GameFinished.js";
import {LevelFinished} from "./exceptions/LevelFinished";


export class Game {
    static GAME_VERSION = "3.2.2"

    // Action Labels
    static COMPARE_ACTION_LABEL = "COMPARE"
    static SWAP_ACTION_LABEL = "SWAP"
    static SUBMIT_ACTION_LABEL = "SUBMIT"

    // UI Action Labels
    static CLICK_CHECK_SORTING_BUTTON_UI_ACTION_LABEL = "CLICK_CHECK_SORTING_BUTTON"
    static CLICK_COMPARE_BUTTON_UI_ACTION_LABEL = "CLICK_COMPARE_BUTTON"
    static CLICK_SWAP_BUTTON_UI_ACTION_LABEL = "CLICK_SWAP_BUTTON"
    static SELECT_SORTABLE_BUTTON_UI_ACTION_LABEL = "SELECT_SORTABLE"
    static DESELECT_SORTABLE_UI_ACTION_LABEL = "DESELECT_SORTABLE"

    constructor(gameSettings, levelNumber) {
        this._gameSettings = gameSettings;
        this._gameUUID = Helpers.generateUUIDv4();
        this._gameResult = {
            isFinished: false,
            hasWon: null,
            finishReason: null,
        };

        this._startingLevel = levelNumber;
        this._hasPlayedTutorial = false;
        this._isPlayingTutorial = this.hasTutorial();
        this._startTimestamp = null;

        this._currentLevel = levelNumber || 1;
        this._levelResults = [];

        this._sortables = [];
        this._selected = [];

        this._playerData = {};
        this._endGameExtraData = "";
        this._playerEmail = "";

        this._uiActions = [];
        this._actions = [];

        const firebaseConfig = {
            apiKey: "",
            authDomain: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: "",
            appId: "",
            measurementId: "",
            databaseURL: ""
        };

        this._firebase = new Firebase(firebaseConfig);
        if (this.mustSaveToFirebase(true)) this._firebase.init();

        this._logger = new GameLogger(this);
        this._logger.logGameStart();
    }

    startCurrentLevel() {
        this.clearSelection();
        this._cleanUIActions();
        this._cleanActions();
        this._sortables = [];

        let sortables = this.currentLevelSettings().sortables;
        if (Array.isArray(sortables)) {
            for (let i = 0; i < sortables.length; i++) {
                const value = sortables[i];
                this._sortables.push({id: i, value: value});
            }
        } else {
            // Create random array from 1 to `sortables` amount of values. Example: [1, 3, 2] with `sortables` === 3
            const values = [...Array(sortables).keys()].map((elem) => elem + 1)
            for (let i = 0; i < values.length; i++) {
                this._sortables.push({id: i, value: values[i]});
            }
            this._sortables = this._sortables.sort(() => Math.random() - 0.5);
        }

        if (this.currentLevel() === this._startingLevel) {
            this._startTimestamp = Date.now();
            this._persistStartGame();
        }

        this._persistStartLevel();
        this._logger.logLevelStart();
    }

    startTutorial() {
        this.clearSelection();
        this._cleanUIActions();
        this._cleanActions();
        this._sortables = [{id: 0, value: 3}, {id: 1, value: 1}, {id: 2, value: 2}];
        this._persistStartTutorialLevel()
        this._logger.logTutorialStart();
    }

    fillPlayerData(playerData) {
        this._playerData = playerData;
        this._persistPlayerData()
    }

    fillEndGameExtraData(extraData, playerEmail) {
        this._endGameExtraData = extraData;
        this._playerEmail = playerEmail;
        this._persistEndGameExtraData()
    }

    gameName() {
        return this.generalSettings().gameName;
    }

    scenarioName() {
        return this.generalSettings().scenarioName;
    }

    isPlayingTutorial() {
        return this._isPlayingTutorial;
    }

    mustStartTutorial() {
        return this.hasTutorial() && !this._hasPlayedTutorial;
    }

    hasTutorial() {
        return this.generalSettings().startWithTutorial;
    }

    finishTutorial() {
        this._isPlayingTutorial = false;
        this._hasPlayedTutorial = true;
        this._persistFinishTutorialLevel();
    }

    currentLevel() {
        return this._currentLevel;
    }

    amountOfLevels() {
        return this.levelsSettings().length;
    }

    compareSelectedSortables() {
        this._validateNotFinished();

        if (this._selected.length !== 2) {
            throw new GameError("Seleccioná exactamente dos objetos para comparar.");
        }

        this._addAction(this._createActionFor(Game.COMPARE_ACTION_LABEL))
        return this._compareSortables(this._selected[0], this._selected[1]);
    }

    swapSelectedSortables() {
        this._validateNotFinished();

        if (this._selected.length !== 2) {
            throw new GameError("Por favor, seleccioná dos objetos para intercambiar.");
        }

        this._swapSortables(this._selected[0], this._selected[1]);
        this._validateLoseGameConditions();
    }

    checkSorting() {
        this._validateNotFinished();

        this._addAction(this._createActionFor(Game.SUBMIT_ACTION_LABEL))
        let isSorted = this._isSorted();

        if (!isSorted) {
            this._validateLoseGameConditions();
        } else {
            this._finishLevel(true, "¡Nivel finalizado! Ordenaste todo bien :)");
        }
        return isSorted;
    }

    solveSorting() {
        this._sortables.sort((s1, s2) => s1.value - s2.value)
    }

    goToNextLevel() {
        if (this.hasFinishedAllLevels()) {
            throw new GameError("No hay más niveles :(")
        }

        this._currentLevel += 1;
        this.startCurrentLevel();
    }

    hasFinishedAllLevels() {
        return this._currentLevel + 1 > this.amountOfLevels();
    }

    _isSorted() {
        let isSorted = true;
        for (let i = 1; i < this._sortables.length; i++) {
            if (this._sortables[i - 1].value > this._sortables[i].value) {
                isSorted = false;
                break;
            }
        }
        return isSorted;
    }

    _finishLevel(hasWon, finishReason = null) {
        let levelResults = {
            isFinished: true,
            hasWon: hasWon,
            finishReason: finishReason,
            levelNumber: this._currentLevel
        };
        this._levelResults.push(levelResults);
        this._persistFinishLevel();

        if (this.hasFinishedAllLevels()) {
            this._finishGame("¡Juego finalizado! Ya no hay nada más para ordenar");
        } else {
            throw new LevelFinished(levelResults.finishReason, hasWon);
        }
    }

    _finishGame(finishReason = null) {
        this._gameResult.isFinished = true;
        this._gameResult.hasWon = true;
        this._gameResult.finishReason = finishReason;

        this._persistFinishGame();

        throw new GameFinished(this._gameResult.finishReason);
    }

    _validateNotFinished() {
        if (this._gameResult.isFinished) {
            throw new LevelFinished(this._gameResult.finishReason);
        }
    }

    // deprecated
    _validateLoseGameConditions() {
        let finishReason;
        if (this._amountOfSubmitsMade() === this.currentLevelSettings().maxAmountOfSubmits) finishReason = "¡Nivel finalizado! No podés hacer más submits";
        if (this._amountOfSwapsMade() === this.currentLevelSettings().maxAmountOfSwaps) finishReason = "¡Nivel finalizado! No podés hacer más swaps";

        if (finishReason) {
            this._finishLevel(false, finishReason);
        }
    }

    _compareSortables(leftSortable, rightSortable) {
        if (leftSortable.value > rightSortable.value) {
            return ">";
        } else if (leftSortable.value < rightSortable.value) {
            return "<";
        } else {
            return "=";
        }
    }

    _swapSortables(leftSortable, rightSortable) {
        this._addAction(this._createActionFor(Game.SWAP_ACTION_LABEL))
        const leftIndex = this._sortables.indexOf(leftSortable);
        const rightIndex = this._sortables.indexOf(rightSortable);

        this._sortables[leftIndex] = rightSortable;
        this._sortables[rightIndex] = leftSortable;

        this._selected[0] = rightSortable;
        this._selected[1] = leftSortable;
    }

    _amountOfSwapsMade() {
        return this._actions.filter((action) => action.label === Game.SWAP_ACTION_LABEL).length
    }


    _amountOfSubmitsMade() {
        return this._actions.filter((action) => action.label === Game.SUBMIT_ACTION_LABEL).length
    }

    id() {
        return this._gameUUID;
    }

    gameSettings() {
        return this._gameSettings;
    }

    generalSettings() {
        return this._gameSettings.generalSettings;
    }

    levelsSettings() {
        return this._gameSettings.levels;
    }

    currentLevelSettings() {
        if (this._isPlayingTutorial) {
            return {
                sortables: [3, 1, 2],
            }
        }

        return this._gameSettings.levels[this._currentLevel - 1];
    }

    nextLevelSettings() {
        return this._gameSettings.levels[this._currentLevel] || {};
    }

    sortables() {
        return this._sortables;
    }

    selectSortable(sortableId) {
        if (this._selected.length >= 2) {
            throw new GameError("No se puede elegir más de dos objetos a la vez")
        }

        let sortable = this._getSortableById(sortableId);

        if (this._selected.length === 0) {
            this._selected.push(sortable);
        } else {
            // adds sortables to array according to their index (to compare them keeping the relative order between them)
            const sortableIndex = this._sortables.findIndex((s) => s.id === sortableId);
            const selectedSortable = this._selected[0];
            const selectedSortableIndex = this._sortables.findIndex((s) => s.id === selectedSortable.id);

            if (sortableIndex > selectedSortableIndex) {
                this._selected.push(sortable);
            } else {
                this._selected.unshift(sortable);
            }
        }
    }

    deselectSortable(sortableId) {
        const selectedIndex = this._selected.findIndex((sortable) => sortable.id === sortableId);
        if (selectedIndex !== -1) {
            this._selected.splice(selectedIndex, 1);
        }
    }

    clearSelection() {
        this._selected = [];
    }

    presentSortablesFromAction(action) {
        let presentedSortables = "";
        for (let sortable of action.sortablesOrder) {
            if (action.selectedSortables.includes(sortable)) {
                presentedSortables += `[${sortable.value}],`;
            } else {
                presentedSortables += `${sortable.value},`;
            }
        }
        return presentedSortables.slice(0, -1);
    }

    _getSortableById(sortableId) {
        return this._sortables.filter((sortable) => sortable.id === sortableId)[0]
    }

    _createActionFor(label) {
        return {
            timestamp: Date.now(),
            label: label,
            sortablesOrder: [...this._sortables],
            selectedSortables: [...this._selected]
        }
    }

    _createUIActionFor(label, data) {
        return {
            timestamp: Date.now(),
            label: label,
            data: data
        }
    }

    _logAction(action) {
        let actionNumber = this._actions.length + 1;
        this._logger.logAction(actionNumber, action)
    }

    _addAction(action) {
        this._logAction(action);
        this._actions.push(action);
        this._persistAction(action);
    }

    notifyUIAction(label, data) {
        let uiAction = this._createUIActionFor(label, data);
        this._uiActions.push(uiAction);
        this._persistUIAction(uiAction);
    }

    _cleanActions() {
        this._actions = [];
    }

    _cleanUIActions() {
        this._uiActions = [];
    }

    /* Persist in Firebase DB methods */

    _persistStartTutorialLevel() {
        let docRefPath = `games/${this._gameUUID}/tutorialStart`;
        let data = {
            timestamp: Date.now(),
        }
        this._persistToFirebaseDb(docRefPath, data, true);
    }

    _persistFinishTutorialLevel() {
        let docRefPath = `games/${this._gameUUID}/tutorialFinish`;
        let data = {
            timestamp: Date.now(),
        }
        this._persistToFirebaseDb(docRefPath, data, true);
    }

    _persistPlayerData() {
        let docRefPath = `games/${this._gameUUID}/playerData`;
        let data = this._playerData;
        this._persistToFirebaseDb(docRefPath, data, true);
    }

    _persistStartGame() {
        let docRefPath = `games/${this._gameUUID}/gameStart`;
        let data = {
            gameVersion: Game.GAME_VERSION,
            gameName: this.gameName(),
            scenarioName: this.scenarioName(),
            gameSettings: JSON.stringify(this._gameSettings),
            startingLevel: this._startingLevel,
            timestamp: this._startTimestamp,
        }
        this._persistToFirebaseDb(docRefPath, data);
    }

    _persistEndGameExtraData() {
        let docRefPath = `games/${this._gameUUID}/endGameExtraData`;
        let data = {
            extraData: this._endGameExtraData,
            email: this._playerEmail,
        };
        this._persistToFirebaseDb(docRefPath, data);
    }

    _persistAction(action) {
        let actionNumber = this._actions.indexOf(action) + 1;
        let docRefPath = `games/${this._gameUUID}/levels/level-${this._currentLevel}/actions/${actionNumber.toString()}`;
        let data = {
            actionNumber: actionNumber,
            label: action.label,
            sortables: this.presentSortablesFromAction(action),
            timestamp: action.timestamp,
        }
        this._persistToFirebaseDb(docRefPath, data);
    }

    _persistStartLevel() {
        let docRefPath = `games/${this._gameUUID}/levels/level-${this._currentLevel}/start`;
        let sortablesAsJson = JSON.stringify(this._sortables.map((sortable) => sortable.value));
        let sortablesFormatted = sortablesAsJson.slice(1, sortablesAsJson.length - 1)
        let data = {
            sortables: sortablesFormatted,
            levelSettings: JSON.stringify(this.currentLevelSettings()),
            timestamp: Date.now(),
        }
        this._persistToFirebaseDb(docRefPath, data);
    }

    persistUISortables(uiSortables) {
        let docRefPath = `games/${this._gameUUID}/levels/level-${this._currentLevel}/uiSortables`;
        let data = {
            uiSortables: JSON.stringify(uiSortables),
            timestamp: Date.now(),
        }
        this._persistToFirebaseDb(docRefPath, data);
    }

    _persistFinishLevel() {
        let actionNumber = this._actions.length + 1;
        let lastAction = this._actions[actionNumber - 2];
        let docRefPath = `games/${this._gameUUID}/levels/level-${this._currentLevel}/finish`;
        let data = {
            timestamp: Date.now(),
            sortables: this.presentSortablesFromAction(lastAction),
        }
        this._persistToFirebaseDb(docRefPath, data);
    }

    _persistFinishGame() {
        let docRefPath = `games/${this._gameUUID}/gameFinish`;
        let data = {
            // amountOfLevelsSolved: this.levelsSettings().length - this._startingLevel + 1, timestamp: Date.now(),
            // timeSpentInGameInSeconds: new Date(Date.now() - this._startTimestamp).getTime() / 1000,
            // gameResult: this._gameResult,
            // allLevelResults: this.hasTutorial() ? this._levelResults.slice(1) : this._levelResults,
            timestamp: Date.now(),
        }
        this._persistToFirebaseDb(docRefPath, data);
    }

    _persistUIAction(uiAction) {
        let uiActionNumber = this._uiActions.indexOf(uiAction) + 1;
        let docRefPath = `games/${this._gameUUID}/levels/level-${this._currentLevel}/ui-actions/${uiActionNumber.toString()}`;
        let data = {
            label: uiAction.label,
            data: uiAction.data,
            timestamp: Date.now(),
        }
        this._persistToFirebaseDb(docRefPath, data);
    }

    _persistToFirebaseDb(docRefPath, data, force = false) {
        if (this.mustSaveToFirebase(force)) {
            console.debug(`Saving to Firebase DB... (docRefPath: "${docRefPath}")`)
            this._firebase.saveToDb(docRefPath, data)
        } else {
            console.debug(`Trying to save to Firebase DB but saveToFirebase setting is set to false or the player is playing the tutorial (docRefPath: "${docRefPath}")`)
        }
    }

    mustSaveToFirebase(force = false) {
        return this.generalSettings().saveToFirebase && (force || !this._isPlayingTutorial);
    }
}
