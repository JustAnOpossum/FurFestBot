const Promise = require('bluebird')
const online = require('is-reachable')
const process = require('process')
const fs = Promise.promisifyAll(require('fs-extra'))
const debug = require('debug')('cron')
const db = require('./src/dbcontroller')
const pic = require('./src/pic.js')
const log = require('./src/logController.js')
const returns = require('./src/returns.js')
const days = require('./src/days.js')
const bot = require('./src/bots.js').bot

async function sendDaily() {
	let totalPics = (await fs.readdirAsync('./pics')).length
	let day = days.until()
	if (day >= 1) {
		let returned = await pic.genImage()
		let captionString = `${returns.createCaption(day)} \n\n📸: ${returned.credit}`
		let users = await db.find({}, 'users')
		debug('Got photo')
		let photoId
		for (let x in users) {
			try {
				let sent = await bot.sendPhoto(users[x].chatId, (photoId || returned.buffer), { caption: captionString }, {contentType: 'image/jpeg'})
				photoId = sent.photo[(sent.photo.length - 1)].file_id
				returns.generateLog((sent.chat.first_name || sent.chat.title), null, 'daily')
				debug('Sent image')
			} catch (e) {
				if (e.response.body.error_code === 403) {
					db.remove(users[x], 'users')
				}
			}
		}
		process.exit(0)
	}
}

online('https://api.telegram.org').then(status => {
	if(status) {
		sendDaily()
	} else {
		let waitForOnline = setInterval(async () => {
			if (await online('https://api.telegram.org')) {
				clearInterval(waitForOnline)
				sendDaily()
			}
		}, 60000)
	}
})