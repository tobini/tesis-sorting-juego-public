import {GameView} from "./GameView.js";

import React from 'react';
import {BrowserRouter, Route, Routes, useLocation} from 'react-router-dom';
import {GameSettings} from "../GameSettings";
import {Game} from "../Game";

function SelectedOrRandomGameComponent() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    let randomTest = queryParams.has('game');

    let selectedLevelNumber = 1;
    let gameSettings;

    if (randomTest) {
        // const TEST_SUITES = [1, 3, 5];
        const REAL_SUITES = [2, 4, 6];
        const randomIndex = Math.floor(Math.random() * REAL_SUITES.length);
        gameSettings = GameSettings[REAL_SUITES[randomIndex] - 1];
    } else {
        let selectedSuiteNumber = parseInt(queryParams.get('suite') || 1);
        selectedLevelNumber = parseInt(queryParams.get('level') || 1);

        selectedSuiteNumber = selectedSuiteNumber > GameSettings.length ? 1 : selectedSuiteNumber;
        gameSettings = GameSettings[selectedSuiteNumber - 1];
        selectedLevelNumber = selectedLevelNumber > gameSettings.levels.length ? 1 : selectedLevelNumber;
    }

    let game = new Game(gameSettings, selectedLevelNumber);
    return <GameView game={game}/>;
}

export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SelectedOrRandomGameComponent/>}/>
            </Routes>
        </BrowserRouter>
    );
}
