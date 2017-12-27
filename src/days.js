const untilMff = function() {
   let mff = new Date(2018, 10, 29).getTime()
   let now = Date.now()
   let untillMff = mff - now
   return Math.ceil(untillMff / 86400000)
}

exports.untilMff = untilMff
