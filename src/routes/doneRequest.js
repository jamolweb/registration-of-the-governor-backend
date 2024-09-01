const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authenticateToken = require('../middlewares/auth')

router.get('/', authenticateToken, async (req, res) => {
	const page = parseInt(req.query.page) || 1
	const limit = parseInt(req.query.limit) || 15

	console.log({ limit })

	try {
		const skip = (page - 1) * limit
		const doneRequests = await prisma.doneRequest.findMany({
			orderBy: { requestedAt: 'asc' },
			skip: skip,
			take: limit,
		})

		const totalDoneRequests = await prisma.doneRequest.count()
		const totalPages = Math.ceil(totalDoneRequests / limit)

		res.json({
			data: doneRequests,
			total: totalPages,
			page: page,
			limit: limit,
		})
	} catch (error) {
		console.error('Error fetching done requests:', error)
		res.status(500).json({ message: 'Error retrieving done requests' })
	}
})

router.get('/search', authenticateToken, async (req, res) => {
	const { search } = req.query
	let where = {}

	if (search) {
		where = {
			OR: [
				{ firstName: { contains: search, mode: 'insensitive' } },
				{ lastName: { contains: search, mode: 'insensitive' } },
				{ summary: { contains: search, mode: 'insensitive' } },
				{ phoneNumber: { contains: search, mode: 'insensitive' } },
			],
		}
	}

	try {
		const requests = await prisma.doneRequest.findMany({
			where,
			orderBy: { createdAt: 'asc' },
		})
		res.json(requests)
	} catch (error) {
		console.error('Error fetching requests:', error)
		res.status(500).json({ message: 'Error retrieving requests' })
	}
})

router.get('/:id', authenticateToken, async (req, res) => {
	const { id } = req.params

	try {
		const doneRequest = await prisma.doneRequest.findUnique({ where: { id } })
		if (!doneRequest)
			return res.status(404).json({ message: 'DoneRequest not found' })

		res.json(doneRequest)
	} catch (error) {
		console.error('Error fetching done request:', error)
		res.status(500).json({ message: 'Internal server error' })
	}
})

module.exports = router