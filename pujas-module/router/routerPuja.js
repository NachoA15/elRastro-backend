const express = require('express')
const routerPuja = express.Router()
const pujaController = require('../controller/pujaController')

routerPuja.get('/', pujaController.listarPujas)
    .post('/', pujaController.guardarPuja)
    .put('/', pujaController.guardarPuja)
    .delete('/:id', pujaController.borrarPuja)
    .delete('/', pujaController.borrarPujasPorProducto);

module.exports = {routerPuja};


