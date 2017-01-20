'use strict'

const path = require('path')
const gm = require('gm')
const fs = require('fs')
const days = require('./days.js')
const log = require('./logController.js')
const returns = require('./returns.js')
const db = require('./dbcontroller.js')


const pickImage = function() {
    return new Promise((res, rej) => {
        let randNum
        let mffArr
        fs.readdir(path.join(__dirname, '../mff'), (err, mffpics) => {
            mffArr = mffpics
            if (!err) {
                function checkData() {
                    randNum = Math.floor(Math.random() * mffpics.length)
                    db.searchPic(mffpics[randNum]).then(data => {
                        if (data[0]) {
                            checkData()
                        } else {
                            db.addPic(mffpics[randNum])
                            findSize()
                        }
                    })
                }
                checkData()
            }
        })

        function findSize() {
            gm(path.join(__dirname, '../mff/' + mffArr[randNum])).size((err, num) => {
                if (!err) {
                    writeImage(num.width, num.height)
                } else {
                    rej(err)
                }
            })
        }

        function writeImage(width, height) {
            let day = days.untilMff()
            let textW
            let textH
                //Larger Number moves it to the left
            let daypos = {
                3: {
                    landscape: [4.5, 1.8],
                    portrait: [4.4, 2]
                },
                2: {
                    landscape: [3.2, 1.8],
                    portrait: [3.1, 2]
                },
                1: {
                    landscape: [2.4, 1.8],
                    portrait: [2.4, 2]
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
            gm(path.join(__dirname, '../mff/' + mffArr[randNum]))
                .fill('rgb(' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ',' + Math.floor(Math.random() * 255) + ')')
                .drawText(textW, textH, day)
                .font(path.join(__dirname, "../fonts/font.ttf"))
                .fontSize(width / 7)
                .write(path.join(__dirname, "../Countdown/" + day.toString() + '.jpg'), (err) => {
                    if (!err) {
                        log.picture('Day ' + day + ' Generated')
                        let file = fs.readFile(path.join(__dirname, "../Countdown/" + day + '.jpg'), (err, data) => {
                            if (!err) {
                                db.findCredit(mffArr[randNum]).then(credit => {
                                    res({
                                        buffer: data,
                                        credit: credit[0].credit
                                    })
                                })
                            } else {
                                console.log(err)
                                rej(err)
                            }
                        })
                    }
                })
        }
    })
}

exports.pickImage = pickImage
