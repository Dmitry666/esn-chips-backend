/* global __base */

const config = require(`${__base}/config.json`)

const fs = require('fs')
const express = require('express')
const session = require('express-session')
const expressValidator = require('express-validator')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const MemcachedStore = require('connect-memcached')(session)

const https = require('https')
const http = require('http')

const privateKey = fs.readFileSync(`${__base}/cert/key.pem`, 'utf8')	// eslint-disable-line no-sync
const certificate = fs.readFileSync(`${__base}/cert/cert.pem`, 'utf8')	// eslint-disable-line no-sync
const credentials = {key: privateKey, cert: certificate}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const app = express()
app.set('json spaces', '\t')

app.use(cookieParser())
app.use(
	session({
		secret: config.sessionSecret,
		key: 'SID',
		proxy: true,
		resave: false,
		saveUninitialized: false,
		store: new MemcachedStore({
			hosts: config.memchashed.hosts,
			secret: config.memchashed.secret,
		}),
	})
)

if (process.env.NODE_ENV === 'test') {
	app.use(require('esn-lib').test.mocks.sessionMock.middleware())
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(expressValidator({
	customValidators: {
		isArray: value => Array.isArray(value),
		isPoint: value => {
			if (!Array.isArray(value) || value.length !== 2) {
				return false
			}

			for (const coord of value) {
				if (!parseFloat(coord)) {
					return false
				}
			}

			return true
		},
	},
}))

require(`${__base}/routes/chips`)(app)

const start = () => {
	const server = config.protocol === 'https'
		? https.createServer(credentials, app)
		: http.createServer(app)

	server.listen(config.port, () => {
		console.log(`Start server on port ${config.port}, protocol ${config.protocol}`)		// eslint-disable-line no-console
	})
}

exports.start = start
exports.app = app
