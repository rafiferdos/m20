import config from '@/config/index.js'
import catchAsync from '@/utils/catchAsync.js'
import { JwtUtils } from '@/utils/jwt.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { UserService } from './user.service.js'

type AuthPayload = {
	id: string
}

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
	const accessToken = req.cookies?.accessToken
	if (!accessToken) throw new Error('Access token is missing')

	const verifiedToken = JwtUtils.tryVerifyToken<AuthPayload>(
		accessToken,
		config.jwtSecret
	)

	if (!verifiedToken.ok)
		throw new Error(
			verifiedToken.error.kind === 'expired' ?
				'Access token has expired'
			:	'Invalid access token'
		)

	const profile = await UserService.getMyProfile(verifiedToken.payload.id)

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
