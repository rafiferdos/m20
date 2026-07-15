import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'

const getCommentsByAuthorIdFromDB = async (authorId: string) => {
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: authorId
		},
		include: {
			comments: true
		}
	})
	if (!user) throw new AppError(status.NOT_FOUND, 'User not found')

	const comments = user.comments
	return comments
}

export const CommentService = {
	getAllByAuthorId: getCommentsByAuthorIdFromDB
}
