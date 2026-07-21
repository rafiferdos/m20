import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { NextFunction, Request, Response } from 'express'
import status from 'http-status'
import { SubscriptionService } from './subscription.service.js'

const createCheckoutSession = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const userId = req.user?.id
		const result = await SubscriptionService.create(userId as string)

		sendResponse(res, {
			statusCode: status.OK,
			message: 'Checkout completed successfully',
			data: result
		})
	}
)

const webhook = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const sig = req.headers['stripe-signature'] as string
		const event = req.body as Buffer

		await SubscriptionService.webhook(event, sig)

		sendResponse(res, {
			statusCode: status.OK,
			message: 'Webhook received successfully'
		})
	}
)

export const SubscriptionController = {
	checkout: createCheckoutSession,
	webhook
}
