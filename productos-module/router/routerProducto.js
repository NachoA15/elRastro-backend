const express = require('express')
const routerProducto = express.Router()
const productoController = require('../controller/productoController')

routerProducto.get('/', productoController.listarProductos)
    .get('/byPujas', productoController.listarProductosPorPujasUsuario)
    .get('/:id', productoController.listarProductos)
    .post('/filter', productoController.filtrarProductos)
    .post('/', productoController.guardarProducto)
    .put('/', productoController.guardarProducto)
    .delete('/:id', productoController.borrarProducto);

module.exports = {routerProducto};