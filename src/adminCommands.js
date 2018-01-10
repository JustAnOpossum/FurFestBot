const Promise = require('bluebird')
const db = require('./dbcontroller.js')
const admin = require('./bots.js').admin
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const returns = require('./returns.js')
const message = require('./message.js')

exports.getUsers = async function (msg) {
    if (msg.chat.id === message.owner) {
        let tempStr = ''
        let users = await db.find({}, 'users')
        users.forEach(user => {
            tempStr += `${user.name}\n`
        })
        tempStr += users.length
        admin.sendMessage(message.owner, tempStr)
    }
}

exports.getLogs = async function (msg) {
    if (msg.chat.id === message.owner) {
        let tempStr = ''
        let log = await fs.readFileAsync(__dirname + '/../logs/bot.log', 'utf8')
        let split = log.split('\n').reverse()
        for (let x = 1; x <= 6; x++) {
            let json = JSON.parse(split[x])
            tempStr += `${json.level}: ${json.message} ${json.timestamp}\n\n`
        }
        admin.sendMessage(message.owner, tempStr)
    }
}

exports.broadcast = async function (msg, match) {
    if (msg.chat.id === message.owner) {
        let users = await db.lookup({})
        users.forEach(id => {
            admin.sendMessage(id.chatId, match[1], { parse_mode: 'Markdown' })
        })
    }
}

exports.test = function (msg, match) {
    if (msg.chat.id === message.owner) {
        admin.sendMessage(message.owner, match[1], { parse_mode: 'Markdown' })
    }
}
