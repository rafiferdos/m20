import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { SubscriptionService } from './subscription.service.js'

const createCheckoutSession = catchAsync(
	async (req: Request, res: Response) => {
		const userId = req.user?.id
		const result = await SubscriptionService.create(userId as string)

		sendResponse(res, {
			statusCode: status.OK,
			message: 'Checkout session created successfully',
			data: result
		})
	}
)

export const SubscriptionController = { checkout: createCheckoutSession }
