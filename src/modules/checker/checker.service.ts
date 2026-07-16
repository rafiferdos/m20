import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type { IUserRole } from './checker.interface.js'

const checkRoleFromDB = async (userId: string, role: IUserRole) => {
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			role: true
		}
	})

	if (user.role !== role.role)
		throw new AppError(status.FORBIDDEN, 'Insufficient permissions')
}

export const CheckerService = {
	checkRole: checkRoleFromDB
}
