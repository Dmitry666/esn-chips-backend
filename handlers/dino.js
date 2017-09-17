const {
	g,
	sha1,
	help,
	natsSubjects,
	HttpError,
	ErrorHandler,
} = require('esn-lib')


const DEFAULT_COUNT = 5
const MAX_COUNT = 20

const SAFE_FIELDS = [
	'angry',
	'hungry',
]

// Get inerviews for a user
const getDinoList = (userID, db = g.db.main) =>
	new Promise((resolve, reject) => {

		let sql = `SELECT d.*
						FROM dino d`

		db.query(sql)
			.then(result => {

				resolve(result.rows)
			})
			.catch(reject)
	})

// Create
const createDino = (data, db = g.db.main) =>
	new Promise((resolve, reject) => {
		const safeData = help.filterSafeParams(SAFE_FIELDS, data)
		const res = help.objToSQLInsert(safeData)
		const sql = `INSERT INTO dino
						(${res.columns.join(',')})
						VALUES (${res.keys.join(',')})
						RETURNING *`
		db.query(sql, res.values)
			.then(result => resolve(result.rows[0]))
			.catch(reject)
	})

// Get interview info.
const getDino = (dinoID, db = g.db.main) =>
	new Promise((resolve, reject) => {

		const sql = `SELECT d.*
						FROM dino d
						WHERE d.id = $1`

		db.query(sql, [dinoID])
			.then(result => {
				resolve(result.rows)
			})
			.catch(reject)
	})

// Get interview list by a user.
module.exports.list = (req, res) => {

	const count = req.query.count && req.query.count > 0 ? Math.min(MAX_COUNT, req.query.count) : DEFAULT_COUNT
	const userID = req.session.userID

	getDinoList(userID)
		.then((dinoList) => {

			console.log(dinoList)
			res.send(dinoList)
		})
		.catch(err => {
			ErrorHandler.response(res, err)
		})
}

// Create new interview.
module.exports.create = (req, res) => {

	req.checkBody({
		title: {
			notEmpty: {
				errorMessage: 'required',
			},
		},
		description: {
			notEmpty: {
				errorMessage: 'required',
			},
		},
		icon: {
			notEmpty: {
				errorMessage: 'required',
			},
		},
	})

	if (req.validationErrors()) {
		return res.status(404).send(help.errorsToStr(req.validationErrors()))
	}

	// tag cloud.
	createDino(req.body)
		.then(dino => {
			res.json(dino)
		})
		.catch(err => ErrorHandler.response(res, err))
}

// Get dino by id.
module.exports.view = (req, res) => {

	req.checkParams({
		id: {
			notEmpty: {
				errorMessage: 'required',
			},
			isInt: {
				errorMessage: 'Must be integer',
			},
		},
	})

	if (req.validationErrors()) {
		return res.status(404).send(help.errorsToStr(req.validationErrors()))
	}

	const dinoID = req.params.id

	getChip(dinoID)
		.then(dino => {
			if (!dino) {
				throw new HttpError(404, 'Tag not found')
			}

			res.json(dino)
		})
		.catch(err => ErrorHandler.response(res, err))
}

// Accept interview.
module.exports.feed = (req, res) => {

	req.checkParams({
		id: {
			notEmpty: {
				errorMessage: 'required',
			},
			isInt: {
				errorMessage: 'Must be integer',
			},
		},
	})

	if (req.validationErrors()) {
		return res.status(404).send(help.errorsToStr(req.validationErrors()))
	}

	const dinoID = req.params.id
	const userID = req.session.userID
	const foodType = 1;

	// anger up
	// level up
	// hungry up
/*
	updateInterviewAnswer(interviewID, userID, 1)
		.then((result) => {
			res.send(result)
		})
		.catch(err => {
			ErrorHandler.response(res, err)
		})
*/
}
	
// Reject interview.
module.exports.anger = (req, res) => {

	req.checkParams({
		id: {
			notEmpty: {
				errorMessage: 'required',
			},
			isInt: {
				errorMessage: 'Must be integer',
			},
		},
	})

	if (req.validationErrors()) {
		return res.status(404).send(help.errorsToStr(req.validationErrors()))
	}

	const dinoID = req.params.id
	const userID = req.session.userID
/*	
	updateInterviewAnswer(interviewID, userID, 2)
		.then((result) => {
			res.send(result)
		})
		.catch(err => {
			ErrorHandler.response(res, err)
		})
*/
}