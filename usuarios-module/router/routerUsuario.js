const express = require('express')
const { createUsuarioController, getUsuarioByIdController, deleteUsuarioController, updateUsuarioController,
    updateValoracionController, getRatingUsuarioController, getValoracionUsuarioController
} = require('../controller/usuarioController')

const routerUsuario = express.Router()

routerUsuario.post('/', createUsuarioController)
routerUsuario.get('/', getUsuarioByIdController)
routerUsuario.delete('/:id', deleteUsuarioController)
routerUsuario.put('/', updateUsuarioController)
routerUsuario.put('/valoracion', updateValoracionController)
routerUsuario.get('/valoracionMedia', getRatingUsuarioController)
routerUsuario.get('/valoracion', getValoracionUsuarioController)

module.exports = {
    routerUsuario
}
