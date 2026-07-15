import { prisma } from '@/lib/prisma.js'

const getCommentsByAuthorIdFromDB = async (authorId: string) => {
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: authorId
		},
		include: {
			comments: true
		}
	})

	const comments = user.comments
	return comments
}

export const CommentService = {
	getAllByAuthorId: getCommentsByAuthorIdFromDB
}
