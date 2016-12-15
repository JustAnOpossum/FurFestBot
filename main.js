#!/usr/bin/env node

'use strict'

const emoji = require('node-emoji')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const pic = require('./src/pic.js')
const token = fs.readFileSync('./private/telegramKey.txt', 'utf8')
const bot = new TelegramBot(token, {
    webHook: {
        port: 8000,
        key: __dirname + '/keys/key.pem',
        cert: __dirname + '/keys/crt.pem'
    }
})
const days = require('./src/days.js')
const db = require('./src/dbcontroller.js')
const Nano = require('nanotimer')
const timer = new Nano()
const delayForTime = new Nano()
const request = require('request')
const airports = require('./src/airport.js')
const returns = require('./src/returns.js')
const log = require('./src/logController.js')

const start = 'The bot is currently not counting down since MFF 2016 just happened. I will probably start it up 150 days before? IDK yet. If you want to add your name into the countdown use /countdown'
const help = 'ೕ(･ㅂ･ )'
const info = '(ᵔᴥᵔ)'
let timeDrift = true

bot.setWebHook('telegram.thetechiefox.com/bot' + token, __dirname + '/keys/crt.pem')

bot.on('new_chat_participant', function(msg) {
    if (msg.new_chat_participant.id === 185002901) {
        bot.sendMessage(msg.chat.id, start, {
            parse_mode: 'markdown'
        })
    }
})
bot.on('msg', function(msg) {
    if (msg.migrate_from_chat_id) {
        db.lookup('chatId', msg.migrate_from_chat_id).then(function(found) {
            if (found[0]) {
                db.update(found[0], 'chatId', msg.migrate_to_chat_id, 'finding', 'tag', 'name', found[0].name, 'group', 'true').then(console.log('Supergroup' + msg.chat.title + 'Updated'))
            }
        })
    }
})



bot.onText(/\/start/, function(msg, match) {
    if (msg.chat.title) {
        log.command('Group: ' + msg.chat.title + ' Used command /start')
    } else {
        log.command(msg.chat.first_name + ' Used command /start')
    }
    bot.sendMessage(msg.chat.id, start, {
        parse_mode: 'markdown'
    })
})

bot.onText(/\/countdown/, function(msg, match) {
    if (msg.chat.title) {
        log.command('Group ' + msg.chat.title + ' Used command /countdown')
    } else {
        log.command(msg.chat.first_name + ' Used command /countdown')
    }
    if (!msg.chat.title) {
        db.add(msg.chat.id, msg.chat.first_name, false).then(function(input) {
            if (input === 'Added') {
                bot.sendMessage(msg.chat.id, 'Added to countdown list for whenever I start it back up').then(bot.sendMessage('119682002', msg.chat.first_name + ' Subscribed!'))
            }
            if (input === 'In') {
                bot.sendMessage(msg.chat.id, 'Your already here')
            }
        })
    } else {
        db.add(msg.chat.id, msg.chat.title, true).then(function(input) {
            if (input === 'Added') {
                bot.sendMessage(msg.chat.id, 'Added to countdown list for whenever I start it back up').then(bot.sendMessage('119682002', msg.chat.title + ' Subscribed!'))
            }
            if (input === 'In') {
                bot.sendMessage(msg.chat.id, 'Im sorry you are already subscribed')
            }
        })
    }
})


bot.onText(/\/info/, function(msg, match) {
    if (msg.chat.title != undefined) {
        log.command('Group ' + msg.chat.title + ' Used command /info')
    } else {
        log.command(msg.chat.first_name + ' Used command /info')
    }
    bot.sendMessage(msg.chat.id, info)
})


bot.onText(/\/stopcountdown/, function(msg, match) {
    if (msg.chat.title != undefined) {
        log.command('Group ' + msg.chat.title + ' Used command /stopcountdown')
    } else {
        log.command(msg.chat.first_name + ' Used command /stopcountdown')
    }
    db.remove(msg.chat.id).then(function(done) {
        if (done === 'Removed') {
            bot.sendMessage(msg.chat.id, 'Unscribed form daily countdown')
        }
        if (done === 'Not Here') {
            bot.sendMessage(msg.chat.id, 'Already removed')
        }
    })
})

bot.onText(/\/daysleft/, function(msg, match) {
    if (msg.chat.title != undefined) {
        log.command('Group ' + msg.chat.title + ' Used command /daysleft')
    } else {
        log.command(msg.chat.first_name + ' Used command /daysleft')
    }
    days.untilMff().then(function(day) {
        bot.sendMessage(msg.chat.id, day + ' Days until MFF')
    })

})


bot.onText(/\/help/, function(msg, match) {
    if (msg.chat.title) {
        log.command('Group ' + msg.chat.title + ' Used command /help')
    } else {
        log.command(msg.chat.first_name + ' Used command /help')
    }
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


function sendDaily() {
    days.untilMff().then(function(days) {
        if (days > !1) {
            db.lookup('finding', 'tag')
                .then(function(users) {
                    pic.pickImage().then(function(buffer) {
                        for (let n in users) {
                            bot.sendPhoto(users[n].chatId, buffer, {
                                caption: returns.emojiParser(days) + ' MFF!! ' + returns.randomEmoji()
                            }).then(function(info) {
                                if (users[n].group === false) {
                                    log.daily('Message Sent To: ' + info.chat.first_name)
                                } else {
                                    log.daily('Message Sent To: ' + info.chat.title)
                                }
                            }).catch(function(err) {
                                if (err) {
                                    db.error(users[n])
                                }
                            })
                        }
                    })
                })
        }
    })
}


bot.onText(/\/broadcast (.+)/, function(msg, match) {
    if (msg.chat.id === 119682002) {
        db.lookup('finding', 'tag').then(users => {
            users.forEach(id => {
                bot.sendMessage(id.chatId, match[1], {
                    parse_mode: 'Markdown'
                })
            })
        })
    }
})

bot.onText(/\/test (.+)/, function(msg, match) {
    if (msg.chat.id === 119682002) {
        bot.sendMessage(119682002, match[1], {
            parse_mode: 'Markdown'
        })
    }
})


/**

bot.on('inline_query', function(msg) {
    let testForCode = /^.../
    if (testForCode.test(msg.query) === true) {
        request('https://services.faa.gov/airport/status/' + msg.query + '?format=json', {
            method: 'HEAD',
	    rejectUnauthorized: false
        }, function(err, res, good2) {
            if (res.statusCode === 200) {
                request('https://services.faa.gov/airport/status/' + msg.query + '?format=json', function(err, res, good) {
                    let shouldCheck = JSON.parse(good)
                    if (shouldCheck.delay === 'false') {
                        bot.answerInlineQuery(msg.id, [{
                            type: 'article',
                            id: Math.random().toString().slice(0, 35),
                            title: shouldCheck.IATA + ': No Delay',
                            input_message_content: {
                                message_text: 'No Delay'
                            }
                        }])
                    } else {
                        bot.answerInlineQuery(msg.id, [{
                            type: 'article',
                            id: Math.random().toString().slice(0, 35),
                            title: shouldCheck.IATA + ': Delay! Click here for more info',
                            input_message_content: {
                                message_text: returns.delayCalc(shouldCheck)
                            }
                        }])
                    }
                })
            }
        })
    }
})

bot.onText(/\/airport (.+)/, function(msg, match) {
    if (msg.chat.title) {
        log.command('Group ' + msg.chat.title + ' Used command /airport')
    } else {
        log.command(msg.chat.first_name + ' Used command /airport')
    }
    request('https://services.faa.gov/airport/status/' + match[1] + '?format=json', {
        method: 'HEAD',
	rejectUnauthorized: false
    }, function(err, res, checkCode) {
        if (res.statusCode === 200) {
            db.newMonitor(msg.chat.id, match[1]).then(function(input) {
                if (input === 'Added') {
                    let user = {
                        id: msg.chat.id,
                        airport: match[1],
                    }
                    bot.sendMessage(msg.from.id, 'Notified for reminders')
                    airports.getInitialUpdate(user.id, user.airport)
                }
                if (input === 'In') {
                    bot.sendMessage(msg.from.id, 'Im sorry you are already being notified')
                }
            })
        } else {
            bot.sendMessage(msg.from.id, 'Wrong airport code, please try again.')
        }
    })
})

bot.onText(/\/stopairport (.+)/, function(msg, match) {
    if (msg.chat.title) {
        log.command('Group ' + msg.chat.title + ' Used command /stopairport')
    } else {
        log.command(msg.chat.first_name + ' Used command /stopairport')
    }
    let user = {
        id: msg.chat.id,
        airport: match[1],
    }
    db.removeMonitor(user.id, user.airport).then(res => {
        if (res === 'removed') {
            db.shouldSend(user, null, 'remove')
            bot.sendMessage(msg.chat.id, 'Monitor Removed')
        }
        if (res === 'not') {
            bot.sendMessage(msg.chat.id, 'Sorry not found')
        }
    })
})

function checkDelays() {
    db.shouldSend({}, null, 'find').then(function(data) {
        for (let i in data) {
            airports.checkDelays(data[i].airport, data[i].id).then(string => {
                if (string != 'no update') {
                    bot.sendMessage(data[i].id, string, {
                        parse_mode: 'markdown'
                    })
                }
            })
        }
    })
}
**/
