import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type { IUserRole } from './checker.interface.js'

const checkRoleFromDB = async (userId: string, role: IUserRole) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			id: true,
			role: true
		}
	})

	if (!user) throw new AppError(status.NOT_FOUND, 'User not found.')
	if (user.role !== role.role)
		throw new AppError(status.FORBIDDEN, 'Insufficient permissions')

	return { userId: user.id, role: user.role, hasRole: user.role === role.role }
}

export const CheckerService = {
	checkRole: checkRoleFromDB
}
