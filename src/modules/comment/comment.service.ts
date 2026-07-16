import { prisma } from '@/lib/prisma.js'
import type { ICommentCreate } from './comment.interface.js'

const getCommentsByAuthorIdFromDB = async (authorId: string) => {
	const comments = await prisma.comment.findMany({
		where: {
			authorId
		},
		include: {
			post: {
				select: {
					id: true,
					title: true
				}
			}
		}
	})

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
