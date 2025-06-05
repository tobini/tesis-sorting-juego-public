import '../../scss/game.scss';

import {useState} from 'react';

export function EndGameForm({onSubmit}) {
    const [extraData, setExtraData] = useState("");
    const [email, setEmail] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const handleFormSubmit = (event) => {
        event.preventDefault();
        onSubmit(extraData, email);
        setHasSubmitted(true);
    }

    return <div className="formContainer">
        {hasSubmitted ? <h1>¡Gracias!</h1> :
            <form id="endGameForm" onSubmit={handleFormSubmit}>
                <label htmlFor="extradata">
                    Ahora te pedimos que nos cuentes cómo resolviste el problema de ordenar, con qué problemas te
                    encontraste, si usaste una estrategia, si en el nivel indistinguible mantuvo la dificultad o no,
                    etc.
                </label>
                <textarea id="extradata" onChange={(e) => setExtraData(e.target.value)} required/>
                <hr style={{margin: "0 0 20px 0"}}/>
                <label htmlFor="email">Si querés recibir información del resultado del estudio dejanos tu <b>correo
                    electrónico</b>:</label>
                <input className="input-text" type="email" id="email" onChange={(e) => setEmail(e.target.value)}/>
                <button type="submit" disabled={!extraData}>Enviar</button>
            </form>
        }
    </div>;
}
