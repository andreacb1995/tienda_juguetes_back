const app = require('./app');
const { PORT } = require('./config');

// Añade una ruta de prueba directamente aquí
app.get('/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
    });
}

// Importante: exportar app para Vercel
module.exports = app;