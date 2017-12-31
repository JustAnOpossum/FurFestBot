'use strict'

const Promise = require('bluebird')
const path = require('path')
const gm = require('gm')
const fs = Promise.promisifyAll(require('fs-extra'))
const color = require('node-vibrant')
const days = require('./days.js')
const log = require('./logController.js')
const returns = require('./returns.js')
const db = require('./dbcontroller.js')


const genImage = function () {
	return new Promise(async (res, rej) => {
		let mffpics = await fs.readdirAsync(path.join(__dirname, '../mff'))
		let randNum

		function findImage() {
			randNum = Math.floor(Math.random() * mffpics.length)
			if (path.parse(mffpics[randNum]).ext === '.jpg') {
				gm(path.join(__dirname, '../mff/' + mffpics[randNum])).size((err, num) => {
					if (!err) {
						color.from(path.join(__dirname, ('../mff/' + mffpics[randNum]))).getPalette((err, palette) => {
							if (!err) {
								writeImage(num.width, num.height, palette.Vibrant._rgb)
							} else {
								rej(err)
							}
						})
					} else {
						rej(err)
					}
				})
			}
		}
		findImage()

		function writeImage(width, height, palette) {
			let day =  days.untilMff()
			let textW
			let textH
			//Larger Number moves it to the left, Smaller moves it down
			let daypos = {
				3: {
					landscape: [4.2, 1.68],
					portrait: [4.4, 1.8]
				},
				2: {
					landscape: [3.2, 1.68],
					portrait: [3.1, 1.8]
				},
				1: {
					landscape: [2.4, 1.68],
					portrait: [2.4, 1.8]
				}
			}
			let determinePosition = day.toString().length
			if (width > height) {
				textW = width / daypos[determinePosition].landscape[0]
				textH = height / daypos[determinePosition].landscape[1]
			} else {
				textW = width / daypos[determinePosition].portrait[0]
				textH = height / daypos[determinePosition].portrait[1]
			}
			let textColor = `rgb(${palette[0]}, ${palette[1]}, ${palette[2]})`
			gm(path.join(__dirname, '../mff/' + mffpics[randNum]))
				.fill(textColor)
				.drawText(textW, textH, day)
				.font(path.join(__dirname, '../fonts/Notes.ttf'))
				.fontSize(width / 4.5) //Smaller number makes it larger
				.write(path.join(__dirname, '../countdown/' + day.toString() + '.jpg'), (err) => {
					if (!err) {
						log.picture('Day ' + day + ' Generated')
						let file = fs.readFile(path.join(__dirname, '../countdown/' + day + '.jpg'), (err, data) => {
							if (!err) {
								db.find({photo:mffpics[randNum]}, 'credit').then(credit => {
									res({
										buffer: data,
										credit: credit[0].url
									})
								})
							} else {
								rej(err)
							}
						})
					}
				})
		}
	})
}

exports.genImage = genImage
