require('dotenv').config();
const mongoose = require('mongoose');
const { Novedades, Puzzles, JuegosCreatividad, JuegosMesa, JuegosMadera } = require('./modelos/juguete');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS más permisiva para desarrollo
const allowedOrigins = [
    'https://tienda-juguetes.vercel.app',
    'https://tienda-juguetes-git-master-andreas-projects-c298c94d.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
];

app.use(cors({
    origin: function(origin, callback) {
        // Permitir solicitudes sin origin (como las aplicaciones móviles o postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Origin no permitido:', origin);
        }
        // Permitir cualquier origen en desarrollo
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use(express.json());

const dbUrl = process.env.MONGODB_URI;

// Verificar que la URL de MongoDB está configurada
if (!dbUrl) {
    console.error('Error: MONGODB_URI no está configurada en las variables de entorno');
    process.exit(1);
}

// Configuración de conexión MongoDB
mongoose.set('strictQuery', false);
let isConnected = false;

// Función para conectar a MongoDB
const connectDB = async () => {
    if (isConnected) {
        console.log('MongoDB ya está conectado');
        return;
    }

    try {
        const db = await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        console.log('MongoDB conectado en:', db.connection.host);
    } catch (error) {
        console.error('Error conectando a MongoDB:', error.message);
        isConnected = false;
    }
};

// Conectar a MongoDB al inicio
connectDB();

// Reconexión en caso de desconexión
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB desconectado. Intentando reconectar...');
    isConnected = false;
    setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
    console.error('Error en la conexión MongoDB:', err);
    isConnected = false;
});

// Middleware para logging mejorado
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const logInfo = {
        timestamp,
        method: req.method,
        path: req.path,
        origin: req.get('origin'),
        host: req.get('host'),
        'user-agent': req.get('user-agent')
    };
    console.log('Request:', JSON.stringify(logInfo, null, 2));
    next();
});

// Middleware para verificar el estado de la conexión
app.use(async (req, res, next) => {
    if (!isConnected) {
        try {
            await connectDB();
            if (!isConnected) {
                console.log('Base de datos no disponible - Intentando reconectar');
                return res.status(503).json({ 
                    message: 'Base de datos no disponible',
                    details: 'Intentando reconectar con la base de datos'
                });
            }
        } catch (error) {
            console.error('Error de conexión a la base de datos:', error);
            return res.status(503).json({ 
                message: 'Base de datos no disponible',
                details: error.message
            });
        }
    }
    next();
});

// Ruta raíz
app.get('/', (req, res) => {
    console.log('Accediendo a la ruta raíz');
    res.json({
        message: 'API de Tienda de Juguetes',
        status: 'online',
        dbStatus: isConnected ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV,
        endpoints: {
            novedades: '/api/novedades',
            puzzles: '/api/puzzles',
            juegosCreatividad: '/api/juegos-creatividad',
            juegosMesa: '/api/juegos-mesa',
            juegosMadera: '/api/juegos-madera',
            health: '/api/health'
        }
    });
});

// Rutas para Novedades
app.get('/api/novedades', async (req, res) => {
    try {
        const novedades = await Novedades.find();
        res.json(novedades);
    } catch (err) {
        console.error('Error en /api/novedades:', err);
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
        console.error('Error en /api/novedades/:id:', err);
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
    res.json({ 
        status: 'ok',
        environment: process.env.NODE_ENV,
        dbStatus: isConnected ? 'connected' : 'disconnected',
        dbStateDetails: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
    });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
    console.log(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        message: 'Ruta no encontrada',
        requestedPath: req.originalUrl,
        method: req.method,
        availableEndpoints: {
            root: '/',
            novedades: '/api/novedades',
            puzzles: '/api/puzzles',
            juegosCreatividad: '/api/juegos-creatividad',
            juegosMesa: '/api/juegos-mesa',
            juegosMadera: '/api/juegos-madera',
            health: '/api/health'
        }
    });
});

// Exportar la app para Vercel
module.exports = app;

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}
