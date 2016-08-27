const TelegramBot = require('node-telegram-bot-api')
const pic = require('./src/pic.js')
const token = '241409237:AAFzRvri3kBxB5TXpn0keZL1MY6bV8lOP7w'
const bot = new TelegramBot(token, {
    webHook: {
        polling:true
    }
})

bot.sendMessage('119682002', 'V 2.0 Changelog:\nNew Command: /airport (code) This command will monitor an airport and send a message if there is a delay. Feature will turn on a couple days before MFF.')
