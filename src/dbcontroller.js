const path = require('path')
const Datastore = require('nedb')
const db = new Datastore({
    filename: path.join(__dirname, "../countdown.db"),
    autoload: true
})
const Nano = require('nanotimer')
const timer = new Nano()
const remember = new Datastore()


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
                if (docs[0] === undefined) {
                    db.insert(doc, function(err, newDoc) {
                        if (!err) {
                            console.log('User: ' + doc.name.toString() + ' Added')
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
                    res('Removed')
                    db.persistence.compactDatafile()
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
                res('Updated')
                db.persistence.compactDatafile()
            }
        })
    })
}

exports.error = function(removed) {
    return new Promise(function(res, rej) {
        db.remove(removed, function(err, data) {
            if (data != 1) {
                res('Removed')
                db.persistence.compactDatafile()
            } else {
                rej('err')
            }
        })
    })
}

exports.map = function(query, type, source) {
    return new Promise(function(res, rej) {
        if (type === 'check') {
            remember.find(query, function(err, data) {
                if (data[0] === undefined) {
                    if (source === 'location') {
                        res('not here')
                    }
                    if (source != 'location') {
                        remember.insert(query, function(err, added) {
                            remember.persistence.compactDatafile()
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
                    remember.persistence.compactDatafile()
                }
                if (rem === 1) {
                    res('removed')
                }
            })
        }
    })
}
