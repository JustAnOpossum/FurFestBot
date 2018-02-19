const process = require('process')
const opts = require('minimist')(process.argv.slice(2))
process.env.DBNAME = opts.dbname
process.env.HOST = opts.host || 'localhost'
process.env.PORT = opts.port || 27017
const Promise = require('bluebird')
const db = require('./src/dbcontroller.js')
const unzip = require('unzip')
const fs = Promise.promisifyAll(require('fs-extra'))

if (!opts.dbname) {
    throw new Error('Please give a database name')
}

let url = opts.credit
let name = opts.name
let zipFile = fs.createReadStream(opts.zip)
let unzipPipe = zipFile.pipe(unzip.Parse())
    .on('entry', async entry => {
        try {
            let photo = entry.path
            entry.pipe(fs.createWriteStream(`pics/${photo}`))
            await db.add({ photo: photo, url: url, used: false, name: name }, 'credit')
            updateProgress()
        } catch (e) {
            console.log(e)
        }
    })
    .on('close', () => {
        console.log('\nUpload Completed')
        process.exit(0)
    })

let i = 1

function updateProgress() {
    process.stdout.write(`Added Photo ${i}`)
    process.stdout.cursorTo(0)
    i += 1
}