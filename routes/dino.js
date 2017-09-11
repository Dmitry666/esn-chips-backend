/* global __base */

const dinoHandler = require(`${__base}/handlers/dino`)

module.exports = app => {
	app.get('/dino', dinoHandler.list)
	app.post('/dino', dinoHandler.create)
	app.get('/dino/:id', dinoHandler.view)
	app.get('/dino/:id/feed', dinoHandler.feed)
	app.get('/dino/:id/anger', dinoHandler.anger)
}