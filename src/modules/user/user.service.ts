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

	const passwordHash = await bcrypt.hash(
		password,
		Number(config.bcryptSaltRounds)
	)

	const newUser = await prisma.user.create({
		data: {
			name,
			email,
			password: passwordHash,
			profile: {
				create: {
					profilePhoto: profilePhoto || null
				}
			}
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

const getMyProfileFromDB = async (userId: string) => {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		include: {
			profile: true
		},
		omit: {
			password: true
		}
	})
	return user
}

export const UserService = {
	register: registerUserIntoDB,
	getMyProfile: getMyProfileFromDB
}
