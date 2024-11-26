document.addEventListener('DOMContentLoaded', () => {
    const crearPartidaBtn = document.getElementById('crearPartidaBtn');
    const partidaIdSpan = document.getElementById('partidaId');
    const puntuacionSpan = document.getElementById('puntuacion');
    const resultadoP = document.getElementById('resultado');
    const controlesPartida = document.getElementById('controlesPartida');
    const jugador1Div = document.getElementById('jugador1');
    const jugador2Div = document.getElementById('jugador2');

    let partidaId = null;
    let turno = 1;

    // Crear partida
    crearPartidaBtn.addEventListener('click', () => {
        const partidaIdInput = document.getElementById('partidaIdInput').value;
        controlesPartida.style.display = "block";

        if (!partidaIdInput) {
            alert('Por favor, introduce un ID de partida válido.');
            return;
        }

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
    });

    // Actualizar visibilidad de los controles según el turno
    function actualizarTurno(turno) {
        if (turno === 1) {
            jugador1Div.style.display = 'block';
            jugador2Div.style.display = 'none';
        } else if (turno === 2) {
            jugador1Div.style.display = 'none';
            jugador2Div.style.display = 'block';
        }
    }

    // Finalizar la partida
    function finalizarPartida() {
        jugador1Div.style.display = 'none';
        jugador2Div.style.display = 'none';
        // Puedes agregar un mensaje final, por ejemplo
        resultadoP.textContent = '¡La partida ha terminado!';
    }

    // Realizar tiradas
    document.querySelectorAll('.tiradaBtn').forEach(button => {
        button.addEventListener('click', () => {
            if (!partidaId) {
                alert('Primero crea una partida.');
                return;
            }

            const jugador = button.dataset.jugador;
            const tirada = button.dataset.tirada;

            fetch(`/api/partida/${partidaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jugador: parseInt(jugador), tirada }),
            })
            .then(response => {
                if (!response.ok) throw new Error('Error al realizar la tirada');
                return response.text(); // Modificar según la respuesta del servidor
            })
            .then(data => {
                resultadoP.textContent = data; // Mostrar mensaje del servidor
                // Actualizar puntuación
                return fetch(`/api/partida/${partidaId}`);
            })
            .then(response => response.json())
            .then(data => {
                puntuacionSpan.textContent = `Jugador 1: ${data.jugadorUnoPuntuacion} - Jugador 2: ${data.jugadorDosPuntuacion}`;
                if (data.jugadorUnoPuntuacion >=3 || data.jugadorDosPuntuacion >=3) {
                    finalizarPartida();
                } else {
                    // Cambiar turno
                    turno = turno % 2 + 1;
                    actualizarTurno(turno);
                }
            })
            .catch(error => {
                console.error(error);
                alert('Error al realizar la tirada.');
            });
        });
    });
});
