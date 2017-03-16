const Promise = require('bluebird')
const db = require('./dbcontroller.js')
const admin = require('./bots.js').admin
const fs = Promise.promisifyAll(require('fs-extra'))
const unzip = require('unzip')
const path = require('path')
const returns = require('./returns.js')
const message = require('./message.js')

exports.uploadPhoto = async function(msg) {
   try {
      await fs.removeAsync('zip')
      await fs.mkdirAsync('zip')
      let zip = await admin.downloadFile(msg.document.file_id, __dirname + '/../zip/')
      let name = path.parse(zip).base
      fs.createReadStream(__dirname + '/../zip/' + name).pipe(unzip.Extract({ path: __dirname + '/../zip/' })).on('close', async() => {
         let author = await fs.readFileAsync(path.resolve(__dirname, '../zip/author.txt'), 'utf8')
         let dir = await fs.readdirAsync(path.resolve(__dirname, '../zip/'))
         dir.forEach(async(item) => {
            if (item != 'author.txt' && item != name) {
               try {
                  await db.addCredit(author, item)
                  fs.moveAsync(path.resolve(__dirname, '../zip/' + item), path.resolve(__dirname, '../mff/' + item))
               } catch (e) {
                 console.log(e)
                  returns.handleErr(e, null, 'db add')
               }
            }
         })
         admin.sendMessage(message.connor, 'Added All Photos')
         async function deleteFolder() {
           let zipFolder = await fs.readdirAsync(path.resolve(__dirname, '../zip/'))
           if (zipFolder.length === 2) {
             fs.remove(path.resolve(__dirname, '../zip/'))
           }
           else {
             setTimeout(deleteFolder, 3000)
           }
         }
         deleteFolder()
      })
   } catch (e) {
     console.log(e)
      returns.handleErr(e, null, 'Upload Error')
   }
}

exports.getUsers = async function(msg) {
   if (msg.chat.id === message.connor) {
      let tempStr = ''
      let users = await db.lookup({})
      users.forEach(user => {
         tempStr += `User: ${user.name}${' '.repeat(10)}Group: ${user.group}\n`
      })
      admin.sendMessage(message.connor, tempStr)
   }
}

exports.getLogs = async function(msg) {
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

exports.broadcast = async function(msg, match) {
   if (msg.chat.id === message.connor) {
      let users = await db.lookup({})
      users.forEach(id => {
         admin.sendMessage(id.chatId, match[1], { parse_mode: 'Markdown' })
      })
   }
}

exports.test = function(msg, match) {
   if (msg.chat.id === message.connor) {
      admin.sendMessage(message.connor, match[1], { parse_mode: 'Markdown' })
   }
}
