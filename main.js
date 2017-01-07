#!/usr/bin/env node

'use strict'

let bot
const process = require('process')
const emoji = require('node-emoji')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const pic = require('./src/pic.js')
let token = process.env.TOKEN

let mode = process.env.TYPE
if (mode === 'test') {
    bot = new TelegramBot(token, {
        polling: true
    })
}
if (mode === 'production') {
    bot = new TelegramBot(token, {
        webHook: {
            port: 8000,
            key: __dirname + '/keys/key.pem',
            cert: __dirname + '/keys/crt.pem'
        }
    })
    bot.setWebHook('telegram.thetechiefox.com/bot' + token, __dirname + '/keys/crt.pem')
}

const days = require('./src/days.js')
const db = require('./src/dbcontroller.js')
const Nano = require('nanotimer')
const timer = new Nano()
const delayForTime = new Nano()
const request = require('request')
const returns = require('./src/returns.js')
const log = require('./src/logController.js')

const start = 'The bot is currently not counting down since MFF 2016 just happened. Going to start it about day 250. If you want to add your name into the countdown use /countdown'
const help = '/countdown - Adds you to countdown list\n /stopcountdown - Stops countdown \n/credit - Credit for the pictures I use in the countdown'
const info = 'Im a fox'
let timeDrift = true

bot.on('new_chat_participant', function(msg) {
    if (msg.new_chat_participant.id === 185002901) {
        bot.sendMessage(msg.chat.id, start, {
            parse_mode: 'markdown'
        })
    }
})

bot.on('message', function(msg) {
    if (msg.migrate_from_chat_id) {
        db.lookup('chatId', msg.migrate_from_chat_id).then(function(found) {
                if (found[0]) {
                    db.update({
                        chatId: msg.migrate_from_chat_id
                    }, msg.migrate_to_chat_id).then(console.log('Supergroup' + msg.chat.title + 'Updated'))
                }
            })
            .catch(err => {
                handleErr(err, msg.chat.id, 'Supergroup Change')
            })
    }
})


bot.onText(/\/start/, function(msg, match) {
    generateLog(msg.chat.title || msg.chat.first_name, 'start', 'command', testForGroup(msg.chat.first_name))
    bot.sendMessage(msg.chat.id, start, {
        parse_mode: 'markdown'
    })
})

bot.onText(/\/countdown/, function(msg, match) {
    generateLog(msg.chat.title || msg.chat.first_name, 'countdown', 'command', testForGroup(msg.chat.first_name))
    db.add(msg.chat.id, msg.chat.title || msg.chat.first_name, testForGroup(msg.chat.first_name)).then(function(input) {
            if (input === 'Added') {
                bot.sendMessage(msg.chat.id, 'Added to countdown list for whenever I start it back up').then(bot.sendMessage('119682002', msg.chat.title || msg.chat.first_name + ' Subscribed!'))
                    .catch(err => {
                        handleErr(err, msg.chat.id, 'Add To Countdown')
                    })
            }
            if (input === 'In') {
                bot.sendMessage(msg.chat.id, 'Im sorry you are already subscribed')
            }
        })
        .catch(err => {
            handleErr(err, null, 'Add To Countdown')
        })
})


bot.onText(/\/info/, function(msg, match) {
    generateLog(msg.chat.title || msg.chat.first_name, 'info', 'command', testForGroup(msg.chat.first_name))
    bot.sendMessage(msg.chat.id, info)
})


bot.onText(/\/stopcountdown/, function(msg, match) {
    generateLog(msg.chat.title || msg.chat.first_name, 'stopcountdown', 'command', testForGroup(msg.chat.first_name))
    db.remove(msg.chat.id).then(function(done) {
            if (done === 'Removed') {
                bot.sendMessage(msg.chat.id, 'Unscribed form daily countdown')
            }
            if (done === 'Not Here') {
                bot.sendMessage(msg.chat.id, 'Already removed')
            }
        })
        .catch(err => {
            handleErr(err, msg.chat.id, 'Removing User')
        })
})

bot.onText(/\/daysleft/, function(msg, match) {
    generateLog(msg.chat.title || msg.chat.first_name, 'daysleft', 'command', testForGroup(msg.chat.first_name))
    days.untilMff().then(function(day) {
            bot.sendMessage(msg.chat.id, day + ' Days until MFF')
        })
        .catch(err => {
            handleErr(err, null, 'Getting Days')
        })

})


bot.onText(/\/help/, function(msg, match) {
    generateLog(msg.chat.title || msg.chat.first_name, 'help', 'command', testForGroup(msg.chat.first_name))
    bot.sendMessage(msg.chat.id, help)
})



bot.onText(/\/debug/, function(msg, match) {
    if (msg.chat.id === 119682002) {
        sendDaily()
    }
})

//timer.setInterval(checkTime, '', '60s')

function checkTime() {
    let date = new Date()
    let hour = date.getHours()
    let minute = date.getMinutes()
    if (hour === 10 && minute === 0 || hour === 10 && minute === 1 && timeDrift === true) {
        sendDaily()
        timeDrift = false
        delayForTime.setTimeout(function() {
            timeDrift = true
        }, '', '240s')
    }
}
sendDaily()


function sendDaily() {
    fs.writeFileSync(__dirname + '/backups/countdown ' + new Date().toDateString() + '.db', fs.readFileSync(__dirname + '/databases/countdown.db'))
    let attempt = 0
    let photoId
    days.untilMff().then(function(days) {
            if (days > !1) {
                db.lookup({})
                    .then(function(users) {
                        pic.pickImage().then(function(returned) {
                          let captionString = returns.emojiParser(days) + ' MFF!! ' + returns.randomEmoji() + '\n\n📸: ' + returned.credit
                                function getPhotoId(num) {
                                    bot.sendPhoto(users[num].chatId, returned.buffer, {
                                        caption: captionString
                                    }).then(function(info) {
                                        photoId = info.photo[info.photo.length - 1].file_id
                                        if (attempt === 0) {
                                            users.splice(attempt, attempt + 1)
                                        } else {
                                            users.splice(attempt, attempt)
                                        }
                                        gotPhotoId()
                                        generateLog(info.chat.first_name, null, 'daily')
                                    }).catch(function(err) {
                                        if (err) {
                                            db.error(users[num])
                                            users.splice(attempt, attempt)
                                            attempt += 1
                                            getPhotoId(attempt)
                                        }
                                    })
                                }

                                function gotPhotoId() {
                                    users.forEach(user => {
                                        bot.sendPhoto(user.chatId, photoId, {
                                            caption: captionString
                                        }).then(function(info) {
                                            generateLog(info.chat.first_name, null, 'daily')
                                        }).catch(function(err) {
                                            if (err) {
                                                db.error(user)
                                            }
                                        })
                                    })
                                }
                                getPhotoId(attempt)
                            })
                            .catch(err => {
                                handleErr(err, null, 'Generating Image')
                            })
                    })
                    .catch(err => {
                        handleErr(err, null, 'Send Daily DB Lookup')
                    })
            }
        })
        .catch(err => {
            handleErr(err, null, 'Getting Days')
        })
}


bot.onText(/\/broadcast (.+)/, function(msg, match) {
    if (msg.chat.id === 119682002) {
        db.lookup({}).then(users => {
            users.forEach(id => {
                bot.sendMessage(id.chatId, match[1], {
                    parse_mode: 'Markdown'
                })
            })
        })
    }
})

bot.onText(/\/addPhoto (.+)/, function(msg, match) {
    if (msg.chat.id === 119682002) {

    }
})

bot.onText(/\/test (.+)/, function(msg, match) {
    if (msg.chat.id === 119682002) {
        bot.sendMessage(119682002, match[1], {
            parse_mode: 'Markdown'
        })
    }
})

function generateLog(name, command, type, group) {
    if (type === 'command') {
        if (group === true) {
            log.command('Group: ' + name + ' Used command /' + command)
        } else {
            log.command(name + ' Used command /' + command)
        }
    }
    if (type === 'daily') {
        log.daily('Sent to ' + name)
    }
}

function testForGroup(input) {
    if (!input) {
        return true
    } else {
        return false
    }
}

function handleErr(error, user, command) {
    if (user) {
        bot.sendMessage(119682002, 'An error has occured in ' + command)
        bot.sendMessage(user, 'Im sorry an error has occured.')
    } else {
        bot.sendMessage(119682002, 'An error has occured in ' + command)
    }
}


/**var prompt = require('prompt');
var count = 0
fs.readdir('mff', function(err, list){
  prompt2()
  function prompt2(photo) {
    prompt.start()
    prompt.get([list[count]], function (err, result) {
      db.addCredit(result[list[count]], list[count])
      count += 1
      prompt2(list[count])
    })
  }
})
**/
