const TelegramBot = require('node-telegram-bot-api')
const path = require('path')

const token = process.env.TOKEN
const adminToken = process.env.ADMIN
const mode = process.env.TYPE
let mff
let admin
if (mode === 'test') {
    mff = new TelegramBot(token, {
        polling: true,
    })
    admin = mff
}
if (mode === 'production') {
    let key = path.resolve(__dirname, '../keys/key.pem')
    let cert = path.resolve(__dirname, '../keys/crt.pem')
    mff = new TelegramBot(token, {
        webHook: {
            port: 8000,
            key: key,
            cert: cert
        }
    })
    mff.setWebHook('https://nerdfox.me/bot1' + token)
    admin = new TelegramBot(adminToken, {
        webHook: {
            port: 8003,
            key: key,
            cert: cert
        }
    })
    admin.setWebHook('https://nerdfox.me/bot1' + adminToken)
}
if (mode === 'send') {
    mff = new TelegramBot(token)
}

exports.mff = mff
exports.admin = admin
