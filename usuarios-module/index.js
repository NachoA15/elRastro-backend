require('./db/mongoose')
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

const {routerUsuario} = require('./router/routerUsuario')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors())

app.use('/api/v2/usuarios/', routerUsuario)

const port = 5003
app.listen(port, () => {
    console.log('Listening on port ' + port)
    console.log('elRastro - Usuarios')
})