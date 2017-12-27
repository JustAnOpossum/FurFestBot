const Promise = require('bluebird')
const online = require('is-reachable')
const process = require('process')
const fs = Promise.promisifyAll(require('fs-extra'))
const db = require('./src/dbcontroller')
const pic = require('./src/pic.js')
const log = require('./src/logController.js')
const returns = require('./src/returns.js')
const days = require('./src/days.js')
const mff = require('./src/bots.js').mff

async function sendDaily() {
	let totalPics = (await fs.readdirAsync('./mff')).length
	let mffDay = days.untilMff()
	if (mffDay >= 1) {
		let returned = await pic.genImage()
		let captionString = `${returns.emojiParser(mffDay)} \n\n📸: ${returned.credit}`
		let users = await db.find({}, 'users')
		let photoId
		for (let x in users) {
			try {
				let sent = await mff.sendPhoto(users[x].chatId, (photoId || returned.buffer), { caption: captionString })
				photoId = sent.photo[(sent.photo.length - 1)].file_id
				returns.generateLog((sent.chat.first_name || sent.chat.title), null, 'daily')
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
		}, 3000)
	}
})