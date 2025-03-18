const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    usuario: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },
        username: {
            type: String,
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        apellidos: {
            type: String,
            required: true
        }
    },
    productos: [{
        productoId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        precio: {
            type: Number,
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    direccionEnvio: {
        calle: {
            type: String,
            required: true
        },
        numero: {
            type: String,
            required: true
        },
        piso: String,
        codigoPostal: {
            type: String,
            required: true
        },
        ciudad: {
            type: String,
            required: true
        },
        provincia: {
            type: String,
            required: true
        }
    },
    estado: {
        type: String,
        enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    total: {
        type: Number,
        required: true
    },
    fechaPedido: {
        type: Date,
        default: Date.now
    },
    metodoPago: {
        type: String,
        required: true,
        enum: ['tarjeta', 'transferencia', 'contrareembolso']
    },
    numeroSeguimiento: String,
    notas: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Pedido', pedidoSchema);    