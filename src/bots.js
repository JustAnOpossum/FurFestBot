const TelegramBot = require('node-telegram-bot-api')

const token = process.env.TOKEN
const adminToken = process.env.ADMIN
const mode = process.env.TYPE
const webhook = process.env.WEBHOOK
let bot
let admin
if (mode === 'test') {
    bot = new TelegramBot(token, {
        polling: true,
    })
    admin = bot
}
if (mode === 'production') {
    bot = new TelegramBot(token, {
        webHook: {
            port: 8000
        }
    })
    bot.setWebHook(`https://${webhook}/bot${token}`)
    admin = new TelegramBot(adminToken, {
        webHook: {
            port: 8003
        }
    })
    admin.setWebHook(`https://${webhook}/bot${adminToken}`)
}
if (mode === 'send') {
    bot = new TelegramBot(token)
}

exports.bot = bot
exports.admin = admin
