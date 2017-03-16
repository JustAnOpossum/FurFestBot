const Promise = require('bluebird')
const mff = require('./bots.js').mff
const returns = require('./returns.js')
const days = require('./days.js')
const fs = Promise.promisifyAll(require('fs-extra'))
const db = require('./dbcontroller.js')
const message = require('./message.js')

function startStr() {
   return 'Hello! This bot has a MFF countdown, but will start in ' + (days.untilMff() - fs.readdirSync('mff').length) + ' days.\nThis is because I don\'t have enough pictures until then.\nIf there are any requests for the mff please message me @ConnorTheFox'
}

function getHelpStr() {
   let tempStr = ''
   for (let x in message.help) {
      tempStr += `/${x}: ${message.help[x]}\n`
   }
   return tempStr
}

exports.start = function(msg) {
   returns.generateLog(msg.chat.title || msg.chat.first_name, 'start', 'command', returns.testForGroup(msg.chat.first_name))
   mff.sendMessage(msg.chat.id, startStr(), { parse_mode: 'markdown' })
}

exports.message = async function(msg) {
   if (msg.migrate_from_chat_id) {
      let lookup = await db.lookup('chatId', msg.migrate_from_chat_id)
      if (lookup[0]) {
         db.update({ chatId: msg.migrate_from_chat_id }, msg.migrate_to_chat_id)
      }
   }
}

exports.addedToGroup = function(msg) {
   if (msg.new_chat_participant.id === message.bot) {
      mff.sendMessage(msg.chat.id, start(), { parse_mode: 'markdown' })
   }
}

exports.countdown = async function(msg) {
   returns.generateLog(msg.chat.title || msg.chat.first_name, 'countdown', 'command', returns.testForGroup(msg.chat.first_name))
   try {
      let added = await db.add(msg.chat.id, msg.chat.title || msg.chat.first_name, returns.testForGroup(msg.chat.first_name))
      if (added === 'Added') {
         let sent = mff.sendMessage(msg.chat.id, 'Added to list!')
         mff.sendMessage(message.connor, msg.chat.title || msg.chat.first_name + ' Subscribed!')
      }
      if (added === 'In') {
         mff.sendMessage(msg.chat.id, 'Im sorry you are already subscribed')
      }
   } catch (e) {
      returns.handleErr(e, null, 'Countdown')
   }
}

exports.stopCountdown = async function(msg) {
   try {
      let remove = await db.remove(msg.chat.id)
      if (remove === 'Removed') {
         mff.sendMessage(msg.chat.id, 'Unscribed form daily countdown')
      }
      if (remove === 'Not Here') {
         mff.sendMessage(msg.chat.id, 'Already removed')
      }
   } catch (e) {
      returns.handleErr(e, msg.chat.id, 'Removing User', mff)
   }
}

exports.info = function(msg) {
   returns.generateLog(msg.chat.title || msg.chat.first_name, 'info', 'command', returns.testForGroup(msg.chat.first_name))
   mff.sendMessage(msg.chat.id, message.info)
}

exports.help = function(msg) {
   returns.generateLog(msg.chat.title || msg.chat.first_name, 'help', 'command', returns.testForGroup(msg.chat.first_name))
   mff.sendMessage(msg.chat.id, getHelpStr())
}

exports.daysleft = function(msg) {
   let day = days.untilMff()
   returns.generateLog(msg.chat.title || msg.chat.first_name, 'daysleft', 'command', returns.testForGroup(msg.chat.first_name))
   mff.sendMessage(msg.chat.id, day + ' Days until MFF')
}
