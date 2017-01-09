const path = require('path')
const Datastore = require('nedb')
const db = new Datastore({
    filename: path.join(__dirname, "../databases/countdown.db"),
    autoload: true
})
const Nano = require('nanotimer')
const timer = new Nano()
const picDb = new Datastore({
    filename: path.join(__dirname, "../databases/pictures.db"),
    autoload: true
})
const creditDb = new Datastore({
    filename: path.join(__dirname, "../databases/credit.db"),
    autoload: true
})


const add = function(uid, name, group) {
    return new Promise(function(res, rej) {
        var doc = {
            'chatId': uid,
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

const lookup = function(query) {
    return new Promise(function(res, rej) {
        db.find(query, function(err, docs) {
            if (!err) {
                res(docs)
            } else {
                rej(err)
            }
        });
    })
}

const remove = function(id) {
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

const update = function(query, update) {
    return new Promise(function(res, rej) {
        db.update(query, {
            $set: {
                chatId: update
            }
        }, function(err, items) {
            if (!err) {
                db.persistence.compactDatafile()
                res('Updated')
            }
        })
    })
}

const error = function(removed) {
    return new Promise(function(res, rej) {
        db.remove(removed, function(err, data) {
            if (data != 1) {
                db.persistence.compactDatafile()
                res('Removed')
            } else {
                rej(err)
            }
        })
    })
}

const searchPic = function(name) {
    return new Promise(function(res, rej) {
        picDb.find({
            name: name
        }, function(err, pic) {
            if (!err) {
                res(pic)
            }
        })
    })
}

const addPic = function(name) {
    return new Promise(function(res, rej) {
        picDb.insert({
            name: name
        }, function(err, num) {
            res(num)
        })
    })
}

const addCredit = function(person, photo) {
    return new Promise(function(res, rej) {
      creditDb.find({photo:photo}, function(err, dup){
        if (!err && !dup[0]) {
          creditDb.insert({
              photo: photo,
              credit: person
          }, function(err, done) {
              if (!err) {
                  res(done)
              } else {
                  rej(err)
              }
          })
        }
        else {
          res('already here')
        }
      })
    })
}

const findCredit = function(photo) {
    return new Promise(function(res, rej) {
        creditDb.find({
            photo: photo
        }, function(err, credit) {
            if (!err) {
                res(credit)
            } else {
                rej(err)
            }
        })
    })
}

exports.add = add
exports.lookup = lookup
exports.remove = remove
exports.update = update
exports.error = error
exports.searchPic = searchPic
exports.addPic = addPic
exports.addCredit = addCredit
exports.findCredit = findCredit
