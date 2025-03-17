const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGODB_URI } = require('./config');
const juguetesRoutes = require('./routes/juguetes.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ignorar favicon
app.get('/favicon.ico', (req, res) => res.status(204));

// Conexión a MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error de conexión:', err));

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'API de Edukids funcionando',
        endpoints: {
            base: '/api/juguetes',
            categorias: {
                novedades: '/api/juguetes/novedades',
                puzles: '/api/juguetes/puzles',
                creatividad: '/api/juguetes/creatividad',
                juegosMesa: '/api/juguetes/juegos-mesa',
                madera: '/api/juguetes/madera'
            }
        }
    });
});

// Ruta /api
app.get('/api', (req, res) => {
    res.json({
        message: 'API de Edukids - Endpoint API',
        availableRoutes: {
            juguetes: '/api/juguetes'
        }
    });
});

// Rutas de juguetes
app.use('/api/juguetes', juguetesRoutes);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        availableEndpoints: {
            root: '/',
            api: '/api',
            juguetes: '/api/juguetes',
            categorias: [
                '/api/juguetes/novedades',
                '/api/juguetes/puzles',
                '/api/juguetes/creatividad',
                '/api/juguetes/juegos-mesa',
                '/api/juguetes/madera'
            ]
        }
    });
});

module.exports = app;