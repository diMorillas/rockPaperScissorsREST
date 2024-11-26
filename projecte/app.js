/**
 * Aplicació en ExpressJS que crea una API REST completa
 * @author Pau Morillas
 * @author Dídac Morillas
 * @version 1.0
 */

/** Importación de modulos necesarios */

const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Analiza las peticiones HTTP con JSON en el body
app.use(express.static(path.join(__dirname, 'public'))); // Para decirle que los archivos estáticos están aquí

// Array para almacenar datos de partida hay uno por defecto para hacer pruebas de desarrollo
var partidas = [{ id: "1", jugadorUnoPuntuacion: 1, jugadorDosPuntuacion: 1, tiradaJugadorUno: 'piedra', tiradaJugadorDos: 'papel', turnoPartida: 1 }];

/**
 * @params no tiene, el get nos devuelve el index.html con los datos de la partida
 *
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ver el estado de todas las partidas
app.get('/api/partida/', (req, res) => res.send(partidas));

// Obtener una partida en específico
app.get('/api/partida/:id', (req, res) => {
    let partida = partidas.find(p => p.id === req.params.id);
    if (!partida) return res.status(404).send('Partida no trobada');
    res.send(partida);
});

// Crear una nueva partida
/**
 * Como @param id 
 * Se añade desde el cuerpo del mensaje. El resto de valores se inician en 0.
 */
app.post('/api/partida', (req, res) => {
    let partida = {
        id: req.body.id,  // Generar ID aleatorio si no se pasa
        jugadorUnoPuntuacion: 0,
        jugadorDosPuntuacion: 0,
        tiradaJugadorUno: '',
        tiradaJugadorDos: '',
        turnoPartida: 1,
        jugadorUno: null, // Jugador 1
        jugadorDos: null, // Jugador 2
        estado: 'esperando' // Estado inicial
    };

    partidas.push(partida);  // Agrega la nueva partida al array "partidas"
    res.status(201).send(partida);  // Retorna el objeto creado
});

// Unirse a una partida existente
app.post('/api/unirse', (req, res) => {
    const { id, jugador } = req.body;

    let partida = partidas.find(p => p.id === id);
    if (!partida) return res.status(404).send('Partida no trobada');

    if (partida.estado === 'enJuego') {
        return res.status(400).send('La partida ya está en curso');
    }

    if (partida.jugadorUno && partida.jugadorDos) {
        return res.status(400).send('La partida ya está llena');
    }

    if (!partida.jugadorUno) {
        partida.jugadorUno = jugador;
    } else {
        partida.jugadorDos = jugador;
    }

    // Cambiar estado de la partida cuando ambos jugadores se han unido
    if (partida.jugadorUno && partida.jugadorDos) {
        partida.estado = 'enJuego'; // Cambia el estado a "enJuego"
    }

    res.send(partida); // Retorna los datos de la partida
});

// Eliminar una partida por ID
app.delete('/api/partida/:id', (req, res) => {
    let partida = partidas.find(p => p.id === req.params.id);
    if (!partida) return res.status(404).send('Partida no trobada');
    
    let index = partidas.indexOf(partida);
    partidas.splice(index, 1);
    res.send('Partida esborrada');
});

// Modificar una partida existente
/**
 * Toma como @param id el id de la partida. Es un re.param por lo que hay que pasarlo en la ruta de la aplicación
 */
app.put('/api/partida/:id', (req, res) => {
    const partida = partidas.find(p => p.id === req.params.id);
    if (!partida) return res.status(404).send('Partida no trobada');

    if (partida.jugadorUnoPuntuacion >= 3 || partida.jugadorDosPuntuacion >= 3) {
        return res.send("La partida ha acabado");
    }

    const { jugador, tirada } = req.body; // 'jugador' indica quién está jugando (1 o 2)
    
    if (jugador !== partida.turnoPartida) {
        return res.status(400).send('No es tu turno');
    }

    if (jugador === 1) {
        partida.tiradaJugadorUno = tirada;
    } else if (jugador === 2) {
        partida.tiradaJugadorDos = tirada;
    } else {
        return res.status(400).send('Jugador no válido');
    }

    if (partida.tiradaJugadorUno && partida.tiradaJugadorDos) {
        // Resolver el turno
        const { tiradaJugadorUno: movJ1, tiradaJugadorDos: movJ2 } = partida;
        if (movJ1 === movJ2) {
            console.log("Empate");
        } else if (
            (movJ1 === "piedra" && movJ2 === "tijeras") ||
            (movJ1 === "tijeras" && movJ2 === "papel") ||
            (movJ1 === "papel" && movJ2 === "piedra")
        ) {
            partida.jugadorUnoPuntuacion++;
            console.log("¡Jugador 1 gana este turno!");
        } else {
            partida.jugadorDosPuntuacion++;
            console.log("¡Jugador 2 gana este turno!");
        }

        // Limpiar tiradas y avanzar turno
        partida.tiradaJugadorUno = null;
        partida.tiradaJugadorDos = null;
        partida.turnoPartida = partida.turnoPartida === 1 ? 2 : 1; // Cambiar turno entre los jugadores
    }

    res.send(`La partida ha sido modificada: puntuación es J1:${partida.jugadorUnoPuntuacion} J2:${partida.jugadorDosPuntuacion}`);
});

// Inicio del servidor
app.listen(3000, () => console.log('Servidor iniciat a http://localhost:3000'));
