import '../../scss/game.scss';

import {useEffect, useState} from 'react';
import classNames from 'classnames';
import ConfettiExplosion from 'react-confetti-explosion';

import {Game} from "../Game";
import {GameError} from "../exceptions/GameError.js";
import {GameFinished} from "../exceptions/GameFinished.js";
import {LevelFinished} from "../exceptions/LevelFinished.js";

import useImagePreloader from "../hooks/useImagePreloader";
import {PlayerDataForm} from "../forms/PlayerDataForm";
import {UIActionNotifier} from "./UIActionNotifier";
import {EndGameForm} from "../forms/EndGameForm";
import Joyride, {ACTIONS, EVENTS} from 'react-joyride';
import {SORTABLE_IMAGES} from "./Images";

export function GameView({game}) {
    const scenarioName = game.generalSettings().scenarioName;
    const labelSmaller = game.generalSettings().labels.smaller;
    const labelBigger = game.generalSettings().labels.bigger;
    const labelSortable = game.generalSettings().labels.sortable;
    const IMAGES = SORTABLE_IMAGES[scenarioName]

    // TODO (not urgent): add spinner and wait until imagesPreloaded is true to show the rest of the game
    useImagePreloader(IMAGES);

    // Form state
    const [showPlayerForm, setShowPlayerForm] = useState(game.generalSettings().showPlayerForm);

    // Game state
    const [sortableImageIds, setSortableImageIds] = useState(Array.from([...Array(IMAGES.length).keys()], (x) => x + 1));

    useEffect(() => {
        if (game.generalSettings().randomize) {
            sortableImageIds.sort(() => 0.5 - Math.random());
        }
    }, [])

    const [gameStarted, setGameStarted] = useState(false);
    const [isGameFinished, setIsGameFinished] = useState(false);
    const [isLevelFinished, setIsLevelFinished] = useState(false);
    const [sortables, setSortables] = useState([]);
    const [selectedSortables, setSelectedSortables] = useState([]);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [showAlertNotSorted, setShowAlertNotSorted] = useState(false);

    // Tutorial state
    const [mustPlayTutorial, setMustPlayTutorial] = useState(game.hasTutorial());
    const [isTutorialRunning, setIsTutorialRunning] = useState(false);
    const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
    const tutorialSteps = [
        {
            target: '#game-container',
            title: '¡Hola!',
            disableBeacon: true,
            placement: "center",
            content: <>En este juego hay que ordenar {labelSortable}s del más {labelSmaller} (izquierda) al
                más {labelBigger} (derecha).<br/><br/>Para ordenar vas a poder hacer 2 cosas:<br/>- comparar
                2 {labelSortable}s (y averiguar cuál es más {labelSmaller}/{labelBigger})<br/>- intercambiar
                2 {labelSortable}s de lugar.</>
        },
        {
            target: '#list',
            disableBeacon: true,
            content: `En esta sección se encuentran los ${labelSortable}s a ordenar, donde se puede ver de qué lado tiene que quedar el más ${labelSmaller} y de qué lado el más ${labelBigger}.`,
        },
        {
            target: '#sortable-0',
            disableBeacon: true,
            hideFooter: true,
            spotlightClicks: true,
            spotlightPadding: 5,
            content: `Tanto para comparar como para intercambiar, primero hay que elegir dos ${labelSortable}s. Para probar elijamos este… (hacé click en el ${labelSortable})`,
        },
        {
            target: '#sortable-2',
            disableBeacon: true,
            hideFooter: true,
            spotlightClicks: true,
            spotlightPadding: 5,
            content: '...¡Y este!',
        },
        {
            target: '#compare-swap',
            disableBeacon: true,
            content: `En esta sección vas a ver los ${labelSortable}s que elegiste. Acá los vas a poder comparar e intercambiar de lugar.`,
        },
        {
            target: '#button-compare',
            disableBeacon: true,
            hideFooter: true,
            spotlightClicks: true,
            content: 'Para comparar apretá este botón. Probalo.',
        },
        {
            target: '#compare-swap',
            disableBeacon: true,
            content: `¡Bien! Esto nos indicará cuál es el ${labelSortable} más ${labelSmaller}/${labelBigger}. En este caso, el ${labelSortable} de la izquierda es más ${labelBigger} que el de la derecha.`,
        },
        {
            target: '#button-swap',
            disableBeacon: true,
            hideFooter: true,
            spotlightClicks: true,
            content: `Podemos intercambiar los lugares de los 2 ${labelSortable}s seleccionados. Tocá el botón de "Intercambiar" para lograrlo.`,
        },
        {
            target: '#button-submit',
            disableBeacon: true,
            hideFooter: true,
            spotlightClicks: true,
            content: <>¡Perfecto! Cuando estén todos los {labelSortable}s ordenados chequeá que lo hiciste bien con el
                botón "¡Revisar orden!".<br/><br/>Si
                están bien ordenados pasás al próximo nivel, si no vas a tener que continuar trabajando hasta
                lograrlo.<br/><br/>Apretá el botón para terminar el tutorial.</>,
        },
        {
            target: '#finish-tutorial',
            disableBeacon: true,
            hideFooter: true,
            spotlightClicks: true,
            content: <>Ya sabés todo de la herramienta.<br/>Clickeá acá para comenzar.</>,
        },
    ];

    const handleJoyrideCallback = (data) => {
        const {action, index, type} = data;
        if (action === ACTIONS.NEXT && type === EVENTS.STEP_AFTER) setTutorialStepIndex(index + 1)
    };

    const startLevel = () => {
        resetGameState();
        if (game.mustStartTutorial()) {
            game.startTutorial();
            setIsTutorialRunning(true);
        } else {
            game.startCurrentLevel();
            setGameStarted(true);
        }

        let sortables = game.sortables();
        let graphics = [];
        for (let i = 0; i < sortables.length; i++) {
            let sortable = sortables[i];

            let sortableImageId = sortable.value;
            let sortableImageIndex = sortable.value - 1;

            if (game.generalSettings().randomize) {
                sortableImageId = sortableImageIds.shift();
                sortableImageIndex = sortableImageId - 1;
                setSortableImageIds([...sortableImageIds])
            }

            graphics.push({
                id: sortable.id,
                value: sortable.value,
                sortableImageId: sortableImageId,
                sortableImageIndex: sortableImageIndex
            });
        }

        game.persistUISortables(graphics)

        setSortables(graphics);
    }

    const resetGameState = () => {
        setIsGameFinished(false);
        setIsLevelFinished(false);
        setSortables([]);
        setSelectedSortables([]);
        setComparisonResult(null);
        setShowAlertNotSorted(false);
    }

    const handlePlayerFormSubmit = (playerData) => {
        game.fillPlayerData(playerData);
        setShowPlayerForm(false)
    }

    const handleEndGameFormSubmit = (extraData, email) => {
        game.fillEndGameExtraData(extraData, email);
    }

    function goToNextStepInTutorial() {
        setTutorialStepIndex(tutorialStepIndex + 1);
    }

    const _makeGameAction = (gameActionFn) => {
        try {
            gameActionFn();
            // this._updateGUITexts();
        } catch (exception) {
            if (exception instanceof GameError) {
                alert(exception.message);
            } else if (exception instanceof LevelFinished) {
                // this._stopTimer();
                setIsLevelFinished(true);
                goToNextStepInTutorial();
                if (!exception.hasWon) {
                    alert(exception.message);
                }
            } else if (exception instanceof GameFinished) {
                // this._stopTimer();
                setIsGameFinished(true);
            } else {
                throw exception;
            }
        }
    }

    const selectOrDeselectSortable = (sortable) => {
        if (isSortableSelected(sortable)) {
            deselectSortable(sortable);
        } else {
            selectSortable(sortable);
        }
    }

    const removeComparisonResult = () => {
        setComparisonResult(null);
    }

    const selectSortable = (sortable) => {
        if (!isSortableSelected(sortable)) {
            if (selectedSortables.length === 0) {
                game.selectSortable(sortable.id);
                setSelectedSortables([sortable]);
            } else if (selectedSortables.length === 1) {
                const sortableIndex = sortables.findIndex((s) => s.id === sortable.id);
                const selectedSortable = selectedSortables[0];
                const selectedSortableIndex = sortables.findIndex((s) => s.id === selectedSortable.id);

                if (sortableIndex > selectedSortableIndex) {
                    game.selectSortable(sortable.id);
                    setSelectedSortables([...selectedSortables, sortable]);
                } else {
                    game.selectSortable(sortable.id);
                    setSelectedSortables([sortable, ...selectedSortables]);
                }
            } else {
                game.clearSelection();
                game.selectSortable(sortable.id);
                setSelectedSortables([sortable]);
            }
            removeComparisonResult();
        }

        // Tutorial
        goToNextStepInTutorial();
    }

    const deselectSortable = (sortable) => {
        if (isSortableSelected(sortable)) {
            removeComparisonResult();
            let selectedIndex = selectedSortables.findIndex((selectedSortable) => selectedSortable.id === sortable.id);
            let newSelectedSortables = [...selectedSortables];
            newSelectedSortables.splice(selectedIndex, 1);
            setSelectedSortables(newSelectedSortables);
            game.deselectSortable(sortable.id);
        }
    }

    const isSortableSelected = (sortable) => {
        let selectedIndex = selectedSortables.findIndex((selectedSortable) => selectedSortable.id === sortable.id);
        return selectedIndex !== -1;
    }

    const compareSortables = () => {
        if (!comparisonResult) { // prevents unnecessary multiple comparisons
            _makeGameAction(() => {
                // ">" / "<" / "="
                let comparisonResult = game.compareSelectedSortables();
                setComparisonResult(comparisonResult)

                // Tutorial
                goToNextStepInTutorial()
            })
        }
    }

    const swapSortables = () => {
        _makeGameAction(() => {
            const leftSortable = selectedSortables[0];
            const rightSortable = selectedSortables[1];
            let newLeftSortable = {...rightSortable};
            let newRightSortable = {...leftSortable};
            const newSortableGraphics = sortables.map((sortable) => {
                if (sortable.id === leftSortable.id) {
                    return newLeftSortable;
                } else if (sortable.id === rightSortable.id) {
                    return newRightSortable
                } else {
                    return sortable;
                }
            })

            game.swapSelectedSortables();
            game.clearSelection();
            setComparisonResult(null)
            setSortables(newSortableGraphics);
            setSelectedSortables([])

            // Tutorial
            goToNextStepInTutorial()
        })
    }

    const checkSorting = () => {
        _makeGameAction(() => {
            // Tutorial
            if (game.isPlayingTutorial()) {
                game.solveSorting()
            }

            const isSorted = game.checkSorting();

            if (!isSorted) {
                setShowAlertNotSorted(true);
                setTimeout(() => setShowAlertNotSorted(false), 4000);
            }

            // Tutorial
            goToNextStepInTutorial()
        });
    }

    const goToNextLevel = () => {
        _makeGameAction(() => {
            game.goToNextLevel();
            startLevel();
        });
    }

    const closeAlert = () => {
        setShowAlertNotSorted(false);
        goToNextStepInTutorial();
    }

    const renderSortables = () => {
        return sortables.map((sortable, index) => {
            let compareAlertClassName;
            if (comparisonResult && sortable.id === selectedSortables[0].id) {
                compareAlertClassName = comparisonResultClassName("left")
            } else if (comparisonResult && sortable.id === selectedSortables[1].id) {
                compareAlertClassName = comparisonResultClassName("right")
            }

            const isSelectingSortable = !isSortableSelected(sortable);
            const uiActionData = {...sortable, index: sortables.findIndex((s) => s.id === sortable.id)}

            return (
                <UIActionNotifier game={game} disabled={_isLevelOrGameFinished()} key={sortable.id}
                                  data={JSON.stringify(uiActionData)}
                                  label={isSelectingSortable ? Game.SELECT_SORTABLE_BUTTON_UI_ACTION_LABEL : Game.DESELECT_SORTABLE_UI_ACTION_LABEL}>
                    <div
                        className={classNames("sortable", {
                            "selected": isSortableSelected(sortable),
                            "indistinguishable": game.currentLevelSettings().indistinguishable
                        })}
                        id={`sortable-${index}`}
                        disabled={_isLevelOrGameFinished()}
                        onClick={() => {
                            selectOrDeselectSortable(sortable)
                        }}>
                        {comparisonResult && <div className={classNames("compare-alert", compareAlertClassName)}/>}
                        <img src={IMAGES[sortable.sortableImageIndex]} alt={"sortable"} draggable={false} className="prevent-drag"/>
                    </div>
                </UIActionNotifier>
            )
        })
    }

    const comparisonResultClassName = (fromLeftOrRight) => {
        if (comparisonResult === ">") {
            return fromLeftOrRight === "left" ? "bigger" : "smaller";
        } else if (comparisonResult === "<") {
            return fromLeftOrRight === "left" ? "smaller" : "bigger";
        } else if (comparisonResult === "=") {
            return "equal"
        }
        return "";
    }

    const comparisonResultTag = (fromLeftOrRight) => {
        if (comparisonResult === ">") {
            return "Más " + (fromLeftOrRight === "left" ? labelBigger : labelSmaller);
        } else if (comparisonResult === "<") {
            return "Más " + (fromLeftOrRight === "left" ? labelSmaller : labelBigger);
        } else if (comparisonResult === "=") {
            return "Iguales"
        }
        return "";
    }

    const renderComparisonResult = (leftOrRight) => {
        if (!(["left", "right"].includes(leftOrRight))) {
            throw new Error(`Comparison result should be checked with left or right, not '${leftOrRight}'`);
        }

        if (comparisonResult) {
            return <div className={classNames("compare-alert", comparisonResultClassName(leftOrRight))}>
                <span>{comparisonResultTag(leftOrRight)}</span>
            </div>
        }
        return null;
    }

    const _hasSelectedTwoSortables = () => {
        return selectedSortables.length === 2;
    }

    const _isLevelOrGameFinished = () => {
        return isLevelFinished || isGameFinished;
    }

    const finishTutorial = () => {
        game.finishTutorial();
        setMustPlayTutorial(false);
        setIsTutorialRunning(false);
    }

    const gameTemplate = () => {
        return <>
            {(mustPlayTutorial && !isTutorialRunning) && <div className="black-overlay">
                {game.currentLevelSettings().message &&
                    <span className="message">{game.currentLevelSettings().message}</span>}
                <span className="button" onClick={startLevel}>Empezar el tutorial</span>
            </div>}
            {((tutorialStepIndex === tutorialSteps.length - 1) && isTutorialRunning) && <div className="black-overlay">
                <span className="button" id="finish-tutorial" onClick={finishTutorial}>Continuar</span>
            </div>}
            {(!gameStarted && !mustPlayTutorial) && <div className="black-overlay">
                {game.currentLevelSettings().message &&
                    <span className="message">{game.currentLevelSettings().message}</span>}
                <span className="button" onClick={startLevel}>Comenzar</span>
            </div>}
            {(gameStarted && isLevelFinished && !isGameFinished) && <div className="black-overlay">
                {game.nextLevelSettings().message &&
                    <span className="message">{game.nextLevelSettings().message}</span>}
                <span className="button" onClick={goToNextLevel}>Ir al siguiente nivel</span>
            </div>}
            {isGameFinished && <div className="black-overlay">
                <span className="message">¡Felicitaciones!<br/>¡Terminaste el juego!</span>
                {game.generalSettings().showEndGameForm && <EndGameForm onSubmit={handleEndGameFormSubmit}/>}
            </div>}
            <div id="game-container">
                <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    {_isLevelOrGameFinished() ?
                        <ConfettiExplosion force={0.8} duration={2500} particleCount={200} width={1600}/> : null}
                </div>
                <div id="header">
                    {showAlertNotSorted && <div className="alert">
                        <span className="close-alert" onClick={closeAlert}>X</span>
                        <span className="message">Algo no está bien ordenado... ¡Seguí intentando!</span>
                    </div>}
                    <span className="level">Nivel {game.currentLevel()}/{game.amountOfLevels()}</span>
                </div>
                <div id="compare-swap">
                    <div className={classNames("big-sortable", {
                        "empty": !_hasSelectedTwoSortables(),
                        "indistinguishable": game.currentLevelSettings().indistinguishable
                    })}>
                        {renderComparisonResult("left")}
                        {_hasSelectedTwoSortables() &&
                            <img src={IMAGES[selectedSortables[0].sortableImageIndex]}
                                 alt={"big sortable left"}/>}
                    </div>
                    <div className="buttons">
                        <UIActionNotifier game={game} label={Game.CLICK_COMPARE_BUTTON_UI_ACTION_LABEL}
                                          disabled={_isLevelOrGameFinished() || !_hasSelectedTwoSortables()}>
                            <div className="button" id="button-compare"
                                 disabled={_isLevelOrGameFinished(0) || !_hasSelectedTwoSortables()}
                                 onClick={compareSortables}>
                                <span>Comparar</span>
                            </div>
                        </UIActionNotifier>
                        <UIActionNotifier game={game} label={Game.CLICK_SWAP_BUTTON_UI_ACTION_LABEL}
                                          disabled={_isLevelOrGameFinished() || !_hasSelectedTwoSortables()}>
                            <div className="button" id="button-swap"
                                 disabled={_isLevelOrGameFinished() || !_hasSelectedTwoSortables()}
                                 onClick={swapSortables}>
                                <span>Intercambiar</span>
                            </div>
                        </UIActionNotifier>
                    </div>
                    <div className={classNames("big-sortable", {
                        "empty": !_hasSelectedTwoSortables(),
                        "indistinguishable": game.currentLevelSettings().indistinguishable
                    })}>
                        {renderComparisonResult("right")}
                        {_hasSelectedTwoSortables() &&
                            <img src={IMAGES[selectedSortables[1].sortableImageIndex]}
                                 alt={"big sortable right"}/>}
                    </div>
                </div>
                <div id="list" onClick={(e) => {
                    if (e.target.id === "list") {
                        game.clearSelection();
                        setComparisonResult(null);
                        setSelectedSortables([]);
                    }
                }}>
                    <span className="order-label left">Más {labelSmaller}</span>
                    {renderSortables()}
                    <span className="order-label right">Más {labelBigger}</span>
                </div>
                <div id="footer">
                    <UIActionNotifier game={game} label={Game.CLICK_CHECK_SORTING_BUTTON_UI_ACTION_LABEL}
                                      disabled={_isLevelOrGameFinished()}>
                        <div className="button" id="button-submit" disabled={_isLevelOrGameFinished()}
                             onClick={checkSorting}>
                            <span>¡Revisar orden!</span>
                        </div>
                    </UIActionNotifier>
                </div>
            </div>
        </>;
    }

    const render = () => {
        return <div id="game-body" className={scenarioName}>
            <Joyride
                callback={handleJoyrideCallback}
                continuous={true}
                disableCloseOnEsc={true}
                disableOverlayClose={true}
                hideBackButton={true}
                hideCloseButton={true}
                run={isTutorialRunning}
                locale={{
                    back: 'Atrás',
                    close: 'Cerrar',
                    last: 'Último',
                    next: 'Siguiente',
                    open: 'Abrir el modal',
                    skip: 'Saltear'
                }}
                showSkipButton={false}
                steps={tutorialSteps}
                stepIndex={tutorialStepIndex}
                styles={{
                    options: {
                        zIndex: 10000,
                    },
                }}
            />
            {showPlayerForm ? <PlayerDataForm onSubmit={handlePlayerFormSubmit}/> : gameTemplate()}
        </div>
    };


    return render();
}

