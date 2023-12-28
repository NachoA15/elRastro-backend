require('./db/mongoose')
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const productoController = require("./controller/productoController");
const cron = require("node-cron");

const {routerProducto} = require('./router/routerProducto')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors())

app.use('/api/v2/productos/', routerProducto)

const port = 5001
app.listen(port, () => {
    console.log('Listening on port ' + port)
    console.log('elRastro - Productos')
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

cron.schedule('1 0 * * *', () => {
    productoController.notificarCorreo();
    productoController.reabrirSubastas();
});