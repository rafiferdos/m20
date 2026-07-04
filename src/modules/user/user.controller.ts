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
	const profile = await UserService.getProfile(req.user!.id)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User profile retrieved successfully',
		data: profile
	})
})

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.id
	const payload = req.body

	const updatedProfile = await UserService.updateProfile(userId!, payload)

	sendResponse(res, {
		statusCode: status.OK,
		message: 'User profile updated successfully',
		data: updatedProfile
	})
})

export const UserController = {
	register: registerUser,
	getMyProfile,
	updateProfile: updateMyProfile
}
