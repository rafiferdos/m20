import config from '@/config/index.js'
import type { Prisma } from '@/generated/prisma/client.js'
import { prisma } from '@/lib/prisma.js'
import bcrypt from 'bcryptjs'
import type { IUser, IUserRegisterPayload } from './user.interface.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'

const registerUserIntoDB = async (payload: IUserRegisterPayload) => {
	const { name, email, password, profilePhoto } = payload

	const user = await prisma.user.findUnique({
		where: { email }
	})
	if (user) throw new AppError(status.CONFLICT, 'User with this email already exists')

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

const updateMyProfileInDB = async (userId: string, payload: Partial<IUser>) => {
	const { name, email, profile } = payload

	const updateData: Prisma.UserUpdateInput = {
		name,
		email
	}

	if (profile) {
		const profileUpdate: Prisma.ProfileUpdateInput = {}

		if (profile.profilePhoto !== undefined) {
			profileUpdate.profilePhoto = profile.profilePhoto
		}
		if (profile.bio !== undefined) {
			profileUpdate.bio = profile.bio
		}

		updateData.profile = { update: profileUpdate }
	}

	const updatedUser = await prisma.user.update({
		where: { id: userId },
		data: {
			name,
			email,
			profile: {
				update: {
					profilePhoto: profile?.profilePhoto,
					bio: profile?.bio
				}
			}
		},
		omit: {
			password: true
		},
		include: {
			profile: true
		}
	})
	return updatedUser
}

export const UserService = {
	register: registerUserIntoDB,
	getProfile: getMyProfileFromDB,
	updateProfile: updateMyProfileInDB
}
