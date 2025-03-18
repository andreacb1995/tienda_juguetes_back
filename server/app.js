require('dotenv').config();
const mongoose = require('mongoose');
const { Novedades, Puzzles, JuegosCreatividad, JuegosMesa, JuegosMadera } = require('./modelos/juguete');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const session = require('express-session');
const Usuario = require('./modelos/usuario');

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:4200', 'https://tienda-juguetes.vercel.app'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin);
        } else {
            callback(new Error('Bloqueado por CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());


// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'tu_secreto_temporal',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // Cambiado para permitir cookies en peticiones cross-origin
        maxAge: 3600000,
        httpOnly: true,
        path: '/'
    }
}));

const dbUrl = process.env.MONGODB_URI;
const dbName = 'edukids';

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
            dbName: dbName,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority'
        });

        isConnected = true;
        console.log('MongoDB conectado en:', db.connection.host);
        console.log('Base de datos:', db.connection.name);
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

// Middleware para verificar el estado de la conexión
app.use(async (req, res, next) => {
    if (!isConnected) {
        try {
            await connectDB();
            if (!isConnected) {
                return res.status(503).json({ 
                    message: 'Base de datos no disponible',
                    details: 'Intentando reconectar con la base de datos'
                });
            }
        } catch (error) {
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
    res.json({
        message: 'API de Tienda de Juguetes',
        status: 'online',
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
        console.log('Intentando obtener novedades...');
        const novedades = await Novedades.find();
        console.log('Novedades encontradas:', novedades.length);
        
        if (!novedades) {
            console.log('No se encontraron novedades');
            return res.status(404).json({ 
                mensaje: 'No se encontraron novedades',
                error: 'Colección vacía'
            });
        }
        
        res.json(novedades);
    } catch (err) {
        console.error('Error al obtener novedades:', err);
        res.status(500).json({ 
            mensaje: 'Error al obtener novedades',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
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


app.get('/api/puzzles', async (req, res) => {
    // Establecer headers CORS específicos
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const puzzles = await Puzzles.find();
        
        if (!puzzles) {
            console.log('No se encontraron puzzles');
            return res.status(404).json({ 
                mensaje: 'No se encontraron puzzles',
                error: 'Colección vacía'
            });
        }
        
        res.json(puzzles);
    } catch (err) {
        console.error('Error al obtener puzzles:', err);
        res.status(500).json({ 
            mensaje: 'Error al obtener puzzles',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});


// Rutas para Puzzles
app.get('/api/puzzles2', async (req, res) => {
    try {
        const puzzles = await Puzzles.find();
        
        if (!puzzles) {
            return res.status(404).json({ 
                mensaje: 'No se encontraron puzzles',
                error: 'Colección vacía'
            });
        }
        
        res.json(puzzles);
    } catch (err) {
        res.status(500).json({ 
            mensaje: 'Error al obtener puzzles',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

app.get('/api/puzzles/:id', async (req, res) => {
    try {
        const puzzle = await Puzzles.findById(req.params.id);
        if (!puzzle) {
            return res.status(404).json({ 
                mensaje: 'Puzzle no encontrado',
                error: 'ID no existe'
            });
        }
        res.json(puzzle);
    } catch (err) {
        res.status(500).json({ 
            mensaje: 'Error al obtener el puzzle',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Rutas para Juegos de Creatividad
app.get('/api/juegos-creatividad', async (req, res) => {
    try {
        const juegosCreatividad = await JuegosCreatividad.find();
        
        if (!juegosCreatividad) {
            return res.status(404).json({ 
                mensaje: 'No se encontraron juegos de creatividad',
                error: 'Colección vacía'
            });
        }
        
        res.json(juegosCreatividad);
    } catch (err) {
        res.status(500).json({ 
            mensaje: 'Error al obtener juegos de creatividad',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

app.get('/api/juegos-creatividad/:id', async (req, res) => {
    try {
        const juegoCreatividad = await JuegosCreatividad.findById(req.params.id);
        if (!juegoCreatividad) {
            return res.status(404).json({ 
                mensaje: 'Juego de creatividad no encontrado',
                error: 'ID no existe'
            });
        }
        res.json(juegoCreatividad);
    } catch (err) {
        res.status(500).json({ 
            mensaje: 'Error al obtener el juego de creatividad',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Rutas para Juegos de Mesa
app.get('/api/juegos-mesa', async (req, res) => {
    try {
        const juegosMesa = await JuegosMesa.find();
        
        if (!juegosMesa) {
            return res.status(404).json({ 
                mensaje: 'No se encontraron juegos de mesa',
                error: 'Colección vacía'
            });
        }
        
        res.json(juegosMesa);
    } catch (err) {
        res.status(500).json({ 
            mensaje: 'Error al obtener juegos de mesa',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

app.get('/api/juegos-mesa/:id', async (req, res) => {
    try {
        const juegoMesa = await JuegosMesa.findById(req.params.id);
        if (!juegoMesa) {
            return res.status(404).json({ 
                mensaje: 'Juego de mesa no encontrado',
                error: 'ID no existe'
            });
        }
        res.json(juegoMesa);
    } catch (err) {
        res.status(500).json({ 
            mensaje: 'Error al obtener el juego de mesa',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

// Rutas para Juegos de Madera
app.get('/api/juegos-madera', async (req, res) => {
    try {
        const juegosMadera = await JuegosMadera.find();
        
        if (!juegosMadera) {
            return res.status(404).json({ 
                mensaje: 'No se encontraron juegos de madera',
                error: 'Colección vacía'
            });
        }
        
        res.json(juegosMadera);
    } catch (err) {
        res.status(500).json({ 
            mensaje: 'Error al obtener juegos de madera',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

app.get('/api/juegos-madera/:id', async (req, res) => {
    try {
        const juegoMadera = await JuegosMadera.findById(req.params.id);
        if (!juegoMadera) {
            return res.status(404).json({ 
                mensaje: 'Juego de madera no encontrado',
                error: 'ID no existe'
            });
        }
        res.json(juegoMadera);
    } catch (err) {
        res.status(500).json({ 
            mensaje: 'Error al obtener el juego de madera',
            error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});


// Rutas de autenticación
app.post('/api/auth/registro', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }

        // Crear nuevo usuario
        const usuario = new Usuario({
            nombre,
            email,
            password
        });

        await usuario.save();

        // Crear sesión
        req.session.userId = usuario._id;

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const esValida = await usuario.compararPassword(password);
        if (!esValida) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // Crear sesión
        req.session.userId = usuario._id;

        res.json({
            mensaje: 'Login exitoso',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ mensaje: 'Error al cerrar sesión' });
        }
        res.json({ mensaje: 'Sesión cerrada exitosamente' });
    });
});

app.get('/api/auth/verificar-sesion', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.json({ autenticado: false });
        }

        const usuario = await Usuario.findById(req.session.userId).select('-password');
        if (!usuario) {
            return res.json({ autenticado: false });
        }

        res.json({
            autenticado: true,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });
    } catch (error) {
        console.error('Error al verificar sesión:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
});

// Middleware para proteger rutas
const requireAuth = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ mensaje: 'No autorizado' });
    }
    try {
        const usuario = await Usuario.findById(req.session.userId);
        if (!usuario) {
            return res.status(401).json({ mensaje: 'No autorizado' });
        }
        req.usuario = usuario;
        next();
    } catch (error) {
        res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Middleware de error global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'production' ? {} : err,
        path: req.path,
        method: req.method
    });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        message: 'Ruta no encontrada',
        path: req.path,
        method: req.method,
        availableEndpoints: {
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
