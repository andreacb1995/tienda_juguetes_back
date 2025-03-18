const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

// Hash de la contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);