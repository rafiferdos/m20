import { AppError } from '@/utils/appError.js'
import type { NextFunction, Request, Response } from 'express'
import status from 'http-status'

/* ------------------------------------------------------------------ */
/*  404 Not Found middleware                                          */
/*                                                                    */
/*  Must be registered AFTER all routes, BEFORE globalErrorHandler.   */
/*                                                                    */
/*  app.use(notFound)                                                 */
/*  app.use(globalErrorHandler)                                       */
/*                                                                    */
/*  We forward to next() instead of responding directly so that       */
/*  globalErrorHandler handles the response — keeping all error       */
/*  formatting, logging, and Prisma handling in one place.            */
/* ------------------------------------------------------------------ */

const notFound = (req: Request, _res: Response, next: NextFunction): void =>
	next(
		new AppError(
			status.NOT_FOUND,
			`${req.method} ${encodeURI(req.originalUrl)} — route not found`
		)
	)

export default notFound
