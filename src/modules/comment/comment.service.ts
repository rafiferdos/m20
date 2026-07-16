import { prisma } from '@/lib/prisma.js'
import type { ICommentCreate } from './comment.interface.js'

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

const createComment = async (authorId: string, payload: ICommentCreate) => {
	await prisma.comment.findUniqueOrThrow({
		where: {
			id: payload.postId
		}
	})

	const comment = await prisma.comment.create({
		data: {
			...payload,
			authorId
		}
	})
	return comment
}

export const CommentService = {
	getAllByAuthorId: getCommentsByAuthorIdFromDB,
	create: createComment
}
