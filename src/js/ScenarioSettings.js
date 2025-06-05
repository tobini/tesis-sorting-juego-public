export const MUSEUM_SCENARIO_SETTINGS = {
    scenarioName: "museum",
    randomize: true,
    labels: {
        smaller: "liviano",
        bigger: "pesado",
        sortable: "cuadro"
    }
};

export const PERFUMES_SCENARIO_SETTINGS = {
    scenarioName: "perfumes",
    randomize: true,
    labels: {
        smaller: "suave",
        bigger: "intenso",
        sortable: "perfume"
    }
};

// TODO: If randomize is false, then sortables must be set in settings between 1 and 8
export const CARDS_SCENARIO_SETTINGS = {
    scenarioName: "cards",
    randomize: false,
    labels: {
        smaller: "chico",
        bigger: "grande",
        sortable: "naipe"
    }
};