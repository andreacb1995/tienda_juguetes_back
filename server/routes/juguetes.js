const express = require('express');
const router = express.Router();
const { Novedades, Puzles, Creatividad, JuegosMesa, Madera } = require('../modelos/juguete');

router.get('/:categoria', async (req, res) => {
    try {
        let modelo;
        switch(req.params.categoria) {
            case 'novedades':
                modelo = Novedades;
                break;
            case 'puzles':
                modelo = Puzles;
                break;
            case 'creatividad':
                modelo = Creatividad;
                break;
            case 'juegos-mesa':
                modelo = JuegosMesa;
                break;
            case 'madera':
                modelo = Madera;
                break;
            default:
                return res.status(404).json({ mensaje: 'Categoría no encontrada' });
        }
        const juguetes = await modelo.find();
        res.json(juguetes);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;