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

// Verificar que la URL de MongoDB está configurada
if (!dbUrl) {
    console.error('Error: MONGODB_URI no está configurada en las variables de entorno');
    process.exit(1);
}

// Conexión a MongoDB con manejo de errores mejorado
const connectDB = async () => {
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conexión a MongoDB establecida correctamente');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

connectDB();

// Middleware para verificar el estado de la conexión
app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Base de datos no disponible' });
    }
    next();
});

// Rutas para Novedades
app.get('/api/novedades', async (req, res) => {
    try {
        const novedades = await Novedades.find();
        res.json(novedades);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/novedades/:id', async (req, res) => {
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
app.get('/api/puzzles', async (req, res) => {
    try {
        const puzzles = await Puzzles.find();
        res.json(puzzles);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/puzzles/:id', async (req, res) => {
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
app.get('/api/juegos-creatividad', async (req, res) => {
    try {
        const juegosCreatividad = await JuegosCreatividad.find();
        res.json(juegosCreatividad);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/juegos-creatividad/:id', async (req, res) => {
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
app.get('/api/juegos-mesa', async (req, res) => {
    try {
        const juegosMesa = await JuegosMesa.find();
        res.json(juegosMesa);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/juegos-mesa/:id', async (req, res) => {
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
app.get('/api/juegos-madera', async (req, res) => {
    try {
        const juegosMadera = await JuegosMadera.find();
        res.json(juegosMadera);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/juegos-madera/:id', async (req, res) => {
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

// Ruta de verificación de estado
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

// Exportar la app para Vercel
module.exports = app;

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}
