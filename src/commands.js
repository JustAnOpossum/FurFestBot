const Promise = require('bluebird')
const empty = require('is-empty')
const path = require('path')
const bot = require('./bots.js').bot
const admin = require('./bots.js').admin
const returns = require('./returns.js')
const days = require('./days.js')
const fs = Promise.promisifyAll(require('fs-extra'))
const db = require('./dbcontroller.js')
const message = require('./message.js')

async function menu(msg) {
	returns.generateLog(msg.chat.title || msg.chat.first_name, 'start', 'command', returns.testForGroup(msg.chat.first_name))
	bot.sendMessage(msg.chat.id, message.start, { parse_mode: 'markdown', reply_markup: generateButtons('start', await db.find({ chatId: msg.chat.id }, 'users')) })
}


function generateButtons(type, buttonChoice) { //This creates buttons for the menu, add to the switch for custom menu
	switch (type) {
		case 'start':
			let countdownText = []
			if (empty(buttonChoice)) {
				countdownText.push({ text: 'Start Countdown', callback_data: 'startcountdown' })
			} else {
				countdownText.push({ text: 'Stop Countdown', callback_data: 'stopcountdown' })
			}
			return {
				inline_keyboard: [
					countdownText,
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
			tempArr.push([{ text: 'Back to Home', callback_data: 'start' }])
			return { inline_keyboard: tempArr }
	}
}

async function answerKeyboard(item) { //This answers the request for keyboard, called on response
	let command = item.data
	let chatId = item.message.chat.id
	let messageId = item.message.message_id
	let type = item.message.chat.type
	let userId = item.from.id
	returns.generateLog(item.message.chat.title || item.message.chat.first_name, item.data, 'command')

	async function checkForAdmin() {
		let admins = await bot.getChatAdministrators(chatId)
		for (let i in admins) {
			if (admins[i].user.id === userId) {
				return true
			}
		}
		return false
	}

	if (command === 'start') {
		bot.editMessageText(message.start, { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('start', await db.find({ chatId: chatId }, 'users')) })
	}

	if (command === 'commands') {
		bot.editMessageText('Command list:', { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('commands') })
	}

	if (command === 'startcountdown') {
		sendCountdownReply('start')
	}

	if (command === 'stopcountdown') {
		sendCountdownReply('stop')
	}

	async function sendCountdownReply(countdownType) { //Logic to handle both countdown options
		if (type != 'supergroup' || (type === 'supergroup' && await checkForAdmin())) {
			let status
			if (countdownType === 'start') {
				status = await startCountdown(item.message)
			}
			if (countdownType === 'stop') {
				status = await stopCountdown(item.message)
			}
			if (status) {
				bot.editMessageText(message.countdown[countdownType], { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
				if (countdownType === 'start') {
					admin.sendMessage(message.owner, (item.message.chat.title || item.message.chat.first_name) + ' Subscribed!')
				}
			} else {
				bot.editMessageText(message.countdown.else[countdownType], { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
			}
		} else {
			bot.editMessageText('Im sorry, only an admin can start or stop countdown.', { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
		}
	}

	if (command === 'info') {
		bot.editMessageText(message.info, { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
	}

	if (command === 'daysleft') {
		let day = days.until()
		bot.editMessageText(`${day} days until ${message.con}`, { chat_id: chatId, message_id: messageId, reply_markup: generateButtons('command') })
	}
}

async function startCountdown(msg) { //Logic for starting countdown
	try {
		let addToDb = await db.add({ name: (msg.chat.id, msg.chat.title || msg.chat.first_name), chatId: msg.chat.id, group: returns.testForGroup(msg.chat.first_name) }, 'users')
		if (addToDb) {
			return true
		} else {
			return false
		}
	} catch (e) {
		returns.handleErr(e, 'start countdown')
	}
}

async function stopCountdown(msg) { //Logic for stopping countdown
	try {
		let removeUser = await db.remove({ chatId: msg.chat.id }, 'users')
		if (removeUser) {
			return true
		} else {
			return false
		}

	} catch (e) {
		returns.handleErr(e, 'stop countdown')
	}
}

async function onMessage(msg) {
	if (msg.migrate_from_chat_id) {
		let lookup = await db.find({ chatId: msg.migrate_from_chat_id }, 'users')
		if (lookup[0]) {
			db.update({ chatId: msg.migrate_from_chat_id }, { chatId: msg.chat.id }, 'users')
		}
	}
}

async function addedToGroup(msg) {
	let botId = (await bot.getMe()).id
	if (msg.new_chat_participant.id === botId) {
		bot.sendMessage(msg.chat.id, message.start, { parse_mode: 'markdown', reply_markup: generateButtons('start') })
	}
}

function old(msg) {
	bot.sendMessage(msg.chat.id, 'Old command, please use /menu for the main menu')
}

module.exports = {
	addedToGroup: addedToGroup,
	message: onMessage,
	menu: menu,
	countdown: old,
	stopCountdown: old,
	info: old,
	help: old,
	daysleft: old,
	answerKeyboard: answerKeyboard
}

setTimeout(() => {returns.handleErr(new Error(), 'testing')}, 2000)