'use strict'

const days = require('./src/days.js')
const admin = require('./src/adminCommands.js')
const bot = require('./src/bots.js').bot
const adminBot = require('./src/bots.js').admin
const command = require('./src/commands.js')
const message = require('./src/message.js')

bot.on('new_chat_members', command.addedToGroup)
bot.on('message', command.message)
bot.onText(/\/start/, command.menu)
bot.onText(/\/menu/, command.menu)
bot.onText(/\/countdown/, command.countdown)
bot.onText(/\/stopcountdown/, command.stopCountdown)
bot.onText(/\/info/, command.info)
bot.onText(/\/help/, command.help)
bot.onText(/\/daysleft/, command.daysleft)
bot.on('callback_query', command.answerKeyboard)

adminBot.onText(/\/broadcast (.+)/, admin.broadcast)
adminBot.onText(/\/test (.+)/, admin.test)
adminBot.onText(/\/users/, admin.getUsers)
adminBot.onText(/\/logs/, admin.getLogs)
adminBot.onText(/\/upload/, admin.uploadPhoto)