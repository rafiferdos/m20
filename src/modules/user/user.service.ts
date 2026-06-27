import config from '@/config/index.js'
import { prisma } from '@/lib/prisma.js'
import bcrypt from 'bcryptjs'
import type { IUserRegisterPayload } from './user.interface.js'

const registerUserIntoDB = async (payload: IUserRegisterPayload) => {
	const { name, email, password, profilePhoto } = payload

	const user = await prisma.user.findUnique({
		where: { email }
	})
	if (user) throw new Error('User already exists')

	const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds)

	const newUser = await prisma.user.create({
		data: {
			name,
			email,
			password: passwordHash
		}
	})
	await prisma.profile.create({
		data: {
			userId: newUser.id,
			profilePhoto: profilePhoto || null
		}
	})

	const result = await prisma.user.findUnique({
		where: {
			id: newUser.id,
			email: newUser.email || email
		},
		include: {
			profile: true
		},
		omit: {
			password: true
		}
	})
	return result
}

export const UserService = {
	register: registerUserIntoDB
}
