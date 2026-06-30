import { prisma } from '@/lib/prisma.js'
import bcrypt from 'bcryptjs'
import type { ILoginUser } from './auth.interface.js'

const loginUserIntoDB = async (payload: ILoginUser) => {
	const { email, password } = payload

	const user = await prisma.user.findUniqueOrThrow({
		where: { email }
	})

	if (!user) throw new Error('User not found')

	const isPasswordMatched = await bcrypt.compare(password, user.password)
	if (!isPasswordMatched) throw new Error('Invalid password')

	const { password: _password, ...userWithoutPassword } = user
	return userWithoutPassword
}

export const AuthServices = {
	login: loginUserIntoDB
}
