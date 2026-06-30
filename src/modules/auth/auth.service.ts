import { prisma } from '@/lib/prisma.js'
import bcrypt from 'bcryptjs'
import type { ILoginUser } from './auth.interface.js'
import jwt, { type SignOptions } from 'jsonwebtoken'
import config from '@/config/index.js'
import { JwtUtils } from '@/utils/jwt.js'

const loginUserIntoDB = async (payload: ILoginUser) => {
	const { email, password } = payload

	const user = await prisma.user.findUniqueOrThrow({
		where: { email }
	})

	if (!user) throw new Error('User not found')

	const isPasswordMatched = await bcrypt.compare(password, user.password)
	if (!isPasswordMatched) throw new Error('Invalid password')

	// const { password: _password, ...userWithoutPassword } = user
	// return userWithoutPassword

	const jwtPayload = {
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role
	}
	const accessToken = JwtUtils.createToken(
		jwtPayload,
		config.jwtSecret,
		config.jwtExpiresIn
	)
	const refreshToken = JwtUtils.createToken(
		jwtPayload,
		config.jwtRefreshSecret,
		config.jwtRefreshExpiresIn
	)

	return {
		accessToken,
		refreshToken
	}
}

export const AuthServices = {
	login: loginUserIntoDB
}
