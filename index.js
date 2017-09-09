/* global __base */

global.__base = __dirname
global.__esnLib = `${__dirname}/vendors/esn-lib`
global.Console = require(`esn-lib`).Console

const server = require(`${__base}/server`)
const dbConfig = require(`${__base}/database.json`)
const config = require(`${__base}/config.json`)
const {
	g,
	help,
	DB,
	NATS,
} = require('esn-lib')

const initNATS = () =>
	new Promise(resolve => {
		g.nats = new NATS({servers: config.nats.servers})
		resolve()
	})

const initDB = () =>
	new Promise((resolve, reject) => {
		g.db = {}
		const db = new DB(help.buildPGDBConncetionString(dbConfig.prod))
		db.connect()
			.then(() => {
				g.db.main = db
				resolve()
			})
			.catch(reject)
	})

initDB()
	.then(() => initNATS())
	.then(() => server.start())
