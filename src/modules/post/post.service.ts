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

export const PostService = {
	create: createPostIntoDB
}
