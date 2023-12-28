const {notifyPurchaseController} = require('../controller/emailController')
const express = require('express')

const routerEmail = express.Router()

routerEmail.post('/confirm', notifyPurchaseController)

module.exports = {
    routerEmail
}
