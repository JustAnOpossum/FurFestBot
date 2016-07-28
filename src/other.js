var request = require('request')
var days = require('./days')
var url = require('./urls.js')


exports.youtube = function() { //makes the youtube link
    return new Promise(function(res, rej) {
        var rand = Math.floor(Math.random() * 50)
        var baseUrl = 'https://www.youtube.com/watch?v='
        res(baseUrl + url.youtube[rand])
    })
}
