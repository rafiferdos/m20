import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import catchAsync from '@/utils/catchAsync.js'
import type { NextFunction, Request, Response } from 'express'
import status from 'http-status'

export const premiumGuard = () =>
	catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.id
		const subscription = await prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				subscription: {
					select: {
						subscriptionStatus: true
					}
				}
			}
		})

		if (
			!subscription ||
			subscription.subscription?.subscriptionStatus !== 'ACTIVE'
		) {
			throw new AppError(
				status.FORBIDDEN,
				'You need an active subscription to access premium content'
			)
		}

		next()
	})
