const express = require('express');
const bodyParser = require("body-parser")
const path = require('path');

// require
const prueba = require('./api/prueba')
const personas = require('./api/personas')
const libros = require('./api/libros')
const reservas = require('./api/reservas')
// -----

const app = express()
const port = 3080

app.use(express.static(path.join(__dirname, './tabla')));
app.use(bodyParser.json());

// use
app.use('/api/prueba',prueba)
app.use('/api/personas',personas)
app.use('/api/libros',libros)
app.use('/api/reservas',reservas)
//-----

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, './tabla/index.html'));
});

app.listen(port, () => {
    console.log(`Server escuchando en el port::${port}`);
});