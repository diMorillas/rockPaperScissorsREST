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

    function creaPartida(partidaIdInput){
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

    function finalizarPartida() {
        fetch(`/api/partida/${partidaId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al finalizar la partida');
            jugador1Div.style.display = 'none';
            jugador2Div.style.display = 'none';
            resultadoP.textContent = '¡La partida ha terminado!';
            console.log('Partida finalizada.');
        })
        .catch(error => {
            console.log(error);
            alert("Error al eliminar la partida: " + error);
        });
    }
    



    // Crear partida
    crearPartidaBtn.addEventListener('click', () => {
        const partidaIdInput = document.getElementById('partidaIdInput').value;
        controlesPartida.style.display = "block";

        if (!partidaIdInput) {
            alert('Por favor, introduce un ID de partida válido.');
            return;
        }
        creaPartida(partidaIdInput);
    });

    // Actualizar visibilidad de los controles según el turno
    function actualizarTurno() {
        if (turno === 1) {
            jugador1Div.style.display = 'block';
            jugador2Div.style.display = 'none';
            console.log('Turno de jugador 1:');
            controlesPartida.display = 'block';
            turno = 2; 
        } else if (turno === 2) {
            jugador1Div.style.display = 'none';
            jugador2Div.style.display = 'block';
            console.log('Turno de jugador 2:');
            controlesPartida.display = 'block';
            turno = 1;  
        }
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

            console.log(`Jugador ${jugador} ha tirado: ${tirada}`);

            fetch(`/api/partida/${partidaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jugador: parseInt(jugador), tirada }), 
            })
            .then(response => {
                if (!response.ok) throw new Error('Error al realizar la tirada');
                return response.text();
            })
            .then(data => {
                resultadoP.textContent = data;
                return fetch(`/api/partida/${partidaId}`);
            })
            .then(response => response.json())
            .then(data => {
                puntuacionSpan.textContent = `Jugador 1: ${data.jugadorUnoPuntuacion} - Jugador 2: ${data.jugadorDosPuntuacion}`;

                // Verificar si la partida ha terminado
                if (data.jugadorUnoPuntuacion >= 3 || data.jugadorDosPuntuacion >= 3) {
                    finalizarPartida();
                } else {
                    // Cambiar turno
                    turno = turno === 1 ? 2 : 1;
                    actualizarTurno();
                }
            })
            .catch(error => {
                console.error(error);
                alert('Error al realizar la tirada.');
            });
        });
    });

    // Ejecutar setInterval para actualizar el turno cada 2 segundos
    setInterval(() => {
        actualizarTurno();
    }, 2000);
});
