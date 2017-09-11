/* global serviceAddress */

const {
	g,
	sha1,
	request,
	help,
	parseCookie,
} = require('esn-lib')
const assert = require('assert')
const sessionMock = require('esn-lib').test.mocks.sessionMock
//const userServiceMocs = require('../mocks/userService')

// Test Data.
const data = [{
	angry: '1.0',
	hungry: '1.0',
}]

const values = data.reduce((arr, item) => {
	arr = [
		...arr,
		item.angry,
		item.hungry,
	]

	return arr
}, [])
const fieldsCount = values.length / data.length
const rows = data.reduce((arr, item, index) => {
	const offset = index * fieldsCount
	const keys = []

	for (let i = 0; i < fieldsCount; i++) {
		keys.push(`$${offset + i + 1}`)
	}

	arr.push(`(${keys.join(',')})`)

	return arr
}, [])
// End

module.exports.test = () => {

	// '/dino', dinoHandler.list
	describe('Tag api', () => {
		describe('get /dino', () => {
			let dinos = []

			// Append test data.
			beforeEach(done => {
				const sql = `INSERT INTO dino
									(angry, hungry)
									VALUES ${rows.join(',')}
									RETURNING *`
				g.db.main.query(sql, values)
					.then(result => {
						dinos = result.rows

						/*
						Upgrade test. Add Answers (0, 1)
						const sql = `INSERT INTO interview_user
										(interview_id, user_id, answer)
										VALUES ($1, $2, $3)
										RETURNING *`
						return g.db.main.query(sql, [interview.id, 1, 0])
						*/

						done()
					})
					.catch(done)
			})

			// Delete test data.
			afterEach(done => {
				g.db.main.query(`DELETE FROM dino WHERE id IN (${dinos.map(dino => dino.id).join(',')})`)
					.then(() => done())
					.catch(done)
			})

			// Run.
			it('get /dino', done => {

				// Test user.
				sessionMock.mocks.push({
					userID: 1,
				})

				request({
					uri: `${serviceAddress}/dino`,
					json: {count: 3},
				})
					.then(({response, body}) => {

						assert.equal(response.statusCode, 200, body)
						assert.equal(body.length, data.length)
						done()
					})
					.catch(done)
			})
		})

		// '/dino', dinoHandler.create
		describe('post /dino', () => {
			let dino = null

			// Delete data.
			afterEach(done => {
				if (!dino) {
					return done()
				}

				g.db.main.query('DELETE FROM dino WHERE id = $1', [dino.id])
					.then(() => done())
					.catch(done)
			})

			// Run.
			it('post /dino', done => {
				const dinoData = data[0]

				// Test user.
				sessionMock.mocks.push({
					userID: 1,
				})

				request({
					uri: `${serviceAddress}/dino`,
					method: 'POST',
					json: dinoData,
				})
					.then(({response, body}) => {
						assert.equal(response.statusCode, 200, body)
						dino = body
						done()
					})
					.catch(done)
			})
		})

		// '/interview/:id', interviewHandler.view
		describe('/dino/:id', () => {
			const res = help.objToSQLInsert(data[0])
			let dino = null

			// Append data.
			beforeEach(done => {
				const sql = `INSERT INTO dino
									(${res.columns.join(',')})
									VALUES (${res.keys.join(',')})
									RETURNING *`
				g.db.main.query(sql, res.values)
					.then(result => {
						dino = result.rows[0]
					})
					.then(() => done())
					.catch(done)
			})

			// Delete data.
			afterEach(done => {
				g.db.main.query(`DELETE FROM dino WHERE id = $1`, [dino.id])
					.then(() => done())
					.catch(done)
			})

			// Run.
			it('/dino/:id', done => {
				request({
					uri: `${serviceAddress}/dino/${dino.id}`,
					json: {},
				})
					.then(({response, body}) => {
						assert.equal(response.statusCode, 200, body)

						done()
					})
					.catch(done)
			})
		})

		// '/dino/:id/accept', dinoHandler.accept
		describe('/dino/:id/accept', () => {

			const res = help.objToSQLInsert(data[0])
			let dino = null

			// Append data.
			beforeEach(done => {
				const sql = `INSERT INTO dino
								(${res.columns.join(',')})
								VALUES (${res.keys.join(',')})
								RETURNING *`
				g.db.main.query(sql, res.values)
					.then(result => {
						dino = result.rows[0]

						const sql = `INSERT INTO chip_user
										(chip_id, user_id, answer)
										VALUES ($1, $2, $3)
										RETURNING *`
						return g.db.main.query(sql, [dino.id, 1, 0])
					})
					.then(() => done())
					.catch(done)	
			})

			// Delete data.
			afterEach(done => {
				g.db.main.query(`DELETE FROM chip_user WHERE chip_id = $1 AND user_id = 1`, [chip.id])
					.then(() => g.db.main.query(`DELETE FROM chip WHERE id = $1`, [chip.id]))
					.then(() => done())
					.catch(done)
			})

			// Run.
			it('/chips/:id/crack', done => {

				// Test user.
				sessionMock.mocks.push({
					userID: 1,
				})

				request({
					uri: `${serviceAddress}/chips/${chip.id}/accept`,
					json: {},
				})
					.then(({response, body}) => {
						assert.equal(response.statusCode, 200, body)
						assert.equal(body.newValue.count, 1)
						done()
					})
					.catch(done)
			})
		})

		// '/dino/:id/reject', dinoHandler.reject
		describe('/dino/:id/ignore', () => {

			const res = help.objToSQLInsert(data[0])
			let dino = null

			// Append data.
			beforeEach(done => {
				const sql = `INSERT INTO dino
								(${res.columns.join(',')})
								VALUES (${res.keys.join(',')})
								RETURNING *`
				g.db.main.query(sql, res.values)
					.then(result => {
						dino = result.rows[0]

						const sql = `INSERT INTO chip_user
										(chip_id, user_id, answer)
										VALUES ($1, $2, $3)
										RETURNING *`
						return g.db.main.query(sql, [dino.id, 1, 0])
					})
					.then(() => done())
					.catch(done)	
			})

			// Delete data.
			afterEach(done => {
				g.db.main.query(`DELETE FROM chip_user WHERE chip_id = $1 AND user_id = 1`, [dino.id])
					.then(() => g.db.main.query(`DELETE FROM dino WHERE id = $1`, [dino.id]))
					.then(() => done())
					.catch(done)
			})

			// Run.
			it('/dino/:id/reject', done => {

				// Test user.
				sessionMock.mocks.push({
					userID: 1,
				})

				request({
					uri: `${serviceAddress}/dino/${dino.id}/reject`,
					json: {},
				})
					.then(({response, body}) => {
						assert.equal(response.statusCode, 200, body)
						assert.equal(body.newValue.count, 2)
						done()
					})
					.catch(done)
			})
		})
	})
}
