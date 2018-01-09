const path = require('path')
const empty = require('is-empty')
const mongoose = require('mongoose')
const returns = require('./returns.js')
const process = require('process')
const dbString = `${process.env.HOST || 'localhost'}:${process.env.PORT || '27017'}/${process.env.DBNAME}`
mongoose.connect(`mongodb://${dbString}`)
mongoose.Promise = require('bluebird')

let userSchema = new mongoose.Schema({
	name: String,
	chatId: Number,
	group: Boolean
})

let creditSchema = new mongoose.Schema({
	photo: String,
	url: String
})

let User = mongoose.model('users', userSchema)
let Credit = mongoose.model('credit', creditSchema)

let map = { //Add dataset here for mapping
	'users': User,
	'credit': Credit
}

async function dupCheck(query, dataset) { //Checks for if a key is already in the database
	let checkDB = await map[dataset].find(query)
	if (empty(checkDB)) {
		return true
	} else {
		return false
	}
}


const add = function (data, dataset) { //Adds to databse
	return new Promise(async (res, rej) => {
		if (await dupCheck(data, dataset)) {
			let toInsert = new map[dataset](data)
			toInsert.save(err => {
				if (err) {
					rej(err)
				} else {
					res(true)
				}
			})
		} else {
			res(false)
		}
	})
}

const update = function (query, update, dataset) { //Updates a datset
	return new Promise((res, rej) => {
		map[dataset].update(query, update, (err) => {
			if (!err) {
				res(true)
			} else {
				rej(err)
			}
		})
	})
}

const remove = async function (query, dataset) { //deletes a key
	return new Promise((res, rej) => {
		map[dataset].remove(query, (err, del) => {
			if (!err) {
				if (del.n >= 1) {
					res(true)
				} else {
					res(false)
				}
			} else {
				rej(err)
			}
		})
	})
}

const find = async function (query, dataset) {
	return new Promise((res, rej) => {
		map[dataset].find(query, (err, result) => {
			if (!err) {
				res(result)
			} else {
				rej(err)
			}
		})
	})
}

module.exports = {
	add: add,
	update: update,
	remove: remove,
	find: find,
}