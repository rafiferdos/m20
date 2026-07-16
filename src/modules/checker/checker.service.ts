import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'

const checkRoleFromDB = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true }
	})

	if (!user) throw new AppError(status.NOT_FOUND, 'User not found.')

	return { role: user.role }
}

export const CheckerService = {
	checkRole: checkRoleFromDB
}
