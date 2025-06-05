function importAll(r) {
    return r.keys().map(r);
}

export const SORTABLE_IMAGES = {
    museum: importAll(require.context(`../../assets/museum/`, false, /\.png$/)),
    perfumes: importAll(require.context(`../../assets/perfumes/`, false, /\.png$/)),
    cards: importAll(require.context(`../../assets/cards/`, false, /\.png$/)),
};