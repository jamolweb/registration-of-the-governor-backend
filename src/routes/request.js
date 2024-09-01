const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const authenticateToken = require('../middlewares/auth')

function adjustTimeBy5Hours(date) {
	date.setHours(date.getHours() + 5)
	return date
}

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
		const requests = await prisma.request.findMany({
			where,
			orderBy: { createdAt: 'asc' },
		})
		res.json(requests)
	} catch (error) {
		console.error('Error fetching requests:', error)
		res.status(500).json({ message: 'Error retrieving requests' })
	}
})

router.get('/', authenticateToken, async (req, res) => {
	const requests = await prisma.request.findMany({
		orderBy: { createdAt: 'asc' },
	})
	res.json(requests)
})

router.get('/:id', authenticateToken, async (req, res) => {
	const { id } = req.params
	const request = await prisma.request.findUnique({ where: { id } })
	if (!request) return res.status(404).json({ message: 'Request not found' })
	res.json(request)
})

router.delete('/:id', authenticateToken, async (req, res) => {
	const { id } = req.params

	try {
		const request = await prisma.request.findUnique({ where: { id } })

		if (!request) {
			return res.status(404).json({ message: 'Request not found' })
		}

		await prisma.doneRequest.create({
			data: {
				firstName: request.firstName,
				lastName: request.lastName,
				summary: request.summary,
				phoneNumberFromTelegram: request.phoneNumberFromTelegram,
				phoneNumber: request.phoneNumber,
				requestedAt: request.createdAt,
				requestNumber: request.globalRequestNumber,
				createdAt: adjustTimeBy5Hours(new Date()).toLocaleString(),
			},
		})

		await prisma.request.delete({ where: { id } })

		return res.status(200).json({ message: 'Request deleted successfully' })
	} catch (error) {
		console.error('Error handling request deletion:', error)
		res.status(500).json({ message: 'Internal server error' })
	}
})

module.exports = router