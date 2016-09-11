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

const start = 'Use /countdown to start the MFF countdown!\nUse /airport and a airport code to get notifications about airport conditions before MFF\nBot made by @ConnorTheFox.\n\nUse /help for command info.'
const help = 'Normal Commands:\n/countdown: Subscribes you do a daily reminder of how many days until MFF.\n/stopcountdown: Unsubscribes you from the daily countdown.\n/airport (code): Put in airport code and a couple days before the bot will monitor it for delays.\n/stopairport (code): Use this command to delete the monitor\n/info: Gives information about the techinial side of the bot.\n/daysleft: Tells you how many days are left.\n/howfar: Send the bot a location and it will map it and tell you how long it will take to get there by driving\n\nInline Queries: COMMING SOON'
const info = 'Information about this bot:\nIt is coded in node.js\nIf you want to view the code goto https://github.com/ConnorTheFox/FurFestBot\nI made this bot because im hyped about MFF'
let timeDrift = true

bot.setWebHook('telegram.thetechiefox.com/bot' + token, __dirname + '/keys/crt.pem')

bot.on('new_chat_participant', function(msg) {
        if (msg.new_chat_participant.id === 185002901) {
            bot.sendMessage(msg.chat.id, start, {parse_mode: 'markdown'})
        }
})
bot.on('msg', function(msg){
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
    bot.sendMessage(msg.chat.id, start, {parse_mode: 'markdown'})
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
                bot.sendMessage(msg.chat.id, 'You have subscibed to the daily reminder.\nTimes:\nPST: 9AM\nMST: 10AM\nCST: 11AM\nEST: 12PM').then(bot.sendMessage('119682002', msg.chat.first_name + ' Subscribed!'))
            }
            if (input === 'In') {
                bot.sendMessage(msg.chat.id, 'Im sorry you are already subscribed')
            }
        })
    } else {
        db.add(msg.chat.id, msg.chat.title, true).then(function(input) {
            if (input === 'Added') {
                bot.sendMessage(msg.chat.id, 'You have subscibed to the daily reminder.\nTimes:\nPST: 9AM\nMST: 10AM\nCST: 11AM\nEST: 12PM').then(bot.sendMessage('119682002', msg.chat.title + ' Subscribed!'))
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

bot.onText(/\/howfar/, function(msg, match) {
    if (msg.chat.title) {
        log.command('Group ' + msg.chat.title + ' Used command /howfar')
    } else {
        log.command(msg.chat.first_name + ' Used command /howfar')
    }
    let info = {
        user: msg.chat.id,
        looking: 'location'
    }
    db.map(info, 'check').then(function(data) {
        if (data === 'added user') {
            bot.sendMessage(msg.chat.id, 'Please send location using Telegrams mobile app. Type /cancel to cancel command')
        }
    })
})

bot.onText(/\/cancel/, function(msg, match) {
    let info = {
        user: msg.chat.id,
        looking: 'location'
    }
    db.map(info, 'delete').then(function(data) {
        if (data === 'removed') {
            bot.sendMessage(msg.chat.id, 'Canceled Command')
        }
        if (data === 'not there') {
            bot.sendMessage(msg.chat.id, 'No Command')
        }
    })
})

bot.on('location', function(loc) {
    let info = {
        user: loc.chat.id,
        looking: 'location'
    }
    db.map(info, 'check', 'location').then(function(fromdb) {
        if (fromdb != 'ready for loc') {
            bot.sendMessage(loc.chat.id, 'Use /howfar')
        }
        if (fromdb === 'ready for loc') {
            let mapGen = {
                lat: loc.location.latitude,
                lon: loc.location.longitude
            }
            let random = Math.floor(Math.random() * 10)
            let colors = ['black', 'brown', 'green', 'purple', 'yellow', 'blue', 'gray', 'orange', 'red']
            let url = 'https://maps.googleapis.com/maps/api/staticmap?center=' + mapGen.lat + ',' + mapGen.lon + '&size=600x300&scale=2&markers=color:' + colors[random] + '|size:small|' + mapGen.lat + ',' + mapGen.lon + '|rosemont&key=' + fs.readFileSync('./private/google.txt')
            let directions = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + mapGen.lat + ',' + mapGen.lon + '&destinations=rosemont&units=imperial&key=' + fs.readFileSync('./private/google.txt')
            request(url, {
                encoding: null
            }, function(err, res, map) {
                request(directions, function(error, response, final) {
                    let time = JSON.parse(final)
                    if (time.rows[0].elements[0].status === 'OK') {
                        bot.sendPhoto(loc.chat.id, map, {
                            caption: 'Distance: ' + time.rows[0].elements[0].distance.text + '\nTravel Time: ' + time.rows[0].elements[0].duration.text
                        })
                        db.map(info, 'delete')
                    } else {
                        bot.sendMessage(loc.chat.id, 'Error: No route to Rosemont IL')
                    }
                })
            })
        }
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

bot.on('inline_query', function(msg) {
  let testForCode = /^.../
  if (testForCode.test(msg.query) === true) {
    request('https://services.faa.gov/airport/status/' + msg.query + '?format=json', {method: 'HEAD'},  function(err, res, good2){
      if (res.statusCode != 404) {
        request('https://services.faa.gov/airport/status/' + msg.query + '?format=json', function(err, res, good){
          let shouldCheck = JSON.parse(good)
          if (shouldCheck.delay === 'false') {
            bot.answerInlineQuery(msg.id, [{type: 'article', id: Math.random().toString().slice(0, 35), title: shouldCheck.IATA+': No Delay', input_message_content: {message_text:'No Delay'}}])
          }
          else {
            bot.answerInlineQuery(msg.id, [{type: 'article', id: Math.random().toString().slice(0, 35), title: shouldCheck.IATA+': Delay! Click here for more info', input_message_content: {message_text:returns.delayCalc(shouldCheck)}}])
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
        method: 'HEAD'
    }, function(err, res, checkCode) {
        if (res.statusCode != 404) {
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

 bot.onText(/\/sendMessage (.+)/, function(msg, match) {
   if (msg.chat.id === 119682002){
     bot.sendMessage(match[1].split("msg:")[0], match[1].split("msg:")[1])
   }
 })

 bot.onText(/\/debug/, function(msg, match) {
   if (msg.chat.id === 119682002){
     sendDaily()
   }
 })


timer.setInterval(checkTime, '', '60s')

function checkTime() {
    let date = new Date()
    let hour = date.getHours()
    let minute = date.getMinutes()
    if (hour === 10 && minute === 0 || hour === 10 && minute === 1 && timeDrift === true) {
        sendDaily()
        timeDrift = false
        delayForTime.setTimeout(function(){timeDrift = true}, '', '240s')
    }
if (date.getTime() >= 1480464000000 && date.getTime() <= 1480982400000) {
       checkDelays()
    }
}


function sendDaily() {
    days.untilMff().then(function(days) {
      if (days >! 1) {
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
                                log.daily('Message Sent To: ' + info.chat.title + info.chat.username)
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

function checkDelays() {
  db.shouldSend({}, null, 'find').then(function(data){
    for (let i in data) {
        airports.checkDelays(data[i].airport, data[i].id).then(string => {if(string != 'no update'){bot.sendMessage(data[i].id, string, {parse_mode:'markdown'})}})
    }
  })
}
