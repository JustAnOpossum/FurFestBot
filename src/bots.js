const TelegramBot = require('node-telegram-bot-api')

const token = process.env.TOKEN
const mode = process.env.TYPE
const webhook = process.env.WEBHOOK
let bot
if (mode === 'test') {
    bot = new TelegramBot(token, {
        polling: true,
    })
}
if (mode === 'production') {
    bot = new TelegramBot(token, {
        webHook: {
            port: 8000
        }
    })
    bot.setWebHook(`https://${webhook}/bot${token}`)
}
if (mode === 'send') {
    bot = new TelegramBot(token)
}

exports.bot = bot
