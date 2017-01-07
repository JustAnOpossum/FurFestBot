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

const daily = function(string) {
    logger.daily(string)
}
const command = function(string) {
    logger.command(string)
}
const query = function(string) {
    logger.query(string)
}
const picture = function(string) {
    logger.picture(string)
}
const info = function(string) {
    logger.info(string)
}

exports.daily = daily
exports.command = command
exports.query = query
exports.picture = picture
exports.info = info
