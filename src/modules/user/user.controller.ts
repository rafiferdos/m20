import type { Request, Response } from 'express'
import status from 'http-status'
import { UserService } from './user.service.js'

const registerUser = async (req: Request, res: Response) => {
	try {
		const payload = req.body

		const result = await UserService.register(payload)

		res.status(status.OK).json({
			message: 'User registered successfully',
			data: result
		})
	} catch (error) {
		res.status(status.BAD_REQUEST).json({
			message: 'User registration failed',
			error: error instanceof Error ? error.message : 'Unknown error'
		})
	}
}

export const UserController = {
	register: registerUser
}
