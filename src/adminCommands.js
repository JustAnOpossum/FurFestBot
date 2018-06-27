const Promise = require('bluebird')
const db = require('./dbcontroller.js')
const bot = require('./bots.js').bot
const fs = Promise.promisifyAll(require('fs-extra'))
const message = require('./message.js')

exports.getUsers = async function (msg) {
    if (message.owner.includes(msg.chat.id)) {
        let tempStr = ''
        let users = await db.find({}, 'users')
        users.forEach(user => {
            tempStr += `${user.name}\n`
        })
        tempStr += users.length
        bot.sendMessage(msg.chat.id, tempStr)
    }
}

exports.getLogs = async function (msg) {
    if (message.owner.includes(msg.chat.id)) {
        let tempStr = ''
        let log = await fs.readFileAsync(__dirname + '/../logs/bot.log', 'utf8')
        let split = log.split('\n').reverse()
        for (let x = 1; x <= 6; x++) {
            let json = JSON.parse(split[x])
            tempStr += `${json.level}: ${json.message} ${json.timestamp}\n\n`
        }
        bot.sendMessage(msg.chat.id, tempStr)
    }
}

exports.broadcast = async function (msg, match) {
    if (message.owner.includes(msg.chat.id)) {
        let users = await db.lookup({})
        users.forEach(id => {
            bot.sendMessage(id.chatId, match[1], { parse_mode: 'Markdown' })
        })
    }
}

exports.test = function (msg, match) {
    if (message.owner.includes(msg.chat.id)) {
        bot.sendMessage(msg.chat.id, match[1], { parse_mode: 'Markdown' })
    }
}
