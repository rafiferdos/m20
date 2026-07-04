import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { UserService } from './user.service.js'

const registerUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body

	const result = await UserService.register(payload)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User registered successfully',
		data: result
	})
})

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
	const profile = await UserService.getMyProfile(req.user!.id)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User profile retrieved successfully',
		data: profile
	})
})

export const UserController = {
	register: registerUser,
	getMyProfile
}
