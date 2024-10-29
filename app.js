/**
 * Aplicació en ExpressJS que crea una API REST completa
 * @author Pau Morillas
 * @author Dídac Morillas
 * @version 1.0
 */

/**Importación de modulos necesarios */

const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Analiza las peticiones HTTP con JSON en el body

// Array para almacenar datos de alumnos
let partida = [{id:"12342454",jugadorUnoPuntuacion:1,JugadorDosPuntuacion:1,tiradaJugadorUno:'piedra',tiradaJugadorDos:'papel',estadoPartida:true}];

/**
 * @params no tiene, el get nos devuelve el index.html con los datos de la partida
 *
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ver el estado de la partida
app.get('/consultarEstatPartida/', (req, res) => res.send(console.log(partida)));



// Obtener un alumno específico por código
app.get('/api/alumnes/:id', (req, res) => {
    let alumne = alumnes.find(a => a.codi === parseInt(req.params.codi));
    if (!alumne) return res.status(404).send('Alumne no trobat');
    res.send(alumne);
});

// Crear un nuevo alumno
app.post('/api/alumnes', (req, res) => {
    let alumne = {
        codi: parseInt(req.body.codi),
        nom: req.body.nom,
        nota: parseInt(req.body.nota)
    };
    alumnes.push(alumne);
    res.send(alumnes);
});

// Eliminar un alumno por código
app.delete('/api/alumnes/:codi', (req, res) => {
    let alumne = alumnes.find(a => a.codi === parseInt(req.params.codi));
    if (!alumne) return res.status(404).send('Alumne no trobat');
    
    let index = alumnes.indexOf(alumne);
    alumnes.splice(index, 1);
    res.send('Alumne esborrat');
});

// Modificar un alumno existente
app.put('/api/alumnes/:codi', (req, res) => {
    let alumne = alumnes.find(a => a.codi === parseInt(req.params.codi));
    if (!alumne) return res.status(404).send('Alumne no trobat');

    let nouAlumne = {
        codi: parseInt(req.body.codi),
        nom: req.body.nom,
        nota: parseInt(req.body.nota)
    };

    let index = alumnes.indexOf(alumne);
    alumnes[index] = nouAlumne;
    res.send('Alumne modificat');
});

// Inicio del servidor
app.listen(3000, () => console.log('Servidor iniciat a http://localhost:3000'));
