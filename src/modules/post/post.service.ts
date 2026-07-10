import { CommentStatus, PostStatus } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import status from 'http-status'
import type { ICreatePost, IUpdatePost } from './post.interface.js'

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

	// const getOnePostWithViewCount = await prisma.post.update({
	// 	where: {
	// 		id: postId
	// 	},
	// 	data: {
	// 		views: {
	// 			increment: 1
	// 		}
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

	// return getOnePostWithViewCount

	const transactionResult = await prisma.$transaction(async (tx) => {
		await tx.post.update({
			where: {
				id: postId
			},
			data: {
				views: {
					increment: 1
				}
			}
		})

		const post = await tx.post.findUniqueOrThrow({
			where: {
				id: postId
			},
			include: {
				author: {
					omit: {
						password: true
					}
				},
				comments: {
					where: {
						status: CommentStatus.APPROVED
					},
					orderBy: {
						createdAt: 'desc'
					}
				},
				_count: {
					select: {
						comments: true
					}
				}
			}
		})
		return post
	})
	return transactionResult
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

const getPostStatsFromDB = async () => {
	const transactionResult = await prisma.$transaction(async (tx) => {
		// Count total posts
		const totalPosts = await tx.post.count()
		const totalPublishedPosts = await tx.post.count({
			where: {
				status: PostStatus.PUBLISHED
			}
		})
		const totalDraftPosts = await tx.post.count({
			where: {
				status: PostStatus.DRAFT
			}
		})
		const totalArchievedPosts = await tx.post.count({
			where: {
				status: PostStatus.ARCHIVED
			}
		})
		const totalViews = await tx.post.aggregate({
			_sum: {
				views: true
			}
		})

		const totalComments = await tx.comment.count()
		const totalApprovedComments = await tx.comment.count({
			where: {
				status: CommentStatus.APPROVED
			}
		})
		const totalRejectedComments = await tx.comment.count({
			where: {
				status: CommentStatus.REJECTED
			}
		})
		return {
			totalPosts,
			totalPublishedPosts,
			totalDraftPosts,
			totalArchievedPosts,
			totalViews,
			totalComments,
			totalApprovedComments,
			totalRejectedComments
		}
	})
	return transactionResult
}

const updatePostInDB = async (
	postId: string,
	payload: IUpdatePost,
	authorId: string,
	isAdmin: boolean
) => {
	const post = await prisma.post.findUnique({
		where: {
			id: postId
		}
	})
	if (!isAdmin && post?.authorId !== authorId)
		throw new AppError(
			status.FORBIDDEN,
			'You are not allowed to update this post'
		)
	const result = await prisma.post.update({
		where: {
			id: postId
		},
		data: {
			...payload
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

const deletePostFromDB = async (
	postId: string,
	authorId: string,
	isAdmin: boolean
) => {
	const post = await prisma.post.findUnique({
		where: {
			id: postId
		}
	})
	if (!post) throw new AppError(status.NOT_FOUND, 'Post not found')
	if (!isAdmin && post?.authorId !== authorId)
		throw new AppError(
			status.FORBIDDEN,
			'You are not allowed to delete this post'
		)
	await prisma.post.delete({
		where: {
			id: postId
		}
	})
}

export const PostService = {
	create: createPostIntoDB,
	getAll: getAllPostsFromDB,
	getOne: getOnePostFromDB,
	getMyPosts: getMyPostsFromDB,
	update: updatePostInDB,
	delete: deletePostFromDB,
	getStats: getPostStatsFromDB
}
