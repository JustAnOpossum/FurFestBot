var emoji = require('node-emoji')

exports.delayCalc = function (input) {
    if (input.delay === 'true') {
      let types = {
          'reason': '*Reason*',
          'closureBegin': '*Closure Starting Time*',
          'endTime': '*End Time*',
          'minDelay': '*Minimum Delay*',
          'avgDelay': '*Average Delay*',
          'maxDelay': '*Maximum Delay*',
          'clousureEnd': '*Clousure End*',
          'trend': '*Trend*',
          'type': '*Type*'
      }
      let delayStr = []
      for (let i in input.status) {
          if (input.status[i] != '') {
              delayStr.push(types[i] + ': ' + input.status[i])
          }
      }
      return '⚠️⚠️*Delay At ' + input.name + '*⚠️⚠️\n' + delayStr.join('\n') + '\nGet more information at: http://www.fly.faa.gov/flyfaa/flyfaaindex.jsp?ARPT=' + input.IATA + '&p=0'
    }
    else {
      return 'Delay has ended at ' + input.IATA
    }
}

exports.emojiParser = function (days) {
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
        return 'Tomorrow Is'
      }
      else {
        return emoji.emojify(':' + emojiArr[0] + ':' + 'Days Until')
      }
    }
    if (emojiArr.length === 2) {
        return emoji.emojify(':' + emojiArr[0] + '::' + emojiArr[1] + ':' + 'Days Until')
    }
    if (emojiArr.length === 3) {
        return emoji.emojify(':' + emojiArr[0] + '::' + emojiArr[1] + '::' + emojiArr[2] + ':' + 'Days Until')
    }
}

exports.randomEmoji = function () {
    const animals = ['elephant', 'dog', 'dolphin', 'tiger', 'panda_face', 'monkey', 'cat', 'penguin', 'wolf', 'monkey_face', 'camel', 'leopard', 'tiger2', 'dragon', 'feet', 'bear', 'rabbit', 'goat', 'horse', 'cow', 'racehorse', 'mouse', 'koala', 'dragon_face', 'hamster', 'bird', 'sheep', 'rabbit2']
    let randomNum = Math.floor(Math.random() * animals.length)
    return emoji.get(animals[randomNum])
}
