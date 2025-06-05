import '../../scss/game.scss';

import {useState} from 'react';

export function PlayerDataForm({onSubmit}) {
    const [showStep2Form, setShowStep2Form] = useState(false);
    const [age, setAge] = useState(null);
    const [career, setCareer] = useState("");
    const [yearsSinceUniversityStart, setYearsSinceUniversityStart] = useState("");
    // const [email, setEmail] = useState("");
    const [sortingExperience, setSortingExperience] = useState(null);
    const [programmingExperience, setProgrammingExperience] = useState(null);
    const [yearsOfExperience, setYearsOfExperience] = useState(null);

    const handleFormSubmit = (event) => {
        event.preventDefault();

        if (canSubmitForm()) {
            let playerData = {
                age: age,
                career: career,
                yearsSinceUniversityStart: yearsSinceUniversityStart,
                sortingExperience: sortingExperience,
                programmingExperience: programmingExperience,
                yearsOfExperience: yearsOfExperience,
            };
            onSubmit(playerData)
        }
    }

    const canGoToFormStep2 = () => {
        // lu is not mandatory
        return yearsSinceUniversityStart && age && career;
    }

    const canSubmitForm = () => {
        return isAValidInput(yearsSinceUniversityStart) && isAValidInput(age) && isAValidInput(career) &&
            isAValidInput(sortingExperience) && isAValidInput(programmingExperience) &&
            isAValidInput(yearsOfExperience);
    }

    const isAValidInput = (value) => {
        return value !== "" && value !== null;
    }

    const formStep1Template = () => {
        return <div className="formContainer">
            <form id="playerForm" onSubmit={(event) => {
                event.preventDefault();
                setShowStep2Form(true)
            }}>
                <label htmlFor="age">Edad:</label>
                <select name="age"
                        onChange={(e) => e.target.value === "" ? setAge("") : setAge(parseInt(e.target.value))}
                        required>
                    <option value="">Elegir edad...</option>
                    {[...Array(101).keys()].slice(16).map((e) => <option key={`age-${e}`} value={e}>{e}</option>)}
                </select> años
                <label htmlFor="career">Carrera:</label>
                <select name="career" style={{width: 350}} onChange={(e) => setCareer(e.target.value)} required>
                    <option value="">Elegir con qué carrera te identificás más...</option>
                    <option value="Ciencias Biológicas">Ciencias Biológicas</option>
                    <option value="Ciencias de Datos">Ciencias de Datos</option>
                    <option value="Ciencias de la Atmósfera">Ciencias de la Atmósfera</option>
                    <option value="Ciencias de la Computación">Ciencias de la Computación</option>
                    <option value="Ciencias Físicas">Ciencias Físicas</option>
                    <option value="Ciencias Geológicas">Ciencias Geológicas</option>
                    <option value="Ciencias Matemáticas">Ciencias Matemáticas</option>
                    <option value="Ciencias Químicas">Ciencias Químicas</option>
                    <option value="Ciencia y Tecnología de Alimentos">Ciencia y Tecnología de Alimentos</option>
                    <option value="Oceanografía">Oceanografía</option>
                    <option value="Paleontología">Paleontología</option>
                    <option value="Otra">Otra</option>
                </select>
                <label htmlFor="yearsSinceUniversityStart">Años que pasaron desde el inicio de sus estudios universitarios<br/>(en caso de no tenerlos marcar 0):</label>
                <select name="yearsSinceUniversityStart"
                        onChange={(e) => e.target.value === "" ? setYearsSinceUniversityStart("") : setYearsSinceUniversityStart(parseInt(e.target.value))}
                        required>
                    <option value="">Elegir...</option>
                    {[...Array(71).keys()].slice(0).map((e) => <option key={`yearsSinceUniversityStart-${e}`} value={e}>{e}</option>)}
                </select>
                <button type="submit" disabled={!canGoToFormStep2()}>Siguiente</button>
            </form>
        </div>
    }

    const formStep2Template = () => {
        return <div className="formContainer">
            <form id="playerForm" onSubmit={handleFormSubmit}>
                <label htmlFor="sortingexperience">¿Habías visto alguna vez "algoritmos de ordenamiento"?</label>
                <div className="radio-group">
                    <input
                        type="radio"
                        id="yes-sortingexperience"
                        name="sortingexperience"
                        defaultValue="true"
                        onChange={() => setSortingExperience(true)}
                        required
                    />
                    <label htmlFor="yes-sortingexperience">Sí</label>
                    <input type="radio" id="no-sortingexperience" name="sortingexperience"
                           onChange={() => setSortingExperience(false)}
                           defaultValue="false" required/>
                    <label htmlFor="no-sortingexperience">No</label>
                </div>
                <label htmlFor="programmingexperience">¿Viste algo de programación en el secundario?</label>
                <div className="radio-group">
                    <input
                        type="radio"
                        id="yes-programmingexperience"
                        name="programmingexperience"
                        defaultValue="true"
                        onChange={() => setProgrammingExperience(true)}
                        required
                    />
                    <label htmlFor="yes-programmingexperience">Sí</label>
                    <input type="radio" id="no-programmingexperience" name="programmingexperience"
                           onChange={() => setProgrammingExperience(false)}
                           defaultValue="false" required/>
                    <label htmlFor="no-programmingexperience">No</label>
                </div>
                <label htmlFor="yearsOfExperience">¿Cuánto tiempo (en años) te formaste en programación fuera del
                    secundario?
                    (cursos/universidad/etc):</label>
                <select name="yearsOfExperience"
                        onChange={(e) => e.target.value === "" ? setYearsOfExperience("") : setYearsOfExperience(parseFloat(e.target.value))}
                        required>
                    <option value="">Elegir años de experiencia...</option>
                    {[...Array(41).keys()].map((e) => <option key={`yearsOfExperience-${e}`}
                                                              value={e / 2}>{e / 2}</option>)}
                </select> {yearsOfExperience ? (yearsOfExperience === 1 ? "año" : "años") : ""}
                <button type="submit" disabled={!canSubmitForm()}>Enviar</button>
            </form>
        </div>
    }

    const renderForm = () => {
        return showStep2Form ? formStep2Template() : formStep1Template();
    }

    return renderForm();
}
