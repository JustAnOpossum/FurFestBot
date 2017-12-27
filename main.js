'use strict'

const days = require('./src/days.js')
const admin = require('./src/adminCommands.js')
const mff = require('./src/bots.js').mff
const adminBot = require('./src/bots.js').admin
const command = require('./src/mffCommands.js')
const message = require('./src/message.js')

mff.on('new_chat_participant', command.addedToGroup)
mff.on('message', command.message)
mff.onText(/\/start/, command.start)
mff.onText(/\/menu/, command.menu)
mff.onText(/\/countdown/, command.countdown)
mff.onText(/\/stopcountdown/, command.stopCountdown)
mff.onText(/\/info/, command.info)
mff.onText(/\/help/, command.help)
mff.onText(/\/daysleft/, command.daysleft)
mff.on('callback_query', command.answerKeyboard)

adminBot.onText(/\/broadcast (.+)/, admin.broadcast)
adminBot.onText(/\/test (.+)/, admin.test)
adminBot.onText(/\/users/, admin.getUsers)
adminBot.onText(/\/logs/, admin.getLogs)
adminBot.onText(/\/upload/, admin.uploadPhoto)