const {Schema, model} = require('mongoose')

const pujaSchema = new Schema({
    usuario: String,
    cantidad: Number,
    fecha: Date,
    producto: String
})

const Puja = model('Puja', pujaSchema)

module.exports = Puja