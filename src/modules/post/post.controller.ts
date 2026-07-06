import { AppError } from '@/utils/appError.js'
import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { PostService } from './post.service.js'

const createPost = catchAsync(async (req: Request, res: Response) => {
	const id = req.user?.id
	const payload = req.body

	const result = await PostService.create(payload, id as string)

	sendResponse(res, {
		statusCode: status.CREATED,
		message: 'Post created successfully',
		data: result
	})
})

const getAllPosts = catchAsync(async (_req: Request, res: Response) => {
	const result = await PostService.getAll()

	sendResponse(res, {
		statusCode: status.OK,
		message: 'Posts retrieved successfully',
		data: result
	})
})

const getOnePost = catchAsync(async (req: Request, res: Response) => {
	const postId = req.params.postId
	if (!postId)
		throw new AppError(
			status.BAD_REQUEST,
			'Post ID is required to search for a post'
		)

	const result = await PostService.getOne(postId as string)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'Post retrieved successfully',
		data: result
	})
})

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id
	if (!userId)
		throw new AppError(
			status.BAD_REQUEST,
			'User ID is required to search for posts'
		)

	const result = await PostService.getMyPosts(userId as string)

	if (!result || result.length === 0)
		throw new AppError(status.NOT_FOUND, 'No posts found for this user')

	sendResponse(res, {
		statusCode: status.OK,
		message: 'My posts retrieved successfully',
		data: result
	})
})

export const PostController = {
	create: createPost,
	getAll: getAllPosts,
	getOne: getOnePost,
	myPosts: getMyPosts
}
