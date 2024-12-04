/**
 * Aplicació en ExpressJS que crea una API REST completa
 * @author Pau Morillas
 * @version 1.1
 */

const express = require('express');
const path = require('path');
const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Base de datos en memoria para las partidas
const partidas = [
    {
        id: "1",
        jugadorUnoPuntuacion: 1,
        jugadorDosPuntuacion: 1,
        tiradaJugadorUno: null,
        tiradaJugadorDos: null,
        turnoPartida: 1,
        jugadorUno: "unido",
        jugadorDos: "unido",
        estado: "enJuego"
    }
];

/**
 * Ruta principal: Devuelve la interfaz HTML
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Obtener todas las partidas
 */
app.get('/api/partida', (req, res) => res.json(partidas));

/**
 * Obtener una partida específica
 */
app.get('/api/partida/:id', (req, res) => {
    const partida = partidas.find(p => p.id === req.params.id);
    if (!partida) return res.status(404).send('Partida no encontrada');
    res.json(partida);
});

/**
 * Crear una nueva partida
 */
app.post('/api/partida', (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).send('El ID de la partida es obligatorio');

    // Verificar si ya existe una partida con el mismo ID
    if (partidas.some(p => p.id === id)) {
        return res.status(400).send('Ya existe una partida con este ID');
    }

    const nuevaPartida = {
        id,
        jugadorUnoPuntuacion: 0,
        jugadorDosPuntuacion: 0,
        tiradaJugadorUno: null,
        tiradaJugadorDos: null,
        turnoPartida: 1,
        jugadorUno: null,
        jugadorDos: null,
        estado: "esperando"
    };

    partidas.push(nuevaPartida);
    res.status(201).json(nuevaPartida);
});

/**
 * Unirse a una partida existente
 */
app.post('/api/unirse', (req, res) => {
    const { id, jugador } = req.body;

    const partida = partidas.find(p => p.id === id);
    if (!partida) return res.status(404).send('Partida no encontrada');

    if (partida.estado === "enJuego") return res.status(400).send('La partida ya está en curso');
    if (partida.jugadorUno && partida.jugadorDos) return res.status(400).send('La partida ya está llena');

    if (!partida.jugadorUno) {
        partida.jugadorUno = jugador;
    } else {
        partida.jugadorDos = jugador;
        partida.estado = "enJuego"; // Cambiar el estado cuando ambos jugadores se unen
    }

    res.json(partida);
});

/**
 * Eliminar una partida
 */
app.delete('/api/partida/:id', (req, res) => {
    const index = partidas.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).send('Partida no encontrada');

    partidas.splice(index, 1);
    res.send('Partida eliminada');
});

/**
 * Modificar el estado de una partida existente
 */
app.put('/api/partida/:id', (req, res) => {
    const partida = partidas.find(p => p.id === req.params.id);
    if (!partida) return res.status(404).send('Partida no encontrada');

    if (partida.jugadorUnoPuntuacion >= 3 || partida.jugadorDosPuntuacion >= 3) {
        return res.status(400).send('La partida ya terminó');
    }

    const { jugador, tirada } = req.body;
    if (jugador !== partida.turnoPartida) return res.status(400).send('No es tu turno');

    if (jugador === 1) {
        partida.tiradaJugadorUno = tirada;
    } else if (jugador === 2) {
        partida.tiradaJugadorDos = tirada;
    }

    if (partida.tiradaJugadorUno && partida.tiradaJugadorDos) {
        const resultado = determinarGanador(partida.tiradaJugadorUno, partida.tiradaJugadorDos);
        if (resultado === 1) {
            partida.jugadorUnoPuntuacion++;
        } else if (resultado === 2) {
            partida.jugadorDosPuntuacion++;
        }

        // Avanzar turno y limpiar tiradas
        partida.tiradaJugadorUno = null;
        partida.tiradaJugadorDos = null;
        partida.turnoPartida = partida.turnoPartida === 1 ? 2 : 1;
    }

    res.json(partida);
});

/**
 * Determinar el ganador de un turno
 */
function determinarGanador(tiradaUno, tiradaDos) {
    if (tiradaUno === tiradaDos) return 0; // Empate
    if (
        (tiradaUno === "piedra" && tiradaDos === "tijeras") ||
        (tiradaUno === "tijeras" && tiradaDos === "papel") ||
        (tiradaUno === "papel" && tiradaDos === "piedra")
    ) {
        return 1; // Jugador 1 gana
    }
    return 2; // Jugador 2 gana
}

// Iniciar el servidor
app.listen(3000, () => console.log('Servidor iniciado en http://localhost:3000'));
