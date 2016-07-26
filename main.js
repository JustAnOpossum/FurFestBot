'use strict'

const emoji = require('node-emoji')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const pic = require('./src/pic.js')
const token = fs.readFileSync('./private/telegramKey.txt', 'utf8')
const bot = new TelegramBot(token, {polling: true})
const days = require('./src/days.js')
const db = require('./src/dbcontroller.js')
const otherCommands = require('./src/other.js')
const Nano = require('nanotimer')
const timer = new Nano()


bot.on('message', function(msg){
  try {
  if(msg.new_chat_participant.id === 201654972) {
    bot.sendMessage(msg.chat.id, 'Hello! I am a bot that will tell you how many days until MFF :D. Use /countdown to get a picture daily with how many days until MFF. I was made by @ConnorTheFox. Type /info if you want to know more about me. All the photos that are shown were taken by AoLun. NOTE: I notice this is a group chat, all commands will be send back to the group and not a individual')
  }
}
catch(err){}
  try {
  if(msg.migrate_to_chat_id != undefined) {
    db.lookup('chatId', msg.migrate_from_chat_id).then(function(found){
      if (found[0] != undefined) {
        db.update(found[0], 'chatId', msg.migrate_to_chat_id, 'finding', 'tag', 'name', found[0].name, 'group', 'true').then(console.log('Supergroup'+msg.chat.title+'Updated'))
      }
    })
}}
catch(err){}
})


bot.onText(/\/start/, function (msg, match) {
  if (msg.chat.title != undefined) {
  console.log('Group: '+msg.chat.title + ' Used command /start')
  bot.sendMessage(msg.chat.id, 'Hello! I am a bot that will tell you how many days until MFF :D. Use /countdown to get a picture daily with how many days until MFF. I was made by @ConnorTheFox. Type /info if you want to know more about me. All the photos that are shown were taken by AoLun. NOTE: I notice this is a group chat, all commands will be send back to the group and not a individual')
}
else {
  console.log(msg.chat.first_name + ' Used command /start')
  bot.sendMessage(msg.chat.id, 'Hello! I am a bot that will tell you how many days until MFF :D. Use /countdown to get a picture daily with how many days until MFF. I was made by @ConnorTheFox. Type /info if you want to know more about me. All the photos that are shown were taken by AoLun.')
}
})

bot.onText(/\/countdown/, function (msg, match) {
  if (msg.chat.title != undefined) {
  console.log('Group ' + msg.chat.title + ' Used command /countdown')
}
else {
  console.log(msg.chat.first_name + ' Used command /countdown')
}
  if (msg.chat.title === undefined) {
  db.add(msg.chat.id, msg.chat.first_name, false).then(function (input){if (input === 'Added'){bot.sendMessage(msg.from.id, 'You have subscibed to the daily reminder.\nTimes:\nPST: 9AM\nMST: 10AM\nCST: 11AM\nEST: 12PM').then(bot.sendMessage('119682002', msg.chat.first_name + ' Subscribed!'))}if(input === 'In'){bot.sendMessage(msg.from.id, 'Im sorry you are already subscribed')}})}
  else {
    db.add(msg.chat.id, msg.chat.title, true).then(function (input){if (input === 'Added'){bot.sendMessage(msg.chat.id, 'You have subscibed to the daily reminder.\nTimes:\nPST: 9AM\nMST: 10AM\nCST: 11AM\nEST: 12PM').then(bot.sendMessage('119682002', msg.chat.title + ' Subscribed!'))}if(input === 'In'){bot.sendMessage(msg.chat.id, 'Im sorry you are already subscribed')}})
  }
})


bot.onText(/\/info/, function (msg, match) {
  if (msg.chat.title != undefined) {
  console.log('Group ' + msg.chat.title + ' Used command /info')
}
else {
  console.log(msg.chat.first_name + ' Used command /info')
}
  bot.sendMessage(msg.chat.id, 'Information about this bot:\nIt is coded in node.js\nIf you want to view the code goto https://github.com/ConnorTheFox/FurFestBot\nI made this bot because im hyped about MFF')
})

bot.onText(/\/hype/, function (msg, match) {
  if (msg.chat.title != undefined) {
  console.log('Group: '+msg.chat.title + ' Used command /hype')
}
else {
  console.log(msg.chat.first_name + ' Used command /hype')
}
  let random = Math.floor(Math.random()*2)
  if (random === 1) {
    bot.sendMessage(msg.chat.id, 'Sending Picture....')
    pic.findImage().then(buffer => bot.sendPhoto(msg.chat.id, buffer))
  }
  if (random === 0) {
  otherCommands.youtube().then(link => bot.sendMessage(msg.chat.id, link))
  }
})

bot.onText(/\/randomfact/, function (msg, match) {
  if (msg.chat.title != undefined) {
  console.log('Group ' + msg.chat.title + ' Used command /randomfact')
}
else {
  console.log(msg.chat.first_name + ' Used command /randomfact')
}
  let random = Math.floor(Math.random()*4)
  switch (random) {
    case 0:
    otherCommands.numbers('math').then(string => bot.sendMessage(msg.chat.id, string))
    break;
    case 1:
    otherCommands.numbers('trivia').then(string => bot.sendMessage(msg.chat.id, string))
    break;
    case 2:
    otherCommands.numbers('year').then(string => bot.sendMessage(msg.chat.id, string))
    break;
    default:
    let possible = ['year', 'trivia', 'math', 'math']
    otherCommands.numbers(possible[random]).then(string => bot.sendMessage(msg.chat.id, string))
  }
})

bot.onText(/\/stopcountdown/, function (msg, match) {
  if (msg.chat.title != undefined) {
  console.log('Group ' + msg.chat.title + ' Used command /stopcountdown')
}
else {
  console.log(msg.chat.first_name + ' Used command /stopcountdown')
}
  db.remove(msg.chat.id).then(function(done){if (done === 'Removed') {bot.sendMessage(msg.chat.id, 'Unscribed form daily countdown')}if (done === 'Not Here') {bot.sendMessage(msg.chat.id, 'Already removed')}})
})

bot.onText(/\/daysleft/, function (msg, match) {
  if (msg.chat.title != undefined) {
  console.log('Group ' + msg.chat.title + ' Used command /daysleft')
}
else {
  console.log(msg.chat.first_name + ' Used command /daysleft')
}
  days.untilMff().then(function(day){
    bot.sendMessage(msg.chat.id, day + ' Days until MFF')
  })

})



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
    return emoji.emojify(':'+emojiArr[0]+':')
  }
  if (emojiArr.length === 2) {
    return emoji.emojify(':'+emojiArr[0]+'::'+emojiArr[1]+':')
  }
  if (emojiArr.length === 3) {
    return emoji.emojify(':'+emojiArr[0]+'::'+emojiArr[1]+'::'+emojiArr[2]+':')
  }
}

function randomEmoji() {
  const animals = ['elephant', 'dog', 'dolphin', 'tiger', 'panda_face', 'monkey', 'cat', 'penguin', 'wolf', 'monkey_face', 'camel', 'leopard', 'tiger2', 'dragon', 'feet', 'bear', 'rabbit', 'goat', 'horse', 'cow', 'racehorse', 'mouse', 'koala', 'dragon_face', 'hamster', 'bird', 'sheep', 'rabbit2']
  let randomNum = Math.floor(Math.random() * animals.length)
  return emoji.get(animals[randomNum])
}

timer.setInterval(checkTime, '', '60s')

function checkTime(){
  let date = new Date()
  let hour = date.getHours()
  let minute = date.getMinutes()
  if (hour === 10 && minute === 0) {
    sendDaily()
  }
}


function sendDaily() {

days.untilMff().then(function(days){db.lookup('finding', 'tag')
.then(function(users) {
  pic.pickImage().then(function (buffer) {for (let n in users) {bot.sendPhoto(users[n].chatId, buffer, {caption: emojiParser(days)+' Days Until MFF!! '+randomEmoji()}).then(function(info){
    if (users[n].group === false) {
    console.log('Message Sent To: '+info.chat.first_name)
  }
    else{
    console.log('Message Sent To: '+info.chat.title)
  }}).catch(function(err){
    if (err) {
      db.error(users[n])
    }
  })}
})
})})

}

bot.on('message', function(msg){
  console.log(msg)
})
