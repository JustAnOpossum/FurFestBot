const Promise = require('bluebird')
const path = require('path')
const mff = require('./bots.js').mff
const admin = require('./bots.js').admin
const returns = require('./returns.js')
const days = require('./days.js')
const fs = Promise.promisifyAll(require('fs-extra'))
const db = require('./dbcontroller.js')
const message = require('./message.js')

exports.start = async function(msg) {
   returns.generateLog(msg.chat.title || msg.chat.first_name, 'start', 'command', returns.testForGroup(msg.chat.first_name))
   mff.sendMessage(msg.chat.id, message.start, { parse_mode: 'markdown', reply_markup: generateButtons('start') })
}

exports.menu = async function(msg) {
   returns.generateLog(msg.chat.title || msg.chat.first_name, 'start', 'command', returns.testForGroup(msg.chat.first_name))
   mff.sendMessage(msg.chat.id, message.start, { parse_mode: 'markdown', reply_markup: generateButtons('start') })
}


function generateButtons(type) {
   switch (type) {
      case 'start':
         return {
            inline_keyboard: [
               [{ text: 'Start Countdown', callback_data: 'startcountdown' }, { text: 'Stop Countdown', callback_data: 'stopcountdown' }],
               [{ text: 'Commands', callback_data: 'commands' }]
            ]
         }
         break;
      case 'command':
         return {
            inline_keyboard: [
               [{ text: 'Home', callback_data: 'start' }, { text: 'Commands', callback_data: 'commands' }]
            ]
         }
         break;
      case 'commands':
         let tempArr = []
         for (let x in message.help) {
            tempArr.push([{ text: x, callback_data: message.help[x] }])
         }
         tempArr.push([{ text: 'Back to Menu', callback_data: 'start' }])
         return { inline_keyboard: tempArr }
   }
}

exports.answerKeyboard = async function answerKeyboard(item) {
  let command = item.data
  let chatId = item.message.chat.id
  let messageId = item.message.message_id
   returns.generateLog(item.message.chat.title || item.message.chat.first_name, item.data, 'command', returns.testForGroup(item.message.chat.first_name))

   if (command === 'start') {
      mff.editMessageText(message.start, { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('start') })
   }

   if (command === 'commands') {
      mff.editMessageText('Command list:', { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('commands') })
   }

   if (command === 'startcountdown') {
      let status = await startCountdown(item.message)
      if (status === 'Added') {
         mff.editMessageText(message.countdown.added, { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
         admin.sendMessage(message.connor, (item.message.chat.title || item.message.chat.first_name) + ' Subscribed!')
      }
      if (status === 'In') {
         mff.editMessageText('Im sorry you are already subscribed', { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
      }
   }

   if (command === 'stopcountdown') {
      let status = await stopCountdown(item.message)
      if (status === 'Removed') {
         mff.editMessageText(message.countdown.removed, { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
      }
      if (status === 'Not Here') {
         mff.editMessageText('Not found', { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
      }
   }

   if (command === 'info') {
      mff.editMessageText(message.info, { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
   }

   if (command === 'daysleft') {
      let day = days.untilMff()
      mff.editMessageText(`${day} days until MFF!`, { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
   }
   
}

async function startCountdown(msg) {
   try {
      let added = await db.add(msg.chat.id, msg.chat.title || msg.chat.first_name, returns.testForGroup(msg.chat.first_name))
      return added
   } catch (e) {
      returns.handleErr(e, null, 'Countdown')
   }
}

async function stopCountdown(msg) {
   try {
      let remove = await db.remove(msg.chat.id)
      return remove
   } catch (e) {
      returns.handleErr(e, msg.chat.id, 'Removing User', mff)
   }
}

exports.message = async function(msg) {
   if (msg.migrate_from_chat_id) {
      let lookup = await db.lookup('chatId', msg.migrate_from_chat_id)
      if (lookup[0]) {
         db.update({ chatId: msg.migrate_from_chat_id }, msg.migrate_to_chat_id)
      }
   }
}

exports.addedToGroup = async function(msg) {
   let getBot = await mff.getMe()
   let botId = getBot.id
   if (msg.new_chat_participant.id === botId) {
      mff.sendMessage(msg.chat.id, message.start, { parse_mode: 'markdown', reply_markup: generateButtons('start') })
   }
}

exports.countdown = function(msg) {
   mff.sendMessage(msg.chat.id, 'Old command, please use /menu for the main menu')
}

exports.stopCountdown = function(msg) {
   mff.sendMessage(msg.chat.id, 'Old command, please use /menu for the main menu')
}

exports.info = function(msg) {
   mff.sendMessage(msg.chat.id, 'Old command, please use /menu for the main menu')
}

exports.help = function(msg) {
   mff.sendMessage(msg.chat.id, 'Old command, please use /menu for the main menu')
}

exports.daysleft = function(msg) {
   mff.sendMessage(msg.chat.id, 'Old command, please use /menu for the main menu')
}
