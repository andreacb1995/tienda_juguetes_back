const dotenv = require('dotenv');
dotenv.config();

// Verificar y limpiar URI de MongoDB
const cleanMongoURI = (uri) => {
    if (!uri) return null;
    // Eliminar espacios en blanco
    return uri.trim();
};

const config = {
    MONGODB_URI: cleanMongoURI(process.env.MONGODB_URI),
    PORT: process.env.PORT || 3000
};

// Verificación de configuración
if (!config.MONGODB_URI) {
    console.error('⚠️ MONGODB_URI no está configurado');
}

console.log('📝 Configuración cargada:', {
    MONGODB_URI: config.MONGODB_URI ? 'Configurado' : 'No configurado',
    PORT: config.PORT
});

module.exports = config;