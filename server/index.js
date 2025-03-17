const app = require('./app');
const { PORT } = require('./config');

// Ruta de prueba básica
app.get('/', (req, res) => {
    res.json({
        message: 'API de Edukids funcionando',
        endpoints: {
            novedades: '/api/juguetes/novedades',
            puzles: '/api/juguetes/puzles',
            creatividad: '/api/juguetes/creatividad',
            juegosMesa: '/api/juguetes/juegos-mesa',
            madera: '/api/juguetes/madera'
        }
    });
});

// Solo escucha en el puerto si no está en producción
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
}

module.exports = app;