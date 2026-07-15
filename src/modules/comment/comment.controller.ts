import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { CommentService } from './comment.service.js'

const getCommentsByAuthorId = catchAsync(
	async (req: Request, res: Response) => {
		const { authorId } = req.params
		const comments = await CommentService.getAllByAuthorId(authorId as string)

		sendResponse(res, {
			statusCode: status.OK,
			message: 'Comments retrieved successfully',
			data: comments
		})
	}
)

export const CommentController = {
	getAll: getCommentsByAuthorId
}
