const TelegramBot = require('node-telegram-bot-api')

const token = process.env.TOKEN
const adminToken = process.env.ADMIN
const mode = process.env.TYPE
let mff
let admin
if (mode === 'test') {
   mff = new TelegramBot(token, {
      polling: true
   })
   admin = mff
}
if (mode === 'production') {
   mff = new TelegramBot(token, {
      webHook: {
         port: 8000,
         key: __dirname + '/keys/key.pem',
         cert: __dirname + '/keys/crt.pem'
      }
   })
   mff.setWebHook('https://thetechiefox.com/bot' + token)
   admin = new TelegramBot(adminToken, {
      webHook: {
         port: 8003,
         key: __dirname + '/keys/key.pem',
         cert: __dirname + '/keys/crt.pem'
      }
   })
   admin.setWebHook('https://thetechiefox.com/bot' + adminToken)
}

exports.mff = mff
exports.admin = admin
