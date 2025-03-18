const mongoose = require('mongoose');

const jugueteSchema = new mongoose.Schema({
    nombre: String,
    precio: Number,
    imagen: String,
    descripcion: String,
    categoria: String,
    edad_recomendada: String,
    dimensiones: String,
    marca: String,
    stock: Number
});

// Crear modelos para cada colección
const Novedades = mongoose.model('Novedades', jugueteSchema, 'novedades');
const Puzzles = mongoose.model('Puzzles', jugueteSchema, 'puzzles');
const JuegosCreatividad = mongoose.model('JuegosCreatividad', jugueteSchema, 'juegos-creatividad');
const JuegosMesa = mongoose.model('JuegosMesa', jugueteSchema, 'juegos-mesa');
const JuegosMadera = mongoose.model('JuegosMadera', jugueteSchema, 'juegos-madera');

module.exports = {
    Novedades,
    Puzzles,
    JuegosCreatividad,
    JuegosMesa,
    JuegosMadera
};