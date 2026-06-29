import catchAsync from '@/utils/catchAsync.js'
import type { Request, Response } from 'express'

const loginUser = catchAsync(async (req: Request, res: Response) => {})

export const AuthControllers = {
	login: loginUser
}
