import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { AuthServices } from './auth.service.js'

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body
	const result = await AuthServices.login(payload)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User logged in successfully',
		data: result
	})
})

export const AuthControllers = {
	login: loginUser
}
