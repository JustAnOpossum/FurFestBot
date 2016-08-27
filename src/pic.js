'use strict'

const path = require('path')
const gm = require('gm')
const fs = require('fs')
const num = require('./urls.js')
const RandomOrg = require('random-org')
const days = require('./days.js')
const random = new RandomOrg({
    apiKey: fs.readFileSync(path.join(__dirname, "../private/randomkey.txt"), 'utf8').toString()
})
const log = require('./logController.js')

exports.pickImage = function() {
    return new Promise(function(res, rej) {
        let randNum
        random.generateIntegers({
                min: 1,
                max: 1181,
                n: 1
            })
            .then(function(result) {
                randNum = result.random.data[0]
                findSize()
            });

        function findSize() {
            gm(num.pics[randNum]).size(function(err, num) {
                if (!err) {
                    writeImage(num.width, num.height)
                } else {
                    console.log(err)
                }
            })
        }

        function writeImage(width, height) {
            days.untilMff().then(function(day) {
              let dayStr
              if (day === 1) {
                dayStr = 'Tomorrow Is\nMFF!'
              }
              else {
                dayStr = day + ' days\nuntil MFF!'
              }
                let random1 = Math.floor(Math.random() * 255)
                let random2 = Math.floor(Math.random() * 255)
                let random3 = Math.floor(Math.random() * 255)
                gm(num.pics[randNum])
                    .fill('rgb(' + random1.toString() + ', ' + random2.toString() + ', ' + random3.toString() + ')')
                    .drawText(width / 6, height / 3, dayStr)
                    .font(path.join(__dirname, "../fonts/swag.ttf"))
                    .fontSize(width / 5)
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
