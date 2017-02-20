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
    return new Promise((res, rej) => {
        var doc = {
            'chatId': uid,
            'name': name,
            'group': group,
        }
        db.find({
            chatId: uid
        }, (err, docs) => {
            if (!err) {
                if (!docs[0]) {
                    db.insert(doc, (err, newDoc) => {
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
    return new Promise((res, rej) => {
        db.find(query, (err, docs) => {
            if (!err) {
                res(docs)
            } else {
                rej(err)
            }
        })
    })
}

const remove = function(id) {
    return new Promise((res, rej) => {
        db.remove({
            chatId: id
        }, (err, num) => {
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
    return new Promise((res, rej) => {
        db.update(query, {
            $set: {
                chatId: update
            }
        }, (err, items) => {
            if (!err) {
                db.persistence.compactDatafile()
                res('Updated')
            }
        })
    })
}

const error = function(removed) {
    return new Promise((res, rej) => {
        db.remove(removed, (err, data) => {
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
    return new Promise((res, rej) => {
        picDb.find({
            name: name
        }, (err, pic) => {
            if (!err) {
                res(pic)
            }
        })
    })
}

const addPic = function(name) {
    return new Promise((res, rej) => {
        picDb.insert({
            name: name
        }, (err, num) => {
            res(num)
        })
    })
}

const addCredit = function(person, photo) {
    return new Promise((res, rej) => {
        creditDb.find({
            photo: photo
        }, (err, dup) => {
            if (!err && !dup[0]) {
                creditDb.insert({
                    photo: photo,
                    credit: person
                }, (err, done) => {
                    if (!err) {
                        res(done)
                    } else {
                        rej(err)
                    }
                })
            } else {
                res('already here')
            }
        })
    })
}

const findCredit = function(photo) {
    return new Promise((res, rej) => {
        creditDb.find({
            photo: photo
        }, (err, credit) => {
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
