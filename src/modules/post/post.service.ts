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

const getOnePostFromDB = async (postId: string) => {
	// const result = await prisma.post.findUniqueOrThrow({
	// 	where: {
	// 		id: postId
	// 	},
	// 	include: {
	// 		author: {
	// 			omit: {
	// 				password: true
	// 			}
	// 		},
	// 		comments: true
	// 	}
	// })

	const getOnePostWithViewCount = await prisma.post.update({
		where: {
			id: postId
		},
		data: {
			views: {
				increment: 1
			}
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

	return getOnePostWithViewCount
}

const getMyPostsFromDB = async (userId: string) => {
	const result = await prisma.post.findMany({
		where: {
			authorId: userId
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
			comments: true,
			_count: {
				select: {
					comments: true
				}
			}
		}
	})
	return result
}

export const PostService = {
	create: createPostIntoDB,
	getAll: getAllPostsFromDB,
	getOne: getOnePostFromDB,
	getMyPosts: getMyPostsFromDB
}
