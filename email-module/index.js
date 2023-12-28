require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')

const {routerEmail} = require('./router/routerEmail')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cors())

app.use('/api/v2/email/', routerEmail)

const port = 5005
app.listen(port, () => {
    console.log('Listening on port ' + port)
    console.log('elRastro - Email')
})