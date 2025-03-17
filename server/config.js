const dotenv = require('dotenv');
dotenv.config();

const config = {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/edukids',
    PORT: process.env.PORT || 3000
};

// Verificación de configuración
if (!process.env.MONGODB_URI) {
    console.error('⚠️  No se encontró la variable de entorno MONGODB_URI');
}

module.exports = config;