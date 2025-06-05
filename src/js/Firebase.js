import {initializeApp} from "firebase/app";
import {getDatabase, ref, set} from "firebase/database";

export class Firebase {
    constructor(firebaseConfig) {
        this.firebaseConfig = firebaseConfig;
        this._firebaseApp = null;
        this._firebaseDb = null;
    }

    init() {
        this._firebaseApp = initializeApp(this.firebaseConfig);
        this._firebaseDb = getDatabase(this._firebaseApp);
    }

    saveToDb(docRefPath, data) {
        let docRef = ref(this._firebaseDb, docRefPath);
        set(docRef, data)
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    }
}