require('dotenv').config()
const jwt = require('jsonwebtoken')

function authenticateToken(req, res, next) {
	const authHeader = req.header('Authorization')
	if (!authHeader)
		return res.status(401).json({ message: 'Authorization header missing' })

	const token = authHeader.split(' ')[1]
	if (!token) return res.status(401).json({ message: 'Token missing' })

	try {
		const verified = jwt.verify(token, process.env.TOKEN_SECRET)
		req.user = verified
		next()
	} catch (err) {
		res.status(403).json({ message: 'Invalid token' })
	}
}

module.exports = authenticateToken
