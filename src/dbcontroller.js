const path = require('path')
const Datastore = require('nedb')
const db = new Datastore({
    filename: path.join(__dirname, "../databases/countdown.db"),
    autoload: true
})
const Nano = require('nanotimer')
const timer = new Nano()
const remember = new Datastore()
const airportUser = new Datastore({
    filename: path.join(__dirname, "../databases/airports.db"),
    autoload: true
})
const shouldSend = new Datastore({
    filename: path.join(__dirname, "../databases/shouldSend.db"),
    autoload: true
})


exports.add = function(uid, name, group) {
    return new Promise(function(res, rej) {
        var doc = {
            'chatId': uid,
            'finding': 'tag',
            'name': name,
            'group': group,
        }
        db.find({
            chatId: uid
        }, function(err, docs) {
            if (!err) {
                if (!docs[0]) {
                    db.insert(doc, function(err, newDoc) {
                        if (!err) {
                            res('Added')
                        } else {
                            rej(err)
                        }
                    });
                } else {
                    res('In')
                }
            } else {
                rej(err)
            }
        });
    })
}

exports.lookup = function(finding, data) {
    return new Promise(function(res, rej) {
        var obj = {}
        obj[finding] = data
        db.find(obj, function(err, docs) {
            if (!err) {
                res(docs)
            } else {
                rej(err)
            }
        });
    })
}

exports.remove = function(id) {
    return new Promise(function(res, rej) {
        db.remove({
            chatId: id
        }, function(err, num) {
            if (!err) {
                if (num != 1) {
                    res('Not Here')
                } else {
		    db.persistence.compactDatafile()
                    res('Removed')
                }
            } else {
                rej(err)
            }
        })
    })
}

exports.update = function(old, q1, q2, q3, q4, q5, q6, q7, q8) {
    return new Promise(function(res, rej) {
        var obj = {}
        obj[q1] = q2
        obj[q3] = q4
        obj[q5] = q6
        obj[q7] = q8
        db.update(old, obj, function(err, items) {
            if (!err) {
		db.persistence.compactDatafile()
                res('Updated')
            }
        })
    })
}

exports.error = function(removed) {
    return new Promise(function(res, rej) {
        db.remove(removed, function(err, data) {
            if (data != 1) {
                db.persistence.compactDatafile()
                res('Removed')
            } else {
                rej('err')
            }
        })
    })
}

exports.map = function (query, type, source) {
    return new Promise(function(res, rej) {
        if (type === 'check') {
            remember.find(query, function(err, data) {
                if (data[0] === undefined) {
                    if (source === 'location') {
                        res('not here')
                    }
                    if (source != 'location') {
                        remember.insert(query, function(err, added) {
                            res('added user')
                        })
                    }
                }
                if (data[0] != undefined) {
                    res('ready for loc')
                }
            })
        }
        if (type === 'delete') {
            remember.remove(query, function(err, rem) {
                if (rem === 0) {
                    res('not there')
                }
                if (rem === 1) {
                    res('removed')
                }
            })
        }
    })
}

exports.newMonitor = function (uid, airport) {
    return new Promise(function(res, rej) {
        let doc = {
            'id': uid,
            'airport': airport,
        }
        airportUser.find({
            id: uid,
            airport: airport
        }, function(err, docs) {
            if (!err) {
                if (!docs[0]) {
                    airportUser.insert(doc, function(err, newDoc) {
                        if (!err) {
                            res('Added')
                        } else {
                            rej(err)
                        }
                    });
                } else {
                    res('In')
                }
            } else {
                rej(err)
            }
        });
    })
}

exports.removeMonitor = function(user, airport){
  return new Promise(function(res, rej) {
      airportUser.remove({
          id: user,
          airport: airport
      }, function(err, num) {
          if (!err) {
              if (num != 1) {
                  res('not')
              } else {
		  db.persistence.compactDatafile()
                  res('removed')
              }
          } else {
              rej(err)
          }
      })
  })
}

exports.shouldSend = function(toAdd, toUpdate, type){
  return new Promise(function(res, rej){
    if (type === 'insert'){
      shouldSend.insert(toAdd)
      shouldSend.persistence.compactDatafile()
      res('1')
    }
    if (type === 'update'){
      shouldSend.update(toAdd, toUpdate)
      shouldSend.persistence.compactDatafile()
      res('1')
    }
    if (type === 'find'){
      shouldSend.find(toAdd, function(err, data){
        res(data)
      })
    }
    if (type === 'remove') {
      shouldSend.remove(toAdd)
      res('done')
    }
  })
}
