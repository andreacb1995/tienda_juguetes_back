const mongoose = require('mongoose');
const { MONGODB_URI } = require('./config');

async function testConnection() {
    try {
        console.log('Intentando conectar a MongoDB...');
        const conn = await mongoose.connect(MONGODB_URI);
        
        console.log('✅ Conexión exitosa!');
        console.log(`Host: ${conn.connection.host}`);
        console.log(`Base de datos: ${conn.connection.name}`);
        
        // Intentar una operación simple
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('Colecciones disponibles:', collections.map(c => c.name));
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

testConnection();