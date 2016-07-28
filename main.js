'use strict'

const emoji = require('node-emoji')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const pic = require('./src/pic.js')
const token = fs.readFileSync('./private/telegramKey.txt', 'utf8')
const bot = new TelegramBot(token, {
    polling: true
})
const days = require('./src/days.js')
const db = require('./src/dbcontroller.js')
const otherCommands = require('./src/other.js')
const Nano = require('nanotimer')
const timer = new Nano()
const request = require('request')


bot.on('message', function(msg) {
    try {
        if (msg.new_chat_participant.id === 201654972) {
            bot.sendMessage(msg.chat.id, 'Hello! I am a bot that will tell you how many days until MFF :D. Use /countdown to get a picture daily with how many days until MFF. I was made by @ConnorTheFox. Type /info if you want to know more about me. All the photos that are shown were taken by AoLun. Use /help to get a overview of the commands and things this got can do')
        }
    } catch (err) {}
    try {
        if (msg.migrate_to_chat_id != undefined) {
            db.lookup('chatId', msg.migrate_from_chat_id).then(function(found) {
                if (found[0] != undefined) {
                    db.update(found[0], 'chatId', msg.migrate_to_chat_id, 'finding', 'tag', 'name', found[0].name, 'group', 'true').then(console.log('Supergroup' + msg.chat.title + 'Updated'))
                }
            })
        }
    } catch (err) {}
})


bot.onText(/\/start/, function(msg, match) {
    if (msg.chat.title != undefined) {
        console.log('Group: ' + msg.chat.title + ' Used command /start')
        bot.sendMessage(msg.chat.id, 'Hello! I am a bot that will tell you how many days until MFF :D. Use /countdown to get a picture daily with how many days until MFF. I was made by @ConnorTheFox. Type /info if you want to know more about me. All the photos that are shown were taken by AoLun. Use /help to get a overview of the commands and things this got can do')
    } else {
        console.log(msg.chat.first_name + ' Used command /start')
        bot.sendMessage(msg.chat.id, 'Hello! I am a bot that will tell you how many days until MFF :D. Use /countdown to get a picture daily with how many days until MFF. I was made by @ConnorTheFox. Type /info if you want to know more about me. All the photos that are shown were taken by AoLun. Use /help to get a overview of the commands and things this got can do')
    }
})

bot.onText(/\/countdown/, function(msg, match) {
    if (msg.chat.title != undefined) {
        console.log('Group ' + msg.chat.title + ' Used command /countdown')
    } else {
        console.log(msg.chat.first_name + ' Used command /countdown')
    }
    if (msg.chat.title === undefined) {
        db.add(msg.chat.id, msg.chat.first_name, false).then(function(input) {
            if (input === 'Added') {
                bot.sendMessage(msg.from.id, 'You have subscibed to the daily reminder.\nTimes:\nPST: 9AM\nMST: 10AM\nCST: 11AM\nEST: 12PM').then(bot.sendMessage('119682002', msg.chat.first_name + ' Subscribed!'))
            }
            if (input === 'In') {
                bot.sendMessage(msg.from.id, 'Im sorry you are already subscribed')
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
        console.log('Group ' + msg.chat.title + ' Used command /info')
    } else {
        console.log(msg.chat.first_name + ' Used command /info')
    }
    bot.sendMessage(msg.chat.id, 'Information about this bot:\nIt is coded in node.js\nIf you want to view the code goto https://github.com/ConnorTheFox/FurFestBot\nI made this bot because im hyped about MFF')
})

bot.onText(/\/hype/, function(msg, match) {
    if (msg.chat.title != undefined) {
        console.log('Group: ' + msg.chat.title + ' Used command /hype')
    } else {
        console.log(msg.chat.first_name + ' Used command /hype')
    }
    let random = Math.floor(Math.random() * 2)
    if (random === 1) {
        bot.sendMessage(msg.chat.id, 'Sending Picture....')
        pic.findImage().then(buffer => bot.sendPhoto(msg.chat.id, buffer))
    }
    if (random === 0) {
        otherCommands.youtube().then(link => bot.sendMessage(msg.chat.id, link))
    }
})


bot.onText(/\/stopcountdown/, function(msg, match) {
    if (msg.chat.title != undefined) {
        console.log('Group ' + msg.chat.title + ' Used command /stopcountdown')
    } else {
        console.log(msg.chat.first_name + ' Used command /stopcountdown')
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
        console.log('Group ' + msg.chat.title + ' Used command /daysleft')
    } else {
        console.log(msg.chat.first_name + ' Used command /daysleft')
    }
    days.untilMff().then(function(day) {
        bot.sendMessage(msg.chat.id, day + ' Days until MFF')
    })

})

bot.onText(/\/howfar/, function(msg, match) {
    if (msg.chat.title != undefined) {
        console.log('Group ' + msg.chat.title + ' Used command /howfar')
    } else {
        console.log(msg.chat.first_name + ' Used command /howfar')
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
    if (msg.chat.title != undefined) {
        console.log('Group ' + msg.chat.title + ' Used command /help')
    } else {
        console.log(msg.chat.first_name + ' Used command /help')
    }
    bot.sendMessage(msg.chat.id, 'Normal Commands:\n/countdown: Subscribes you do a daily reminder of how many days until MFF.\n/stopcountdown: Unsubscribes you from the daily countdown.\n/info: Gives information about the techinial side of the bot.\n/hype: Sends a photo/video from MFF 2015.\n/daysleft: Tells you how many days are left.\n/howfar: Send the bot a location and it will map it and tell you how long it will take to get there by driving\n\nInline Queries:\n@FurFestBot hotels check in, checkout. EX: @FurFestBot hotels 11-30 12-05')
})

let hotel = function(id, title, thumbnail, price, text, distance) {
    this.type = 'article',
        this.id = id,
        this.title = title,
        this.thumb_url = 'http://images.trvl-media.com' + thumbnail,
        this.description = '$' + price + ' Per Night, ' + distance + ' Miles from MFF'
    this.input_message_content = {
        parse_mode: 'Markdown',
        message_text: text,
        disable_web_page_preview: true
    }
}

bot.on('inline_query', function(msg) {
    let testex = /hotels\s[0-9][0-9]-[0-9][0-9]\s[0-9][0-9]-[0-9][0-9]/
    if (testex.test(msg.query) === true) {
        let input = msg.query.split('hotels')
        let split = input[1].split(' ')
        let hotelarr = []
        request('http://terminal2.expedia.com:80/x/mhotels/search?city=Rosemont%20Il&latitude=41.981539&longitude=-87.859411&filterUnavailable=true&resultsPerPage=40&checkInDate=2016-' + split[1] + '&checkOutDate=2016-' + split[2] + '&room1=1', {
            headers: {
                'Authorization': 'expedia-apikey key=' + fs.readFileSync('./private/expedia.txt', 'utf8')
            }
        }, function(err, res, body) {
            let hotels = JSON.parse(body)
            for (let i in hotels.hotelList) {
                let date = new Date()
                let picked = "*Name: *" + hotels.hotelList[i].name + "\n*Address: *[" + hotels.hotelList[i].address + "]" + "(https://google.com/maps?q=" + encodeURIComponent(hotels.hotelList[i].name) + "+Rosemont+IL)\n*Stars: *" + findStars(hotels.hotelList[i].hotelStarRating) + "(" + hotels.hotelList[i].hotelStarRating + ")\n*User Rating: *" + findStars(hotels.hotelList[i].hotelGuestRating) + "(" + hotels.hotelList[i].hotelGuestRating + ")\n*Description: *" + hotels.hotelList[i].shortDescription + "\n*Nightly Rate: *$" + hotels.hotelList[i].lowRateInfo.priceToShowUsers + "\n*Distance From MFF: *" + hotels.hotelList[i].proximityDistanceInMiles.substring(0, 3) + " Miles\n\nPowered By [Expedia](https://expedia.com)\nHotel information was pulled from Expedia at " + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + ' (Mountain Daylight Time)'
                let id = Math.random().toString().slice(2, 35)
                hotelarr.push(new hotel(id, hotels.hotelList[i].name, hotels.hotelList[i].largeThumbnailUrl, hotels.hotelList[i].lowRateInfo.priceToShowUsers, picked, hotels.hotelList[i].proximityDistanceInMiles.substring(0, 3)))
            }
            console.log('Answered Query')
            bot.answerInlineQuery(msg.id, hotelarr)
        })
    }
})


function randomEmoji() {
    const animals = ['elephant', 'dog', 'dolphin', 'tiger', 'panda_face', 'monkey', 'cat', 'penguin', 'wolf', 'monkey_face', 'camel', 'leopard', 'tiger2', 'dragon', 'feet', 'bear', 'rabbit', 'goat', 'horse', 'cow', 'racehorse', 'mouse', 'koala', 'dragon_face', 'hamster', 'bird', 'sheep', 'rabbit2']
    let randomNum = Math.floor(Math.random() * animals.length)
    return emoji.get(animals[randomNum])
}

timer.setInterval(checkTime, '', '60s')

function checkTime() {
    let date = new Date()
    let hour = date.getHours()
    let minute = date.getMinutes()
    if (hour === 10 && minute === 0) {
        sendDaily()
    }
}


function sendDaily() {

    days.untilMff().then(function(days) {
        db.lookup('finding', 'tag')
            .then(function(users) {
                pic.pickImage().then(function(buffer) {
                    for (let n in users) {
                        bot.sendPhoto(users[n].chatId, buffer, {
                            caption: emojiParser(days) + ' Days Until MFF!! ' + randomEmoji()
                        }).then(function(info) {
                            if (users[n].group === false) {
                                console.log('Message Sent To: ' + info.chat.first_name)
                            } else {
                                console.log('Message Sent To: ' + info.chat.title)
                            }
                        }).catch(function(err) {
                            if (err) {
                                db.error(users[n])
                            }
                        })
                    }
                })
            })
    })
}

function findStars(input) {
    let number = Math.floor(Number(input))
    switch (number) {
        case 1:
            return '🌟'
            break;
        case 2:
            return '🌟🌟'
            break;
        case 3:
            return '🌟🌟🌟'
            break;
        case 4:
            return '🌟🌟🌟🌟'
            break;
        case 5:
            return '🌟🌟🌟🌟🌟'
            break;

    }
}

function emojiParser(days) {
    let emojiArr = []
    let parsedDate = days.toString().split('')
    for (let i in parsedDate) {
        switch (parsedDate[i]) {
            case '0':
                emojiArr.push('zero')
                break;
            case '1':
                emojiArr.push('one')
                break;
            case '2':
                emojiArr.push('two')
                break;
            case '3':
                emojiArr.push('three')
                break;
            case '4':
                emojiArr.push('four')
                break;
            case '5':
                emojiArr.push('five')
                break;
            case '6':
                emojiArr.push('six')
                break;
            case '7':
                emojiArr.push('seven')
                break;
            case '8':
                emojiArr.push('eight')
                break;
            case '9':
                emojiArr.push('nine')
                break;
            default:
        }
    }
    if (emojiArr.length === 1) {
        return emoji.emojify(':' + emojiArr[0] + ':')
    }
    if (emojiArr.length === 2) {
        return emoji.emojify(':' + emojiArr[0] + '::' + emojiArr[1] + ':')
    }
    if (emojiArr.length === 3) {
        return emoji.emojify(':' + emojiArr[0] + '::' + emojiArr[1] + '::' + emojiArr[2] + ':')
    }
}
