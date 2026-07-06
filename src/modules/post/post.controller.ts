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

export const PostController = {
	create: createPost
}
