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
	'icon',
	'title',
	'description',
	'icon',
]

// Get inerviews for a user
const getChips = (userID, db = g.db.main) =>
	new Promise((resolve, reject) => {

		let sql = `SELECT c.*
						FROM chip c`

		db.query(sql, [])
			.then(result => {

				resolve(result.rows)
			})
			.catch(reject)
	})

// Create
const createChip = (data, db = g.db.main) =>
	new Promise((resolve, reject) => {
		const safeData = help.filterSafeParams(SAFE_FIELDS, data)
		const res = help.objToSQLInsert(safeData)
		const sql = `INSERT INTO chip
						(${res.columns.join(',')})
						VALUES (${res.keys.join(',')})
						RETURNING *`
		db.query(sql, res.values)
			.then(result => resolve(result.rows[0]))
			.catch(reject)
	})

// Get interview info.
const getChip = (chipID, db = g.db.main) =>
	new Promise((resolve, reject) => {

		const sql = `SELECT c.*
						FROM chip c
						WHERE c.id = $1`

		db.query(sql, [interviewID])
			.then(result => {
				resolve(result.rows)
			})
			.catch(reject)
	})

// Get interview list by a user.
module.exports.list = (req, res) => {

	const count = req.query.count && req.query.count > 0 ? Math.min(MAX_COUNT, req.query.count) : DEFAULT_COUNT
	const userID = req.session.userID

	getChips(userID)
		.then(([chipList]) => {

			//console.log(result)
			res.send(chipList)
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
	createChip(req.body)
		.then(chip => {
			res.json(chip)
		})
		.catch(err => ErrorHandler.response(res, err))
}

// Get chip by id.
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

	const chipID = req.params.id

	getChip(chipID)
		.then(chip => {
			if (!chip) {
				throw new HttpError(404, 'Tag not found')
			}

			res.json(chip)
		})
		.catch(err => ErrorHandler.response(res, err))
}

// Accept interview.
module.exports.crack = (req, res) => {

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

	const chipID = req.params.id
	const userID = req.session.userID

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
module.exports.ignore = (req, res) => {

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

	const chipID = req.params.id
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