const process = require('process')
const con = process.env.CON

module.exports = {
   owner: [119682002], //Your chat ID goes here, if there is mor than one just add it on.
   help: { //Don't touch these are for the menu
      'Subscribe To Countdown': 'startcountdown',
      'Unsubscribe From Countdown': 'stopcountdown',
      Info: 'info',
      'Days Left': 'daysleft'
   },
   info: 'This bot is made by @ConnorTheFox, This bot will run for MFF 2018. It ran for MFF 2016 and MFF 2017. If you want to look at the source code go here: https://github.com/ConnorTheFox/FurFestBot', //This is for the info command
   start: 'Thank you all for using the bot for MFF 2017. It will start again sometime in 2018.', //Text for start command
   countdown: {
      start: 'Subscribed, thank you!', //Text for subscribing to countdown
      stop: 'Removed from daily countdown.', //Text for stopping countdown
      else: {
          start: 'Im sorry, you are already subscribed', //Text for if a user is already subscribed
          stop: 'Im sorry, you are not found in the database.' //Text for is a user is not subscribed
      }
   },
   con: con
}
//The picture is sent every day at:\n9AM PT\n10AM MT\n11AM CT\n12PM ET