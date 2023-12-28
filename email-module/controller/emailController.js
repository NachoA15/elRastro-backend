const {notifyPurchase} = require('../service/emailService')

const notifyPurchaseController = async(req, res, next) => {
    if (!req.body){
        return res.status(400).json({
            error: "bad request"
        })
    }
    const response = await notifyPurchase(req.body.producto, req.body.comprador, req.body.vendedor)
    res.status(response["statusCode"]).json(response["message"])
}

module.exports = {
    notifyPurchaseController
}