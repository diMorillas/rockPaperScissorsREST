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

// Array para almacenar datos de partida
let partidas = [{ id: "12342454", jugadorUnoPuntuacion: 1, jugadorDosPuntuacion: 1, tiradaJugadorUno: 'piedra', tiradaJugadorDos: 'papel', estadoPartida: true }];

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
app.post('/api/partida', (req, res) => {
    let partida = {
        id: req.body.id,
        jugadorUnoPuntuacion: 0,
        jugadorDosPuntuacion: 0,
        tiradaJugadorUno: '',
        tiradaJugadorDos: '',
        estadoPartida: true
    };
    partidas.push(partida); // Agrega la nueva partida al array "partidas"
    res.send("todo ok");
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
app.put('/api/partida/:id', (req, res) => {
    let partida = partidas.find(p => p.id === req.params.id);
    if (!partida) return res.status(404).send('Partida no trobada');

    // Actualizar los datos de la partida
    partida.jugadorUnoPuntuacion = req.body.jugadorUnoPuntuacion;
    partida.jugadorDosPuntuacion = req.body.jugadorDosPuntuacion;
    partida.tiradaJugadorUno = req.body.tiradaJugadorUno;
    partida.tiradaJugadorDos = req.body.tiradaJugadorDos;
    partida.estadoPartida = req.body.estadoPartida;

    res.send('Partida modificada');
});

// Inicio del servidor
app.listen(3000, () => console.log('Servidor iniciat a http://localhost:3000'));
