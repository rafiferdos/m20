import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { CommentService } from './comment.service.js'

const getAllByAuthorId = catchAsync(async (req: Request, res: Response) => {
	const { authorId } = req.params
	const comments = await CommentService.getAllByAuthorId(authorId as string)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'Comments retrieved successfully',
		data: comments
	})
})

const createComment = catchAsync(async (req: Request, res: Response) => {
	const { authorId } = req.params
	const payload = req.body
	const result = await CommentService.create(authorId as string, payload)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'Comment created',
		data: result
	})
})

export const CommentController = {
	getAllByAuthorId,
	create: createComment
}
