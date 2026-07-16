import { AppError } from '@/utils/appError.js'
import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { CheckerService } from './checker.service.js'

const checkRole = catchAsync(async (req: Request, res: Response) => {
	const { role } = req.body ?? {}
	const userId = req.user?.id as string

	if (!role) {
		throw new AppError(status.BAD_REQUEST, 'Role is required in the request body.')
	}

	const result = await CheckerService.checkRole(userId, { role })

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User role checked successfully',
		data: result
	})
})

export const CheckerController = {
	checkRole
}
