require('dotenv').config();
const mongoose = require('mongoose');
const { Novedades, Puzzles, JuegosCreatividad, JuegosMesa, JuegosMadera } = require('./modelos/juguete');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbUrl = process.env.MONGODB_URI;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Conexión a la base de datos exitosa'))
.catch(err => console.error('Error al conectar a la base de datos:', err));

// Rutas para Novedades
app.get('/novedades', async (req, res) => {
    try {
        const novedades = await Novedades.find();
        res.json(novedades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/novedades/:id', async (req, res) => {
    try {
        const novedad = await Novedades.findById(req.params.id);
        if (!novedad) {
            return res.status(404).json({ message: 'Novedad no encontrada' });
        }
        res.json(novedad);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rutas para Puzzles
app.get('/puzzles', async (req, res) => {
    try {
        const puzzles = await Puzzles.find();
        res.json(puzzles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/puzzles/:id', async (req, res) => {
    try {
        const puzzle = await Puzzles.findById(req.params.id);
        if (!puzzle) {
            return res.status(404).json({ message: 'Puzzle no encontrado' });
        }
        res.json(puzzle);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rutas para Juegos de Creatividad
app.get('/juegos-creatividad', async (req, res) => {
    try {
        const juegosCreatividad = await JuegosCreatividad.find();
        res.json(juegosCreatividad);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/juegos-creatividad/:id', async (req, res) => {
    try {
        const juegoCreatividad = await JuegosCreatividad.findById(req.params.id);
        if (!juegoCreatividad) {
            return res.status(404).json({ message: 'Juego de creatividad no encontrado' });
        }
        res.json(juegoCreatividad);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rutas para Juegos de Mesa
app.get('/juegos-mesa', async (req, res) => {
    try {
        const juegosMesa = await JuegosMesa.find();
        res.json(juegosMesa);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/juegos-mesa/:id', async (req, res) => {
    try {
        const juegoMesa = await JuegosMesa.findById(req.params.id);
        if (!juegoMesa) {
            return res.status(404).json({ message: 'Juego de mesa no encontrado' });
        }
        res.json(juegoMesa);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Rutas para Juegos de Madera
app.get('/juegos-madera', async (req, res) => {
    try {
        const juegosMadera = await JuegosMadera.find();
        res.json(juegosMadera);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/juegos-madera/:id', async (req, res) => {
    try {
        const juegoMadera = await JuegosMadera.findById(req.params.id);
        if (!juegoMadera) {
            return res.status(404).json({ message: 'Juego de madera no encontrado' });
        }
        res.json(juegoMadera);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
