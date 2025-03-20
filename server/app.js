require('dotenv').config();
const mongoose = require('mongoose');
const { Novedades, Puzzles, JuegosCreatividad, JuegosMesa, JuegosMadera } = require('./modelos/juguete');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const session = require('express-session');
const Usuario = require('./modelos/usuario');
const Pedido = require('./modelos/pedido');
const bcrypt = require('bcryptjs');

const modelos = {
    'novedades': require('./modelos/juguete').Novedades,
    'puzzles': require('./modelos/juguete').Puzzles,
    'juegos-creatividad': require('./modelos/juguete').JuegosCreatividad,
    'juegos-mesa': require('./modelos/juguete').JuegosMesa,
    'juegos-madera': require('./modelos/juguete').JuegosMadera
};

// Actualiza la configuración de CORS
const corsOptions = {
    origin: ['http://localhost:4200', 'https://tienda-juguetes.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
  app.use(cors(corsOptions));
  
  // Actualiza la configuración de sesiones
  app.use(session({
    secret: process.env.SESSION_SECRET || 'tu_secreto_temporal',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      httpOnly: true
    }
  }));

app.use(express.json());



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

// Ruta para Novedades
app.get('/api/novedades', async (req, res) => {
    try {
        const novedades = await Novedades.find();
        
        if (!novedades) {
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

// Ruta para Puzzles
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

// Ruta para Juegos de Creatividad
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

// Ruta para Juegos de Mesa
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

// Ruta para Juegos de Madera
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

// Ruta de registro
app.post('/api/auth/registro', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ username });
        if (usuarioExistente) {
            return res.status(400).json({ mensaje: 'El usuario ya existe' });
        }

        // Crear el hash de la contraseña manualmente
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Crear nuevo usuario con la contraseña hasheada
        const usuario = new Usuario({
            ...req.body,
            password: hashPassword
        });

        await usuario.save();

        // Crear sesión
        req.session.userId = usuario._id;

        // Devolver usuario sin campos sensibles
        const usuarioResponse = {
            id: usuario._id,
            username: usuario.username,
            nombre: usuario.nombre,
            rol: usuario.rol
        };

        res.status(201).json({
            mensaje: 'Usuario registrado exitosamente',
            usuario: usuarioResponse
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            mensaje: 'Error en el registro', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' 
        });
    }
});

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;        
        // Buscar usuario
        const usuario = await Usuario.findOne({ username });
        if (!usuario) {
            console.log('Usuario no encontrado');
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // Verificar contraseña directamente con bcrypt
        const esValida = await bcrypt.compare(password, usuario.password);

        if (!esValida) {
            console.log('Contraseña inválida');
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // Crear sesión
        req.session.userId = usuario._id;

        // Preparar respuesta sin datos sensibles
        const usuarioResponse = {
            id: usuario._id,
            username: usuario.username,
            nombre: usuario.nombre,
            rol: usuario.rol,
            apellidos: usuario.apellidos,
            email: usuario.email,
            telefono: usuario.telefono,
            direccion: usuario.direccion,
            rol: usuario.rol
        };

        res.json({
            mensaje: 'Login exitoso',
            usuario: usuarioResponse
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            mensaje: 'Error en el servidor', 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' 
        });
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
  
      const usuario = await Usuario.findById(req.session.userId)
        .select('-password -__v');
  
      if (!usuario) {
        return res.json({ autenticado: false });
      }
      res.json({
            autenticado: true,
            usuario: {
            id: usuario._id,
            username: usuario.username,
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            email: usuario.email,
            telefono: usuario.telefono,
            direccion: usuario.direccion,
            rol: usuario.rol
        }
      });
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      res.status(500).json({ 
        mensaje: 'Error en el servidor', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor' 
      });
    }
  });

// Rutas para verificar y actualizar stock
app.post('/api/stock/verificar', async (req, res) => {
    try {
        const { productos } = req.body;
        let stockDisponible = true;
        let mensajeError = '';

        for (const prod of productos) {
            const producto = await obtenerProductoPorId(prod._id);
            if (!producto || producto.stock < prod.cantidad) {
                stockDisponible = false;
                mensajeError = `Stock no disponible para ${producto ? producto.nombre : 'producto desconocido'}`;
                break;
            }
        }

        res.json({ disponible: stockDisponible, mensaje: mensajeError });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al verificar stock' });
    }
});

app.post('/api/stock/reservar', async (req, res) => {
    try {
        const { productos } = req.body;
        const reservaId = Date.now().toString();
        for (const prod of productos) {
            const cantidad = prod.cantidad;
            // Si la cantidad es negativa (reservar productos), disminuimos el stock
            // Si la cantidad es positiva (agregar de nuevo al carrito), aumentamos el stock
            if (cantidad < 0) {
                await actualizarStock(prod.categoria, prod._id, cantidad);  // Reducir stock
            } else if (cantidad > 0) {
                await actualizarStock(prod.categoria, prod._id, cantidad);  // Aumentar stock
            }

        }
        res.status(200).json({ mensaje: 'Stock reservado', reservaId });

    } catch (error) {
        res.status(500).json({ mensaje: 'Error al reservar stock', error: error.message });
    }
});

app.post('/api/pedidos/crear', async (req, res) => {
    try {
      const { usuarioId, datosCliente, productos, total } = req.body;
  
      // Validar datos requeridos
      if (!datosCliente || !productos || !total) {
        return res.status(400).json({
          mensaje: 'Faltan datos requeridos para crear el pedido'
        });
      }
  
      // Crear el pedido
      const pedido = new Pedido({
        usuarioId: usuarioId || null, // Permitir pedidos sin usuario
        datosCliente,
        productos,
        total,
        estado: 'pendiente'
      });
  
      await pedido.save();
  
      res.status(201).json({
        mensaje: 'Pedido creado exitosamente',
        pedido: {
          id: pedido._id,
          codigoPedido: pedido.codigoPedido
        }
      });
  
    } catch (error) {
      console.error('Error al crear pedido:', error);
      res.status(500).json({
        mensaje: 'Error al crear el pedido',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  });

// Endpoint para obtener pedidos del usuario
app.get('/api/pedidos/usuario', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ mensaje: 'Usuario no autenticado' });
      }
  
      const pedidos = await Pedido.find({ usuarioId: req.session.userId })
        .sort({ fechaPedido: -1 }); // Ordenar por fecha descendente
  
      res.json(pedidos);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ 
        mensaje: 'Error al obtener pedidos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
      });
    }
  });

// Función auxiliar para verificar stock
async function verificarStockDisponible(categoria, productoId, cantidad) {
    const modelo = modelos[categoria];
    if (!modelo) return false;
    
    const producto = await modelo.findById(productoId);
    return producto && producto.stock >= cantidad;
}

app.get('/api/usuarios/datos', async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.usuario._id)
            .select('-password -__v');
        
        res.json(usuario);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener datos del usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
    }
});

app.put('/api/usuarios/actualizar', async (req, res) => {
    try {
        const datosActualizados = req.body;
        delete datosActualizados.password; // Evitar actualización de contraseña por esta ruta
        
        const usuario = await Usuario.findByIdAndUpdate(
            req.usuario._id,
            datosActualizados,
            { new: true }
        ).select('-password -__v');

        res.json({
            mensaje: 'Datos actualizados correctamente',
            usuario
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar datos',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
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

// Función para actualizar stock en la colección correcta
const actualizarStock = async (categoria, _id, cantidad) => {
    // Obtener el modelo basado en la categoría
    const modelo = modelos[categoria];
    if (!modelo) {
        throw new Error(`Modelo no encontrado para la categoría ${categoria}.`);
    }

    // Buscar el producto por su ID en la colección correcta
    const producto = await modelo.findById(_id);

    if (!producto) {
        throw new Error(`Producto con ID ${_id} no encontrado en la colección ${categoria}.`);
    }

    // Actualizar el stock
    producto.stock += cantidad;

    // Guardar el producto con el nuevo stock
    await producto.save();
};


// Exportar la app para Vercel
module.exports = app;

// Solo iniciar el servidor si no estamos en Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
}
