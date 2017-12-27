const Promise = require('bluebird')
const db = require('./dbcontroller.js')
const admin = require('./bots.js').admin
const fs = Promise.promisifyAll(require('fs-extra'))
const unzip = require('unzip')
const path = require('path')
const returns = require('./returns.js')
const message = require('./message.js')

exports.uploadPhoto = async function (msg) {
    try {
        let url = msg.text.replace('/upload ', '')
        let zipFile = fs.createReadStream('/tmp/photos.zip')
        let unzipPipe = zipFile.pipe(unzip.Parse())
            .on('entry', async entry => {
                let photo = entry.path
                entry.pipe(fs.createWriteStream(`mff/${photo}`))
                db.add({ photo: photo, url: url }, 'credit')
            })
            .on('close', () => {
                admin.sendMessage(message.connor, 'All photos uploaded')
                fs.unlink('/tmp/photos.zip')
            })
    } catch (e) {
        console.log(e)
        returns.handleErr(e, null, 'Upload Error')
    }
}

exports.getUsers = async function (msg) {
    if (msg.chat.id === message.connor) {
        let tempStr = ''
        let users = await db.find({}, 'users')
        users.forEach(user => {
            tempStr += `User: ${user.name}${' '.repeat(10)}Group: ${user.group}\n`
        })
        admin.sendMessage(message.connor, tempStr)
    }
}

exports.getLogs = async function (msg) {
    if (msg.chat.id === message.connor) {
        let tempStr = ''
        let log = await fs.readFileAsync(__dirname + '/../logs/mffbot.log', 'utf8')
        let split = log.split('\n').reverse()
        for (let x = 1; x <= 6; x++) {
            let json = JSON.parse(split[x])
            tempStr += `${json.level}: ${json.message} ${json.timestamp}\n\n`
        }
        admin.sendMessage(message.connor, tempStr)
    }
}

exports.broadcast = async function (msg, match) {
    if (msg.chat.id === message.connor) {
        let users = await db.lookup({})
        users.forEach(id => {
            admin.sendMessage(id.chatId, match[1], { parse_mode: 'Markdown' })
        })
    }
}

exports.test = function (msg, match) {
    if (msg.chat.id === message.connor) {
        admin.sendMessage(message.connor, match[1], { parse_mode: 'Markdown' })
    }
}
