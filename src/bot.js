require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })

function adjustTimeBy5Hours(date) {
	date.setHours(date.getHours() + 5)
	return date
}

const isAllowedDay = () => {
	const adjustedTime = adjustTimeBy5Hours(new Date())
	const today = adjustedTime.getDay()
	return today === 4 || today === 6 || today === 5
}


const userStates = {}

bot.onText(/\/start/, async msg => {
	const chatId = msg.chat.id

	if (!isAllowedDay()) {
		bot.sendMessage(chatId, 'Bu bot faqat payshanba va juma kunlari ishlaydi.')
		return
	}

	userStates[chatId] = { step: 1 }
	bot.sendMessage(chatId, 'Ismingizni kiriting:')
})

bot.on('message', async msg => {
	const chatId = msg.chat.id

	if (msg.text && msg.text.startsWith('/')) return

	if (!userStates[chatId]) return

	const userState = userStates[chatId]

	switch (userState.step) {
		case 1:
			userState.firstName = msg.text
			userState.step = 2
			bot.sendMessage(chatId, 'Familyangizni kiriting:')
			break

		case 2:
			userState.lastName = msg.text
			userState.step = 3
			bot.sendMessage(
				chatId,
				"Murojaatning qisqacha mazmuni(suv masalasi, gaz masalasi, yo'l masalasi, moddiy yordam, pensiya...):"
			)
			break

		case 3:
			userState.summary = msg.text
			userState.step = 4
			bot.sendMessage(chatId, 'Telefon raqamingizni yuboring:', {
				reply_markup: {
					keyboard: [[{ text: 'Share Contact', request_contact: true }]],
					resize_keyboard: true,
					one_time_keyboard: true,
				},
			})
			break

		case 4:
			if (msg.contact) {
				userState.phoneNumberFromTelegram = msg.contact.phone_number
				userState.step = 5
				bot.sendMessage(chatId, 'Telefon raqamingizni kiriting:', {
					reply_markup: { remove_keyboard: true },
				})
			} else {
				bot.sendMessage(chatId, 'Iltimos, telefon raqamingizni yuboring.')
			}
			break

		case 5:
			userState.phoneNumber = msg.text
			userState.step = 6

			const createdAt = adjustTimeBy5Hours(new Date())
			const requestNumber = (await prisma.request.count()) + 1
			const globalRequestNumber = (await prisma.doneRequest.count()) + 1

			await prisma.request.create({
				data: {
					firstName: userState.firstName,
					lastName: userState.lastName,
					summary: userState.summary,
					phoneNumberFromTelegram: userState.phoneNumberFromTelegram,
					phoneNumber: userState.phoneNumber,
					createdAt,
					requestNumber,
					globalRequestNumber,
					createdAt: adjustTimeBy5Hours(new Date()).toLocaleString(),
				},
			})

			bot.sendMessage(
				chatId,
				`Tabriklaymiz sizning habaringiz muvaffaqiyatli ravishda yuborildi. Sizning navbatingiz: ${requestNumber}`
			)


			delete userStates[chatId]
			break

		default:
			bot.sendMessage(chatId, "Iltimos, /start buyrug'idan boshlang.")
			break
	}
})
