/* global __base */

const config = require(`${__base}/config.json`)
const nock = require('nock')

module.exports.login = (secret, type = 'unknown') => {
	nock(config.distributedAddress)
		.get('/service/login')
		.query({secret})
		.reply(200, {
			type,
		}, {
			'set-cookie': ['SID=foo'],
		})
}

module.exports.serviceList = data => {
	nock(config.distributedAddress)
		.get('/service')
		.reply(200, data)
}
