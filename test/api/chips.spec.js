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
	title: 'test0',
	description: 'test0',
	icon: 'no_url',
}, {
	title: 'test1',
	description: 'test1',
	icon: 'no_url',
}, {
	title: 'test2',
	description: 'test2',
	icon: 'no_url',
}, {
	title: 'test3',
	description: 'test3',
	icon: 'no_url',
}, {
	title: 'test4',
	description: 'test4',
	icon: 'no_url',
}]

const values = data.reduce((arr, item) => {
	arr = [
		...arr,
		item.title,
		item.description,
		item.icon,
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

	// '/interview', interviewHandler.list
	describe('Tag api', () => {
		describe('get /chips', () => {
			let chips = []

			// Append test data.
			beforeEach(done => {
				const sql = `INSERT INTO chip
									(title, description, icon)
									VALUES ${rows.join(',')}
									RETURNING *`
				g.db.main.query(sql, values)
					.then(result => {
						chips = result.rows

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
				g.db.main.query(`DELETE FROM chip_user WHERE user_id = 1`)
					.then(() => g.db.main.query(`DELETE FROM chip WHERE id IN (${chips.map(chip => chip.id).join(',')})`))
					.then(() => done())
					.catch(done)
			})

			// Run.
			it('get /chips', done => {

				// Test user.
				sessionMock.mocks.push({
					userID: 1,
				})

				request({
					uri: `${serviceAddress}/chips`,
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

		// '/interview', interviewHandler.create
		describe('post /chips', () => {
			let chip = null

			// Delete data.
			afterEach(done => {
				if (!chip) {
					return done()
				}

				g.db.main.query('DELETE FROM chip WHERE id = $1', [chip.id])
					.then(() => done())
					.catch(done)
			})

			// Run.
			it('post /chips', done => {
				const chipData = data[0]

				// Test user.
				sessionMock.mocks.push({
					userID: 1,
				})

				request({
					uri: `${serviceAddress}/chips`,
					method: 'POST',
					json: chipData,
				})
					.then(({response, body}) => {
						assert.equal(response.statusCode, 200, body)
						chip = body
						done()
					})
					.catch(done)
			})
		})

		// '/interview/:id', interviewHandler.view
		describe('/chips/:id', () => {
			const res = help.objToSQLInsert(data[0])
			let chip = null

			// Append data.
			beforeEach(done => {
				const sql = `INSERT INTO chip
									(${res.columns.join(',')})
									VALUES (${res.keys.join(',')})
									RETURNING *`
				g.db.main.query(sql, res.values)
					.then(result => {
						chip = result.rows[0]
					})
					.then(() => done())
					.catch(done)
			})

			// Delete data.
			afterEach(done => {
				g.db.main.query(`DELETE FROM chip WHERE id = $1`, [chip.id])
					.then(() => done())
					.catch(done)
			})

			// Run.
			it('/chips/:id', done => {
				request({
					uri: `${serviceAddress}/chips/${chip.id}`,
					json: {},
				})
					.then(({response, body}) => {
						assert.equal(response.statusCode, 200, body)

						done()
					})
					.catch(done)
			})
		})

		// '/interview/:id/accept', interviewHandler.accept
		describe('/chips/:id/accept', () => {

			const res = help.objToSQLInsert(data[0])
			let chip = null

			// Append data.
			beforeEach(done => {
				const sql = `INSERT INTO chip
								(${res.columns.join(',')})
								VALUES (${res.keys.join(',')})
								RETURNING *`
				g.db.main.query(sql, res.values)
					.then(result => {
						chip = result.rows[0]

						const sql = `INSERT INTO chip_user
										(chip_id, user_id, answer)
										VALUES ($1, $2, $3)
										RETURNING *`
						return g.db.main.query(sql, [chip.id, 1, 0])
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

		// '/interview/:id/reject', interviewHandler.reject
		describe('/chips/:id/ignore', () => {

			const res = help.objToSQLInsert(data[0])
			let chip = null

			// Append data.
			beforeEach(done => {
				const sql = `INSERT INTO chip
								(${res.columns.join(',')})
								VALUES (${res.keys.join(',')})
								RETURNING *`
				g.db.main.query(sql, res.values)
					.then(result => {
						chip = result.rows[0]

						const sql = `INSERT INTO chip_user
										(chip_id, user_id, answer)
										VALUES ($1, $2, $3)
										RETURNING *`
						return g.db.main.query(sql, [chip.id, 1, 0])
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
			it('/chips/:id/reject', done => {

				// Test user.
				sessionMock.mocks.push({
					userID: 1,
				})

				request({
					uri: `${serviceAddress}/chips/${chip.id}/reject`,
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
