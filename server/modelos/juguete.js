const mongoose = require('mongoose');

const jugueteSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    imagen: String,
    descripcion: String
});

// Crear modelos para cada colección
const Novedades = mongoose.model('Novedades', jugueteSchema, 'novedades');
const Puzles = mongoose.model('Puzles', jugueteSchema, 'puzles');
const Creatividad = mongoose.model('Creatividad', jugueteSchema, 'creatividad');
const JuegosMesa = mongoose.model('JuegosMesa', jugueteSchema, 'juegos-mesa');
const Madera = mongoose.model('Madera', jugueteSchema, 'madera');

module.exports = {
    Novedades,
    Puzles,
    Creatividad,
    JuegosMesa,
    Madera
};