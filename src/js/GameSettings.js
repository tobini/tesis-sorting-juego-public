import {CARDS_SCENARIO_SETTINGS, MUSEUM_SCENARIO_SETTINGS, PERFUMES_SCENARIO_SETTINGS} from "./ScenarioSettings";

export const GameSettings = [
    /*
    levelSettings not used:

    showTimer: false,
    showAmountOfActionsMade: false,
    maxAmountOfSubmits: null,
    maxAmountOfSwaps: null,

     */

    // Suite 1
    {
        generalSettings: {
            ...MUSEUM_SCENARIO_SETTINGS,
            gameName: "Museum - Todo resuelto / 3 elementos (no form, no firebase)",
            startWithTutorial: false,
            showPlayerForm: false,
            showEndGameForm: false,
            saveToFirebase: false,
        },
        levels: [
            {
                sortables: [1, 2, 3],
            },
            {
                sortables: [1, 2, 3],
                message: "Ahora vas a jugar con elementos indistinguibles",
                indistinguishable: true
            },
            {
                sortables: [1, 2, 3],
            },
        ]
    },

    // Suite 2
    {
        generalSettings: {
            ...MUSEUM_SCENARIO_SETTINGS,
            gameName: "Museum - Facultad 01-08-2024 / 3,4,6,8 elementos, no random, indistinguishable final",
            startWithTutorial: true,
            showPlayerForm: true,
            showEndGameForm: true,
            saveToFirebase: true,
        },
        levels: [
            {
                sortables: [3, 2, 1],
            },
            {
                sortables: [3, 2, 1, 4],
                message: "Ahora vas a jugar con 4 elementos",
            },
            {
                sortables: [3, 4, 2, 1],
            },
            {
                sortables: [4, 1, 6, 3, 2, 5],
                message: "Ahora vas a jugar con 6 elementos",
            },
            {
                sortables: [5, 6, 4, 2, 1, 3],
            },
            {
                sortables: [7, 6, 2, 8, 3, 4, 1, 5],
                message: "Ahora vas a jugar con 8 elementos",
            },
            {
                sortables: [4, 1, 6, 3, 2, 5],
                message: "Ahora vas a jugar el último con 6 elementos que no son visualmente distinguibles",
                indistinguishable: true,
            },
        ]
    },

    // Suite 3
    {
        generalSettings: {
            ...PERFUMES_SCENARIO_SETTINGS,
            gameName: "Perfumes - Todo resuelto / 3 elementos (no form, no firebase)",
            startWithTutorial: false,
            showPlayerForm: false,
            showEndGameForm: false,
            saveToFirebase: false,
        },
        levels: [
            {
                sortables: [1, 2, 3],
            },
            {
                sortables: [1, 2, 3],
            },
            {
                sortables: [1, 2, 3],
            },
        ]
    },

    // Suite 4
    {
        generalSettings: {
            ...PERFUMES_SCENARIO_SETTINGS,
            gameName: "Perfumes - Facultad 01-08-2024 / 3,4,6,8 elementos, no random, indistinguishable final",
            startWithTutorial: true,
            showPlayerForm: true,
            showEndGameForm: true,
            saveToFirebase: true,
        },
        levels: [
            {
                sortables: [3, 2, 1],
            },
            {
                sortables: [3, 2, 1, 4],
                message: "Ahora vas a jugar con 4 elementos",
            },
            {
                sortables: [3, 4, 2, 1],
            },
            {
                sortables: [4, 1, 6, 3, 2, 5],
                message: "Ahora vas a jugar con 6 elementos",
            },
            {
                sortables: [5, 6, 4, 2, 1, 3],
            },
            {
                sortables: [7, 6, 2, 8, 3, 4, 1, 5],
                message: "Ahora vas a jugar con 8 elementos",
            },
            {
                sortables: [4, 1, 6, 3, 2, 5],
                message: "Ahora vas a jugar el último con 6 elementos que no son visualmente distinguibles",
                indistinguishable: true,
            },
        ]
    },

    // Suite 5
    {
        generalSettings: {
            ...CARDS_SCENARIO_SETTINGS,
            gameName: "Cards - Todo resuelto / 3 elementos (no form, no firebase)",
            startWithTutorial: false,
            showPlayerForm: false,
            showEndGameForm: false,
            saveToFirebase: false,
        },
        levels: [
            {
                sortables: [1, 2, 3],
            },
            {
                sortables: [1, 2, 3],
            },
            {
                sortables: [1, 2, 3],
            },
        ]
    },

    // Suite 6
    {
        generalSettings: {
            ...CARDS_SCENARIO_SETTINGS,
            gameName: "Cards - Facultad 01-08-2024 / 3,4,6,8 elementos, no random, indistinguishable final",
            startWithTutorial: true,
            showPlayerForm: true,
            showEndGameForm: true,
            saveToFirebase: true,
        },
        levels: [
            {
                sortables: [7, 4, 3],
            },
            {
                sortables: [8, 5, 3, 9],
                message: "Ahora vas a jugar con 4 elementos",
            },
            {
                sortables: [7, 8, 4, 2],
            },
            {
                sortables: [7, 2, 10, 5, 4, 8],
                message: "Ahora vas a jugar con 6 elementos",
            },
            {
                sortables: [8, 9, 6, 3, 2, 4],
            },
            {
                sortables: [8, 7, 3, 9, 4, 5, 2, 6],
                message: "Ahora vas a jugar con 8 elementos",
            },
            {
                sortables: [7, 2, 10, 5, 4, 8],
                message: "Ahora vas a jugar el último con 6 elementos que no son visualmente distinguibles",
                indistinguishable: true,
            },
        ]
    },
];
