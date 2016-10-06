'use strict'

const path = require('path')
const gm = require('gm')
const fs = require('fs')
const RandomOrg = require('random-org')
const days = require('./days.js')
const log = require('./logController.js')
const source = require('./picturesLinks.js')
const returns = require('./returns.js')


exports.pickImage = function() {
    return new Promise(function(res, rej) {
        let randNum = Math.floor(Math.random() * source.pics.length)
        findSize()

        function findSize() {
            gm(path.join(__dirname, '../' + source.pics[randNum])).size(function(err, num) {
                if (!err) {
                    writeImage(num.width, num.height)
                } else {
                    console.log(err)
                }
            })
        }

        function writeImage(width, height) {
            days.untilMff().then(function(day) {
                let emojiDay = day.toString().split('')
                let emojiDiff
                if (height > width) {
                    emojiDiff = [4, 3, 2, 3]
                } else {
                    emojiDiff = [3, 2.9, 2, 2.9]
                }
                gm(path.join(__dirname, '../' + source.pics[randNum]))
                    .draw(['image Over ' + width / emojiDiff[0] + ',' + height / emojiDiff[1] + ' 0,0 ' + path.join(__dirname, '../emoji/num/') + emojiDay[0] + '.png'])
                    .draw(['image Over  ' + width / emojiDiff[2] + ',' + height / emojiDiff[3] + ',0,0 ' + path.join(__dirname, '../emoji/num/') + emojiDay[1] + '.png'])
                    .write(path.join(__dirname, "../Countdown/" + day.toString() + '.jpg'), function(err) {
                        if (!err) {
                            log.picture('Day ' + day + ' Generated')
                            let file = fs.readFile(path.join(__dirname, "../Countdown/" + day + '.jpg'), function(err, data) {
                                if (!err) {
                                    res(data)
                                } else {
                                    rej(err)
                                }
                            })
                        }
                    })
            })
        }
    })
}
