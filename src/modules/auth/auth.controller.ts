import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { AuthServices } from './auth.service.js'

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body
	const result = await AuthServices.login(payload)

	res.cookie('refreshToken', result.refreshToken, {
		httpOnly: true,
		secure: false, // Set to true in production when using HTTPS
		sameSite: 'none',
		maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
	})

	res.cookie('accessToken', result.accessToken, {
		httpOnly: true,
		secure: false, // Set to true in production when using HTTPS
		sameSite: 'none',
		maxAge: 15 * 60 * 1000 // 15 minutes
	})

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User logged in successfully',
		data: result
	})
})

export const AuthControllers = {
	login: loginUser
}
