import catchAsync from '@/utils/catchAsync.js'
import sendResponse from '@/utils/sendResponse.js'
import type { Request, Response } from 'express'
import status from 'http-status'
import { PremiumService } from './premium.service.js'

const getPremiumContent = catchAsync(async (req: Request, res: Response) => {
	const premiumContents = await PremiumService.premiumContent()

	sendResponse(res, {
		statusCode: status.OK,
		message: 'Successfully retrieved premium contents',
		data: premiumContents
	})
})

export const PremiumController = {
	premium: getPremiumContent
}
