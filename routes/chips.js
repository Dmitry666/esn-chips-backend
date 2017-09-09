/* global __base */

const chipsHandler = require(`${__base}/handlers/chips`)

module.exports = app => {
	app.get('/chips', chipsHandler.list)
	app.post('/chips', chipsHandler.create)
	app.get('/chips/:id', chipsHandler.view)
	app.get('/chips/:id/crack', chipsHandler.accept)
	app.get('/chips/:id/ignore', chipsHandler.reject)
}