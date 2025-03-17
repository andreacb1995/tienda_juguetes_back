const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGODB_URI } = require('./config');
const juguetesRoutes = require('./routes/juguetes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.error('Error de conexión:', err));

// Rutas
app.use('/api/juguetes', juguetesRoutes);

// Ruta de prueba
app.get('/api', (req, res) => {
    res.json({ mensaje: 'API de Edukids funcionando' });
});

module.exports = app;