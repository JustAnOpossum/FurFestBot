const until = function() {
   let con = new Date(2018, 10, 29).getTime() //Edit the date here for your con
   let now = Date.now()
   let until = con - now
   return Math.ceil(until / 86400000)
}

exports.until = until
