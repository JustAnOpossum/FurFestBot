'use strict'

const path = require('path')
const gm = require('gm')
const fs = require('fs')
const RandomOrg = require('random-org')
const days = require('./days.js')
const log = require('./logController.js')
const Trianglify = require('trianglify');
const random = require('randomcolor')

exports.pickImage = function() {
    return new Promise(function(res, rej) {
      days.untilMff().then(day => {
        var types = ['bright', 'dark']
        var pattern = Trianglify({width: 1024, height: 1024, variance: "1", cell_size: 150, x_colors: random({count: 5, luminosity: Math.floor(Math.random()*3), hue: 'random'})}).png()
                let dayStr
                if (day === 1) {
                  dayStr = '(Tomorrow Is\nMFF!)'
                }
                else {
                  dayStr = '{}' + day + ' days{}\n^until MFF!^'
                }
                  gm(new Buffer(pattern.replace(/^data:image\/png;base64,/, ''), 'base64'))
                      .fill('rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')')
                      .drawText('50', '412', dayStr)
                      .font(path.join(__dirname, "../fonts/font.ttf"))
                      .fontSize('150')
                      .write(path.join(__dirname, "../Countdown/" + day.toString() + '.png'), function(err) {
                          if (!err) {
                              log.picture('Day ' + day + ' Generated')
                              let file = fs.readFile(path.join(__dirname, "../Countdown/" + day + '.png'), function(err, data) {
                                  if (!err) {
                                      res(data)
                                  } else {
                                      rej(err)
                                  }
                              })
                          }
                      })
      })
    })
}
