import catchAsync from '@/utils/catchAsync.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { UserService } from './user.service.js'
import sendResponse from '@/utils/sendResponse.js'

const registerUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body

	const result = await UserService.register(payload)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User registered successfully',
		data: result
	})
})

export const UserController = {
	register: registerUser
}
