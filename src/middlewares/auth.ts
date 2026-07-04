import config from '@/config/index.js'
import type { Role } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import catchAsync from '@/utils/catchAsync.js'
import JwtUtils from '@/utils/jwt.js'
import type { NextFunction, Request, Response } from 'express'
import type { JwtPayload } from 'jsonwebtoken'

export const auth = (...roles: Role[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const token =
			req.cookies?.accessToken ? req.cookies.accessToken
			: req.headers.authorization?.startsWith('Bearer ') ?
				req.headers.authorization.split(' ')[1]
			:	req.headers.authorization

		if (!token)
			throw new Error('You are not authorized to access this resource')

		const verifiedToken = JwtUtils.verifyToken(token, config.jwtSecret)
		if (!verifiedToken.ok)
			throw new Error('You are not authorized to access this resource')

		const { id, email, name, role } = verifiedToken.data as JwtPayload
		if (roles.length && !roles.includes(role as Role))
			throw new Error('You are not authorized to access this resource')

		const user = await prisma.user.findUniqueOrThrow({
			where: {
				id: id,
				email: email,
				name: name,
				role: role
			}
		})

		if (user.activeStatus === 'BLOCKED')
			throw new Error(
				'Your account has been blocked. Please contact support for assistance.'
			)

		req.user = {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role
		}
		next()
	})
}
