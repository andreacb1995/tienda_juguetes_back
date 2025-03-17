const express = require('express');
const router = express.Router();
const { Novedades, Puzles, Creatividad, JuegosMesa, Madera } = require('../modelos/juguete');

// Mapeo de categorías a modelos para hacerlo más limpio
const CATEGORIA_MODELOS = {
    'novedades': Novedades,
    'puzles': Puzles,
    'creatividad': Creatividad,
    'juegos-mesa': JuegosMesa,
    'madera': Madera
};

router.get('/:categoria', async (req, res) => {
    try {
        const categoria = req.params.categoria;
        const modelo = CATEGORIA_MODELOS[categoria];

        if (!modelo) {
            return res.status(404).json({ 
                mensaje: 'Categoría no encontrada',
                categoriasDisponibles: Object.keys(CATEGORIA_MODELOS)
            });
        }

        const juguetes = await modelo.find();
        
        if (!juguetes.length) {
            return res.status(404).json({ 
                mensaje: `No se encontraron juguetes en la categoría ${categoria}`
            });
        }

        res.json(juguetes);
    } catch (error) {
        console.error('Error al obtener juguetes:', error);
        res.status(500).json({ 
            mensaje: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;