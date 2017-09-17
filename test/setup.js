/* global __base */

global.__base = `${__dirname}/..`
global.__temp = `${__base}/temp`

const server = require(`${__base}/server`)
const dbConfig = require(`${__base}/database.json`)
const config = require(`${__base}/config.json`)
const u = require('url')
const {
	g,
	help,
	DB,
	Console,
	NATS,
} = require('esn-lib')
const exec = require('child_process').exec
const spawn = require('child_process').spawn

const migratePath = `${__base}/node_modules/.bin/db-migrate`

const distributedMocks = require('./mocks/distributed')
const userServiceMocks = require('./mocks/userService')

global.Console = Console
global.serviceAddress = `${config.protocol}://${config.host}:${config.port}`

let memcashedProcess = null
const natsProcesses = []

const startMemcashed = () =>
	new Promise((resolve, reject) => {
		try {
			memcashedProcess = spawn('memcached', ['-vv'])
		} catch (e) {
			reject(e)
		}

		setTimeout(() => {
			resolve()
		}, 1000)
	})

const startNATS = () =>
	new Promise((resolve, reject) => {
		try {
			for (const server of config.nats.servers) {
				const info = u.parse(server)
				const params = []

				if (info.auth) {
					const parts = info.auth.split(':')

					if (parts.length > 0) {
						params.push('--user')
						params.push(parts[0])
					}

					if (parts.length === 2) {
						params.push('--pass')
						params.push(parts[1])
					}
				}

				if (info.port) {
					params.push('--port')
					params.push(info.port)
				}

				natsProcesses.push(spawn('gnatsd', params))
			}
		} catch (e) {
			reject(e)
		}

		setTimeout(() => {
			resolve()
		}, 1000)
	})

const initNATS = () =>
	new Promise(resolve => {
		g.nats = new NATS({servers: config.nats.servers})
		resolve()
	})

const initDB = () =>
	new Promise((resolve, reject) => {
		g.db = {}
		const db = new DB(help.buildPGDBConncetionString(dbConfig.test))
		db.connect()
			.then(() => {
				g.db.main = db
				resolve()
			})
			.catch(reject)
	})

const dbUp = () =>
	new Promise((resolve, reject) => {
		exec(`${migratePath} up --config ${__base}/database.json -e test`, err => {
			if (err) {
				return reject(err)
			}

			console.log(`Migrate up done`) // eslint-disable-line no-console
			resolve()
		})
	})

const dbDown = () =>
	new Promise((resolve, reject) => {
		exec(`${migratePath} down --count 9999 --config ${__base}/database.json -e test`, err => {
			if (err) {
				return reject(err)
			}

			console.log(`Migrate down done`) // eslint-disable-line no-console
			resolve()
		})
	})

before(function(done) {		// eslint-disable-line prefer-arrow-callback
	this.timeout(4000)

	dbUp()
		.then(() => startMemcashed())
		.then(() => startNATS())
		.then(() => initDB())
		.then(() => initNATS())
		.then(() => server.start())
		.then(() => done())
		.catch(done)
})

after(done => {
	dbDown()
		.then(() => memcashedProcess.kill())
		.then(() => natsProcesses.map(proc => proc.kill()))
		.then(() => done())
})

require('./api/food.spec.js').test()
require('./api/dino.spec.js').test()
