const untilMff = function() {
    return new Promise(function(res, rej) {
        var mff = new Date(2017, 10, 30).getTime()
        var now = Date.now()
        var untillMff = mff - now
        res(Math.ceil(untillMff / 86400000))
    })
}

exports.untilMff = untilMff
