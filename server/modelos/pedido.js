const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false // Opcional para permitir pedidos sin usuario registrado
    },
    datosCliente: {
        nombre: String,
        apellidos: String,
        email: {
            type: String,
            required: true
        },
        telefono: String,
        direccion: {
            calle: String,
            numero: String,
            piso: String,
            codigoPostal: String,
            ciudad: String,
            provincia: String
        }
    },
    productos: [{
        productoId: String,
        categoria: String,
        nombre: String,
        precio: Number,
        cantidad: Number
    }],
    estado: {
        type: String,
        enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
        default: 'pendiente'
    },
    total: Number,
    codigoPedido: {
        type: String,
        unique: true
    },
    fechaPedido: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Generar código de pedido único antes de guardar
pedidoSchema.pre('save', async function(next) {
    if (!this.codigoPedido) {
        const fecha = new Date();
        const año = fecha.getFullYear().toString().substr(-2);
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const aleatorio = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.codigoPedido = `PED${año}${mes}${aleatorio}`;
    }
    next();
});

module.exports = mongoose.model('Pedido', pedidoSchema);