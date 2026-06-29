import type { Response } from 'express'

/* -------------------------------------------------------------------------- */
/*                                   STATUS                                   */
/* -------------------------------------------------------------------------- */

type SuccessStatusCode = 200 | 201 | 202
type NoContentStatusCode = 204
type ErrorStatusCode =
	| 400
	| 401
	| 403
	| 404
	| 405
	| 409
	| 410
	| 422
	| 429
	| 500
	| 502
	| 503

/* -------------------------------------------------------------------------- */
/*                                    META                                    */
/* -------------------------------------------------------------------------- */

type TMeta = {
	page: number
	limit: number
	total: number
	totalPages: number
}

/* -------------------------------------------------------------------------- */
/*                                  PAYLOADS                                  */
/* -------------------------------------------------------------------------- */

type SuccessResponse<T> = {
	statusCode: SuccessStatusCode
	message?: string
	data?: T | null
	meta?: TMeta

	errors?: never
}

type NoContentResponse = {
	statusCode: NoContentStatusCode

	message?: never
	data?: never
	meta?: never
	errors?: never
}

type ErrorResponse = {
	statusCode: ErrorStatusCode

	message: string
	errors?: unknown

	data?: never
	meta?: never
}

type ResponsePayload<T> =
	| SuccessResponse<T>
	| NoContentResponse
	| ErrorResponse

/* -------------------------------------------------------------------------- */
/*                                 OVERLOADS                                  */
/* -------------------------------------------------------------------------- */

function sendResponse<T>(
	res: Response,
	payload: SuccessResponse<T>
): void

function sendResponse(
	res: Response,
	payload: NoContentResponse
): void

function sendResponse(
	res: Response,
	payload: ErrorResponse
): void

/* -------------------------------------------------------------------------- */
/*                              IMPLEMENTATION                                */
/* -------------------------------------------------------------------------- */

function sendResponse<T>(
	res: Response,
	payload: ResponsePayload<T>
): void {
	if (res.headersSent) {
		throw new Error(
			'sendResponse() called after headers were already sent.'
		)
	}

	switch (payload.statusCode) {
		case 204:
			res.status(204).end()
			return

		case 200:
		case 201:
		case 202: {
			const body: {
				success: true
				message: string
				data?: T | null
				meta?: TMeta
			} = {
				success: true,
				message: payload.message ?? 'Success'
			}

			if (payload.data !== undefined) {
				body.data = payload.data ?? null
			}

			if (payload.meta !== undefined) {
				body.meta = payload.meta
			}

			res.status(payload.statusCode).json(body)
			return
		}

		default: {
			const body = {
				success: false as const,
				message: payload.message,
				...(payload.errors !== undefined && {
					errors: payload.errors
				})
			}

			res.status(payload.statusCode).json(body)
			return
		}
	}
}

export default sendResponse