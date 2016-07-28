exports.untilMff = function() {
    return new Promise(function(res, rej) {
        var mff = new Date(2016, 11, 01).getTime()
        var now = Date.now()
        var untillMff = mff - now
        res(Math.floor(untillMff / 86400000))
    })
}
