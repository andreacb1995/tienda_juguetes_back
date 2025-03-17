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

// Conexión a MongoDB con mejor manejo de errores
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Conectado a MongoDB Atlas');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        // No lanzamos el error, permitimos que la app siga funcionando
    }
};

connectDB();

// Middleware para verificar estado de MongoDB
app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            error: 'Database connection not ready',
            status: 'error',
            message: 'Trying to connect to database'
        });
    }
    next();
});

// Ruta principal
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'API de Edukids funcionando',
        mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        endpoints: {
            api: '/api',
            juguetes: '/api/juguetes',
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
        status: 'success',
        message: 'API de Edukids - Endpoint API',
        mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        routes: {
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

// Rutas de juguetes
app.use('/api/juguetes', juguetesRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada',
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