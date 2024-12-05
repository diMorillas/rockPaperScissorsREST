document.addEventListener('DOMContentLoaded', () => {
    let crearPartidaBtn = document.getElementById('crearPartidaBtn');
    let partidaIdSpan = document.getElementById('partidaId');
    let puntuacionSpan = document.getElementById('puntuacion');
    let resultadoP = document.getElementById('resultado');
    let controlesPartida = document.getElementById('controlesPartida');
    let jugador1Div = document.getElementById('jugador1');
    let jugador2Div = document.getElementById('jugador2');
    let jugadores = document.getElementById('jugadores');
  


    let partidaId = null;
    let turno = 0; //0 Para evitar que el setInterval empiece dispar
    let intervalID;
    let finPartida = false;
    let jugadorSeleccionado = "";
    

    function creaPartida(partidaIdInput,jugador){
        fetch('/api/partida', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: partidaIdInput,jugadorUno:jugador}),
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


    function unirseComoJugadorDos(partidaId, jugadorDosNombre) {
        fetch(`/api/partida/${partidaId}/unirse`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jugadorDos: jugadorDosNombre }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Error al unirse a la partida');
                });
            }
            return response.json();
        })
        .then(data => {
            partidaId = data.id;
            console.log('Jugador 2 unido con éxito:', data);
            partidaIdSpan.textContent = partidaId;
    
            // Actualizar el turno
            fetch(`/api/partida/${partidaId}`)
                .then(response => response.json())
                .then(data => {
                    turno = data.turno;
                    actualizarTurno();
                })
                .catch(error => {
                    console.error('Error al obtener el turno:', error);
                });
    
            // Mostrar controles de la partida
            document.getElementById('controlesPartida').style.display = 'block';
    
            // Iniciar el intervalo solo después de que la partida se haya unido correctamente
            if (partidaId) {
                clearInterval(intervalID); // Limpiar cualquier intervalo previo
                intervalID = setInterval(() => {
                    if (!finPartida) {
                        console.log(partidaId);
                        fetch(`/api/partida/${partidaId}`)
                            .then(response => response.json())
                            .then(data => {
                                // Actualizar turno con la información del servidor
                                turno = data.turno;
                                actualizarTurno();
                            })
                            .catch(error => {
                                console.error('Error al obtener el turno:', error);
                            });
                    } else {
                        clearInterval(intervalID);
                    }
                }, 4000);
            }
        })
        .catch(error => {
            console.error(error);
            alert(`No se pudo unir a la partida: ${error.message}`);
        });
    }
            
                
    // Crear partida
    crearPartidaBtn.addEventListener('click', () => {
        let partidaIdInput = document.getElementById('partidaIdInput').value;

        let jugadorSeleccionado = jugadores.options[jugadores.selectedIndex].value;
        console.log(jugadorSeleccionado);

        controlesPartida.style.display = "block";

        if (!partidaIdInput) {
            alert('Por favor, introduce un ID de partida válido.');
            return;
        }
        creaPartida(partidaIdInput,jugadorSeleccionado);
    });


    //Unirse como jugador 2 a la partida. Como J2 no puedes crear solo unirte

    document.getElementById('unirsePartidaBtn').addEventListener('click', () => {
        let partidaIdInput = document.getElementById('partidaIdInput').value;
        let jugadorSeleccionado = jugadores.options[jugadores.selectedIndex].value;
        console.log(jugadorSeleccionado);
    
        if (!partidaIdInput) {
            alert('Por favor, ingresa un ID de partida válido.');
            return;
        }
    
        if (jugadorSeleccionado != 'J2') {
            alert('Actualmente solo el Jugador 2 puede unirse a una partida existente.');

            }else{
                unirseComoJugadorDos(partidaIdInput, jugadorSeleccionado);
                
            }
    
    });
        

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
            finPartida = true;
        })
        .catch(error => {
            console.log(error);
            alert("Error al eliminar la partida: " + error);
        });
    }

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

        const jugador = parseInt(button.dataset.jugador, 10);
        const tirada = button.dataset.tirada;

        console.log(`Jugador ${jugador} ha tirado: ${tirada}`);

        fetch(`/api/partida/${partidaId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ jugador, tirada }),
        })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.mensaje || 'Error al realizar la tirada');
                }
                return response.json();
            })
            .then(data => {
                const { partida } = data;

                // Actualizar puntuación y turno en la interfaz
                puntuacionSpan.textContent = `Jugador 1: ${partida.jugadorUnoPuntuacion} - Jugador 2: ${partida.jugadorDosPuntuacion}`;
                turno = partida.turno;
                actualizarTurno(); // Actualiza visualmente el turno

                // Verificar si la partida ha terminado
                if (partida.jugadorUnoPuntuacion >= 3 || partida.jugadorDosPuntuacion >= 3) {
                    alert('La partida ha terminado');
                    finalizarPartida(); // Maneja el fin de la partida
                }
            })
            .catch(error => {
                console.error('Error al realizar la tirada:', error);
                alert(error.message);
            });
    });
});



    
    //Consultar el turno al back para empezar a la vez
    setInterval(() => {
        if (!finPartida) {
            console.log(partidaId);
            fetch(`/api/partida/${partidaId}`)
                .then(response => response.json())
                .then(data => {
                    turno = data.turno;
                    console.log(data);
                    actualizarTurno();
                })
                .catch(error => {
                    console.error('Error al obtener el turno:', error);
                });
        } else {
            clearInterval(intervalID);
        }
    }, 4000);

});
