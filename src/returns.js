const emoji = require('node-emoji')
const log = require('./logController.js')
const admin = require('./bots.js').admin
const messages = require('./message.js')

const emojiParser = function(days) {
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
      }
   }
   if (emojiArr.length === 1) {
      if (days === 1) {
         return 'Tomorrow is MFF!!!'
      } else {
         return emoji.emojify(`:${emojiArr[0]}: days until MFF!`)
      }
   }
   if (emojiArr.length === 2) {
      return emoji.emojify(`:${emojiArr[0]}::${emojiArr[1]}: days until MFF!`)
   }
   if (emojiArr.length === 3) {
      return emoji.emojify(`:${emojiArr[0]}::${emojiArr[1]}::${emojiArr[2]}: days until MFF!`)
   }
}

/**const randomEmoji = function() {
    const animals = ['elephant', 'dog', 'dolphin', 'tiger', 'panda_face', 'monkey', 'cat', 'penguin', 'wolf', 'monkey_face', 'camel', 'leopard', 'tiger2', 'dragon', 'feet', 'bear', 'rabbit', 'goat', 'horse', 'cow', 'racehorse', 'mouse', 'koala', 'dragon_face', 'hamster', 'bird', 'sheep', 'rabbit2']
    let randomNum = Math.floor(Math.random() * animals.length)
    return emoji.get(animals[randomNum])
}
**/

const testForGroup = function(input) {
   if (!input) {
      return true
   } else {
      return false
   }
}

const generateLog = function(name, command, type, group) {
   if (type === 'command') {
      if (group === true) {
         log.command('Group: ' + name + ' Used command ' + command)
      } else {
         log.command(name + ' Used command ' + command)
      }
   }
   if (type === 'daily') {
      log.daily('Sent to ' + name)
   }
}

const handleErr = function(error, user, command) {
   if (user) {
      mff.sendMessage(message.connor, 'An error has occured in ' + command + '\n' + error)
      mff.sendMessage(user, 'Im sorry an error has occured with ' + command)
   } else {
      mff.sendMessage(message.connor, 'An error has occured in ' + command + '\n' + error)
   }
}


exports.emojiParser = emojiParser
exports.testForGroup = testForGroup
exports.generateLog = generateLog
exports.handleErr = handleErr
