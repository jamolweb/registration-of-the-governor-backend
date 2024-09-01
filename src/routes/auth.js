require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const express = require('express')
const authenticateToken = require('../middlewares/auth')
const router = express.Router()
const prisma = new PrismaClient()

router.post('/login', async (req, res) => {
	const { username, password } = req.body

	try {
		const admin = await prisma.admin.findUnique({
			where: { username },
		})

		if (!admin) {
			return res.status(401).json({ message: 'Invalid credentials' })
		}

		const isMatch = await bcrypt.compare(password, admin.password)

		if (isMatch) {
			return res.json({
				token: jwt.sign(
					{
						id: admin.id,
						username: admin.username,
						fullName: 'admin',
						image: '/images/admin/photo.jpg',
					},
					process.env.TOKEN_SECRET,
					{
						expiresIn: '1d',
					}
				),
				userdata: {
					id: admin.id,
					username: admin.username,
					fullName: 'admin',
					image: '/images/admin/photo.jpg',
				},
			})
		} else {
			return res.status(401).json({ message: 'Invalid credentials' })
		}
	} catch (error) {
		return res.status(500).json({ message: 'Internal server error' })
	}
})

router.get('/refresh', authenticateToken, async (req, res) => {
	if (req.user) {
		return res.json(req.user)
	} else {
		return res.status(400).json({ message: 'Invalid token' })
	}
})

async function createAdmin(username, plainPassword) {
	try {
		const hashedPassword = bcrypt.hashSync(plainPassword, 10)

		const admin = await prisma.admin.create({
			data: {
				username: username,
				password: hashedPassword,
			},
		})

		console.log('Admin created successfully:', admin)
	} catch (error) {
		console.error('Error creating admin:', error)
	} finally {
		await prisma.$disconnect()
	}
}

// createAdmin('admin', 'admin')

module.exports = router
