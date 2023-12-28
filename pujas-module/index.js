require('./db/mongoose')
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

const {routerPuja} = require('./router/routerPuja')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors())

app.use('/api/v2/pujas/', routerPuja)

const port = 5002
app.listen(port, () => {
    console.log('Listening on port ' + port)
    console.log('elRastro - Pujas')
})