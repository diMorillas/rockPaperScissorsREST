document.addEventListener('DOMContentLoaded', () => {
    const crearPartidaBtn = document.getElementById('crearPartidaBtn');
    const unirsePartidaBtn = document.getElementById('unirsePartidaBtn'); // Botón para unirse a la partida
    const partidaIdSpan = document.getElementById('partidaId');
    const puntuacionSpan = document.getElementById('puntuacion');
    const resultadoP = document.getElementById('resultado');
    const controlesPartida = document.getElementById('controlesPartida');
    const jugador1Div = document.getElementById('jugador1');
    const jugador2Div = document.getElementById('jugador2');
    const turnoSelect = document.getElementById('turnoSelect'); // Selección del jugador

    let partidaId = null;
    let turno = 1;
    let jugadorInicia = null; // Variable para guardar quién comienza

    // Crear partida
    crearPartidaBtn.addEventListener('click', () => {
        const partidaIdInput = document.getElementById('partidaIdInput').value;
        jugadorInicia = turnoSelect.value; // Guardamos quién inicia (j1 o j2)
        controlesPartida.style.display = "block";

        if (!partidaIdInput) {
            alert('Por favor, introduce un ID de partida válido.');
            return;
        }

        createGame(partidaIdInput);
    });

    // Unirse a una partida
    unirsePartidaBtn.addEventListener('click', () => {
        const partidaIdInput = document.getElementById('partidaIdInput').value;
        const jugador = turnoSelect.value;
        controlesPartida.style.display = "block";

        if (!partidaIdInput) {
            alert('Por favor, introduce un ID de partida válido.');
            return;
        }

        joinGame(partidaIdInput, jugador); // Llamar a la función de unirse
    });

    // Función para crear una partida
    function createGame(partidaIdInput) {
        fetch('/api/partida', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: partidaIdInput }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al crear la partida');
            partidaId = partidaIdInput;
            partidaIdSpan.textContent = partidaId;
            puntuacionSpan.textContent = 'Jugador 1: 0 - Jugador 2: 0';
            controlesPartida.style.display = 'block';
            jugador1Div.style.display = 'block';  // Mostrar jugador 1 cuando empieza
            jugador2Div.style.display = 'none';  // Ocultar jugador 2 al principio
        })
        .catch(error => {
            console.error(error);
            alert('No se pudo crear la partida.');
        });
    }

    // Función para unirse a una partida
    function joinGame(partidaIdInput, jugador) {
        fetch('/api/unirse', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: partidaIdInput, jugador }),
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al unirse a la partida');
            return response.json();
        })
        .then(data => {
            partidaId = data.id;
            partidaIdSpan.textContent = partidaId;
            puntuacionSpan.textContent = `Jugador 1: ${data.jugadorUnoPuntuacion} - Jugador 2: ${data.jugadorDosPuntuacion}`;
            if (data.jugadorUno && data.jugadorDos) {
                jugador1Div.style.display = 'block';
                jugador2Div.style.display = 'block';  // Mostrar ambos jugadores al unirse
            } else {
                // Si solo un jugador se ha unido, mostrar solo el jugador correspondiente
                if (data.jugadorUno === jugador) {
                    jugador1Div.style.display = 'block';
                    jugador2Div.style.display = 'none';
                } else {
                    jugador1Div.style.display = 'none';
                    jugador2Div.style.display = 'block';
                }
            }
        })
        .catch(error => {
            console.error(error);
            alert('No se pudo unir a la partida.');
        });
    }

    // Función para actualizar el turno de la partida
    function updateTurno() {
        if (turno === 1) {
            jugador1Div.style.display = 'block';
            jugador2Div.style.display = 'none';
            console.log('Turno de jugador 1');
        } else if (turno === 2) {
            jugador1Div.style.display = 'none';
            jugador2Div.style.display = 'block';
            console.log('Turno de jugador 2');
        }
    }
    

    // Función para obtener el estado de la partida
    function getGameStatus() {
        fetch(`/api/partida/${partidaId}`)
        .then(response => response.json())
        .then(data => {
            puntuacionSpan.textContent = `Jugador 1: ${data.jugadorUnoPuntuacion} - Jugador 2: ${data.jugadorDosPuntuacion}`;

            // Verificar si la partida ha terminado (por ejemplo, si algún jugador ha ganado)
            if (data.jugadorUnoPuntuacion >= 3 || data.jugadorDosPuntuacion >= 3) {
                endGame();
            } else {
                turno = turno % 2 + 1; // Cambiar turno
                updateTurno();
            }
        })
        .catch(error => {
            console.error(error);
            alert('Error al obtener el estado de la partida.');
        });
    }

    // Función para realizar la tirada
    function makeMove(jugador, tirada) {
        console.log(`Enviando datos: { jugador: ${jugador}, tirada: ${tirada} } a la partida ${partidaId}`);
        
        fetch(`/api/partida/${partidaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jugador: parseInt(jugador), tirada }),
        })
        .then(response => {
            console.log(`Respuesta del servidor: ${response.status} - ${response.statusText}`);
            
            // Si la respuesta es OK, no devolvemos JSON, solo mostramos un mensaje en la consola
            if (!response.ok) {
                console.error('Error al realizar la tirada');
                return;
            }
            
            // Mostramos un mensaje en consola con el estado de la partida
            console.log('Tirada realizada correctamente');
            
            // Llamar a getGameStatus() para actualizar la información de la partida
            getGameStatus();
        })
        .catch(error => {
            console.error('Error al realizar la tirada:', error);
            alert('Error al realizar la tirada.');
        });
    }
            
    // Función para verificar si el jugador puede hacer el movimiento
    function verificarTurno(jugador) {
        // Si es el turno del jugador 1 y se seleccionó "j1", o el turno del jugador 2 y se seleccionó "j2"
        if ((turno%2!=0 && jugadorInicia === 'j1') || (turno %2== 0 && jugadorInicia === 'j2')) {
            return true;
        }
        return false;
    }

    // Gestionar los botones de las tiradas
    document.querySelectorAll('.tiradaBtn').forEach(button => {
        button.addEventListener('click', () => {
            if (!partidaId) {
                alert('Primero crea una partida.');
                return;
            }
    
            const jugador = button.dataset.jugador;
            const tirada = button.dataset.tirada;

            if (!verificarTurno(jugador)) {
                alert("No es el turno del jugador");
                return;
            }

            console.log(`Jugador ${jugador} ha tirado: ${tirada}`); // Muestra la tirada de cada jugador
            makeMove(jugador, tirada); // Realizar la tirada
        });
    });
});
