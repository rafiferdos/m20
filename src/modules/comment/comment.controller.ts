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
	const authorId = req.user?.id as string
	const payload = req.body
	const result = await CommentService.create(authorId as string, payload)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'Comment created',
		data: result
	})
})

const getAllByPostId = catchAsync(async (req: Request, res: Response) => {
	const { postId } = req.params
	const comments = await CommentService.getAllByPostId(postId as string)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'Comments retrieved successfully',
		data: comments
	})
})

const updateComment = catchAsync(async (req: Request, res: Response) => {
	const { commentId } = req.params
	const payload = req.body
	const result = await CommentService.update(commentId as string, payload)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'Comment updated',
		data: result
	})
})

const deleteComment = catchAsync(async (req: Request, res: Response) => {
	const { commentId } = req.params
	await CommentService.delete(commentId as string)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'Comment deleted'
	})
})

export const CommentController = {
	getAllByAuthorId,
	create: createComment,
	delete: deleteComment,
	getAllByPostId,
	update: updateComment
}
