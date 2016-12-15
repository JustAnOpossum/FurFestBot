'use strict'

let request = require('request')
let data = require('nedb')
let JsDiff = require('diff')
let Nano = require('nanotimer')
let timer = new Nano()
let db = require('./dbcontroller.js')
let returns = require('./returns.js')


exports.getInitialUpdate = function (user, airport) {
    request('https://services.faa.gov/airport/status/' + airport + '?format=json', {rejectUnauthorized: false}, function(err, res, body) {
        let toAdd = {
            id: user,
            airport: airport,
            lastUpdate: JSON.parse(body).status,
        }
        db.shouldSend(toAdd, null, 'insert')
    })
}

exports.checkDelays = function (airport, user) {
  return new Promise(function(res, rej){
    request('https://services.faa.gov/airport/status/' + airport + '?format=json', {rejectUnauthorized: false},  function(err, resp, body) {
        let delayRes = JSON.parse(body)
        let finder = {
          id: user,
          airport: airport,
        }
        db.shouldSend(finder, null, 'find').then(function(data){
          if (JsDiff.diffJson(data[0].lastUpdate, delayRes.status)[1]) {
              let finding = {
                id: user,
                airport: airport
              }
              let updated = {
                id: user,
                lastUpdate: delayRes.status,
                airport: airport
              }
              db.shouldSend(finding, updated, 'update')
              res(returns.delayCalc(delayRes))
          }
          else {
            res('no update')
          }
        })
    })
  })
}
