const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL_GMAIL,
        pass: process.env.PASSWD_GMAIL
    }
})

transporter.verify().catch(console.error)

module.exports = {
    transporter
}