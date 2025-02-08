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
app.use(express.static(path.join(__dirname, 'public')));//Para decirle que los archivos estáticos están aquí

// Array para almacenar datos de partida hay uno por defecto para hacer pruebas de desarrollo
var partidas = [{ id: "1", jugadorUnoPuntuacion: 1, jugadorDosPuntuacion: 1, tiradaJugadorUno: 'piedra', tiradaJugadorDos: 'papel', turnoPartida: 1 }];

/**
 * @params no tiene, el get nos devuelve el index.html con los datos de la partida
 *
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Ver el todas las partidas
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
    let partidaDuplicada = partidas.find(p => p.id === req.body.id);

    if (partidaDuplicada) {
        return res.status(400).send("La partida ja existeix"); // Usa `return` para evitar que continúe la ejecución
    }

    let partida = {
        id: req.body.id,
        jugadorUnoPuntuacion: 0,
        jugadorDosPuntuacion: 0,
        tiradaJugadorUno: '',
        tiradaJugadorDos: '',
        turnoPartida: 0,
        jugadorUno: req.body.jugadorUno,
        jugadorDos: ''
    };

    partidas.push(partida);  // Agrega la nueva partida al array "partidas"
    res.status(201).send(path.join(__dirname, 'partida.html'));  // Retorna el objeto creado
});


// Eliminar una partida por ID
app.delete('/api/partida/:id', (req, res) => {
    let partida = partidas.find(p => p.id === req.params.id);
    if (!partida) {
        console.log('Partida no trobada');
        return res.status(404).send('Partida no trobada');
    }

    let index = partidas.indexOf(partida);
    partidas.splice(index, 1);
    console.log('Partida eliminada:', partida);
    res.send('Partida esborrada');
});


// Modificar una tirada y estado de la partida
/**
 * Toma como @param id el id de la partida. Es un re.param por lo que hay que pasarlo en la ruta de la aplicación
 */
app.put('/api/partida/:id', (req, res) => {
    const partida = partidas.find(p => p.id === req.params.id);
    if (!partida) {
        return res.status(404).json({ mensaje: 'Partida no trobada' });
    }

    if (partida.jugadorUnoPuntuacion >= 3 || partida.jugadorDosPuntuacion >= 3) {
        return res.status(400).json({ mensaje: 'La partida ja ha acabat' });
    }

    const { jugador, tirada } = req.body;

    // Validar que sea el turno del jugador correcto
    if (jugador !== partida.turno) {
        return res.status(400).json({ mensaje: 'No es el torn del jugador' });
    }

    // Registrar la tirada según el jugador
    if (jugador === 1) {
        partida.tiradaJugadorUno = tirada;
        partida.turno = 2; // Cambiar turno al jugador 2
    } else if (jugador === 2) {
        partida.tiradaJugadorDos = tirada;
        partida.turno = 1; // Cambiar turno al jugador 1
    } else {
        return res.status(400).json({ mensaje: 'Jugador no válido' });
    }

    // Resolver el turno solo si ambos jugadores han realizado su tirada
    if (partida.tiradaJugadorUno && partida.tiradaJugadorDos) {
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

        // Reiniciar las tiradas
        partida.tiradaJugadorUno = null;
        partida.tiradaJugadorDos = null;
    }

    res.json({
        mensaje: 'Tirada registrada correctamente',
        partida,
    });
});



//Ruta para que el J2 se pueda unir

app.put('/api/partida/:id/unirse', (req, res) => {
    const partidaId = req.params.id;
    const jugadorDos = req.body.jugadorDos;

    const partida = partidas.find(p => p.id === partidaId);

    if (!partida) {
        return res.status(404).json({ error: 'Partida no encontrada' });
    }

    if (partida.jugadorDos) {
        return res.status(400).json({ error: 'La partida ya tiene un Jugador 2' });
    }

    // Asignar Jugador 2
    partida.jugadorDos = jugadorDos;
    partida.turno = 1;

    res.json(partida); // Devolver el estado actualizado de la partida
});



// Inicio del servidor
app.listen(3000, () => console.log('Servidor iniciat a http://localhost:3000'));