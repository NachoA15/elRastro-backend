require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')


const {routerCarbono} = require('./router/routerCarbono')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors())

app.use('/api/v2/carbono/', routerCarbono)

const port = 5004
app.listen(port, () => {
    console.log('Listening on port ' + port)
    console.log('elRastro - Carbono')
})