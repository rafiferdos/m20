import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { CheckerService } from './checker.service.js'

const checkRole = catchAsync(async (req: Request, res: Response) => {
	const { role } = req.body
	const userId = req.user?.id as string

	const user = await CheckerService.checkRole(userId, role)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User role checked successfully',
		data: user
	})
})

export const CheckerController = {
	checkRole
}
