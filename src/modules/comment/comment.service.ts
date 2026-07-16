import { prisma } from '@/lib/prisma.js'
import type {
	ICommentCreate,
	ICommentStatusUpdate,
	ICommentUpdate
} from './comment.interface.js'

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
	await prisma.post.findUniqueOrThrow({
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

const getCommentsByPostIdFromDB = async (postId: string) => {
	const comments = await prisma.comment.findMany({
		where: {
			postId
		},
		include: {
			author: {
				select: {
					id: true,
					name: true,
					email: true
				}
			},
			post: {
				select: {
					id: true,
					title: true,
					content: true
				}
			}
		}
	})
	return comments
}

const updateCommentIntoDB = async (
	commentId: string,
	payload: ICommentUpdate
) => {
	const comment = await prisma.comment.update({
		where: {
			id: commentId
		},
		data: payload
	})
	return comment
}

const deleteCommentFromDB = async (commentId: string) => {
	await prisma.comment.delete({
		where: {
			id: commentId
		}
	})
}

const moderateCommentInDB = async (
	commentId: string,
	status: ICommentStatusUpdate
) => {
	const result = await prisma.comment.update({
		where: {
			id: commentId
		},
		data: {
			status: status.status
		}
	})
	return result
}

export const CommentService = {
	getAllByAuthorId: getCommentsByAuthorIdFromDB,
	create: createComment,
	update: updateCommentIntoDB,
	delete: deleteCommentFromDB,
	getAllByPostId: getCommentsByPostIdFromDB,
	moderate: moderateCommentInDB
}
