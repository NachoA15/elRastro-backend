const {Schema, model} = require('mongoose')
const mongoose = require('mongoose')
const productoSchema = new Schema({
    nombre: String,
    direccion: Number,
    usuario: String,
    precioInicial: Number,
    fechaInicio: Date,
    fechaCierre: Date,
    descripcion: String,
    imagen: String,
    puja: JSON
})


module.exports = mongoose.models.Producto || mongoose.model('Producto', productoSchema)
