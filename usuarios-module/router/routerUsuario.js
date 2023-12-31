const express = require('express')
const { checkToken, createUsuarioController, getUsuarioByIdController, deleteUsuarioController, updateUsuarioController,
    updateValoracionController, getRatingUsuarioController, getValoracionUsuarioController, checkTokenInCache, logOut
} = require('../controller/usuarioController')

const routerUsuario = express.Router()

routerUsuario.post('/', createUsuarioController)
routerUsuario.get('/', getUsuarioByIdController)
routerUsuario.delete('/:id', deleteUsuarioController)
routerUsuario.put('/', updateUsuarioController)
routerUsuario.put('/valoracion', updateValoracionController)
routerUsuario.get('/valoracionMedia', getRatingUsuarioController)
routerUsuario.get('/valoracion', getValoracionUsuarioController)
routerUsuario.post('/checkToken',checkToken)
routerUsuario.get('/checkLocalCache', checkTokenInCache )
routerUsuario.post('/logOut', logOut)

module.exports = {
    routerUsuario
}
