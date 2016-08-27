'use strict'

let winston = require('winston');

let logLevels = {
    levels: {
        command: 0,
        daily: 1,
        query: 2,
        picture: 3,
        info: 4
    }
}

let logger = new(winston.Logger)({
    levels: logLevels.levels,
    transports: [
        new(winston.transports.File)({
            timestamp: function() {
                let date = new Date()
                let days = date.toDateString()
                let seconds = date.toLocaleTimeString()
                return days + ' ' + seconds
            },
            filename: './logs/mffbot.log',
            level: 'command',
            level: 'daily',
            level: 'query',
            level: 'picture'
        })
    ]
})

exports.daily = function(string){
  logger.daily(string)
}
exports.command = function(string){
  logger.command(string)
}
exports.query = function(string){
  logger.query(string)
}
exports.picture = function(string){
  logger.picture(string)
}
exports.info = function(string){
  logger.info(string)
}
