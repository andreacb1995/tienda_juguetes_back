const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
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
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    direccion: {
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
    telefono: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['usuario', 'admin'],
        default: 'usuario'
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false,
    versionKey: false
});

// Método para transformar el documento antes de enviarlo
usuarioSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.createdAt;
    delete obj.updatedAt;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('Usuario', usuarioSchema);