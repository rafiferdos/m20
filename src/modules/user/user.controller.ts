import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { UserService } from './user.service.js'
import { JwtUtils } from '@/utils/jwt.js'
import config from '@/config/index.js'

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
	const { accessToken } = req.cookies
	const verifiedToken = JwtUtils.verifyToken(accessToken, config.jwtSecret)

	if (typeof verifiedToken === 'string') throw new Error('Invalid token')
	
	const profile = await UserService.getMyProfile(verifiedToken.id as string)
	
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
