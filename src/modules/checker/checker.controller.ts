import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { CheckerService } from './checker.service.js'

const checkRole = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id as string
	const result = await CheckerService.checkRole(userId)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User role retrieved successfully',
		data: result
	})
})

export const CheckerController = {
	checkRole
}
