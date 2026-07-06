import { prisma } from '@/lib/prisma.js'
import type { ICreatePost } from './post.interface.js'

const createPostIntoDB = async (payload: ICreatePost, userId: string) => {
	const result = await prisma.post.create({
		data: {
			...payload,
			authorId: userId
		}
	})
	return result
}

const getAllPostsFromDB = async () => {
	const result = await prisma.post.findMany({
		where: {
			status: 'PUBLISHED'
		},
		orderBy: {
			createdAt: 'desc'
		},
		include: {
			author: {
				omit: {
					password: true
				}
			},
			comments: true
		}
	})
	return result
}

export const PostService = {
	create: createPostIntoDB,
	getAll: getAllPostsFromDB
}
