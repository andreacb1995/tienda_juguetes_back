const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGODB_URI } = require('./config');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB actualizada
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout después de 5 segundos
            socketTimeoutMS: 45000, // Timeout de socket después de 45 segundos
        });
        
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error('Error de conexión MongoDB:', error.message);
        return false;
    }
};

// Iniciar conexión
connectDB().then(isConnected => {
    if (!isConnected) {
        console.log('⚠️ Iniciando sin conexión a base de datos');
    }
});

// Ruta principal
app.get('/', async (req, res) => {
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
        status: isConnected ? 'online' : 'database_error',
        message: 'API de Edukids',
        database: {
            status: isConnected ? 'connected' : 'disconnected',
            host: isConnected ? mongoose.connection.host : null
        },
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



module.exports = app;