const process = require('process')
const Promise = require('bluebird')
const opts = require('minimist')(process.argv.slice(2))
const db = require('./src/dbcontroller.js')
const unzip = require('unzip')
const fs = Promise.promisifyAll(require('fs-extra'))

if (!process.env.DBNAME) {
    throw new Error('Please give a database name')
}

let url = opts.credit
let zipFile = fs.createReadStream(opts.zip)
let unzipPipe = zipFile.pipe(unzip.Parse())
    .on('entry', async entry => {
        try {
            let photo = entry.path
            entry.pipe(fs.createWriteStream(`pics/${photo}`))
            await db.add({ photo: photo, url: url }, 'credit')
            updateProgress()
        } catch (e) {
            console.log(e)
        }
    })
    .on('close', () => {
        fs.unlink(opts.zip)
        console.log('\nUpload Completed')
        process.exit(0)
    })

let i = 1

function updateProgress() {
    process.stdout.write(`Added Photo ${i}`)
    process.stdout.cursorTo(0)
    i += 1
}