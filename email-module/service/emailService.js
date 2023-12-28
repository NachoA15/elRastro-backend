const {transporter} = require('../email')

const notifyPurchase = async (producto, comprador, vendedor) => {
    transporter.sendMail({
        from: '"elRastro" ' + process.env.EMAIL_GMAIL,
        to: vendedor,
        subject: "Cierre de subasta",
        text: "Le notificamos que la subasta de " + producto + " se ha cerrado correctamente y hay un comprador. Tendrá que preparar y realizar el envío en 7 días. Un saludo"
    }).then(info => {
        console.log({info})
    }).catch(error => {
        console.log(error)
        return {statusCode: 400, message: error}
    });

    transporter.sendMail({
        from: '"elRastro" ' + process.env.EMAIL_GMAIL,
        to: comprador,
        subject: "Cierre de subasta",
        text: "Le notificamos que ha ganado la subasta de " + producto + "!. El vendedor " + vendedor + " tendrá que preparar y realizar el envío en 7 días. Un saludo"
    }).then(info => {
        console.log({info})
    }).catch(error => {
        console.log(error)
        return {statusCode: 400, message: error}
    });

    return {statusCode: 200, message: "Se han enviado correctamente los correos"}
}


module.exports = {
    notifyPurchase
}