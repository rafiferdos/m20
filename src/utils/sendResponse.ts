import type { Response } from 'express'

type TMeta = {
	page: number
	limit: number
	total: number
	totalPages: number
}

type TSuccessResponse<T> = {
	statusCode: number
	message?: string
	data?: T | null
	meta?: TMeta
}

type TErrorResponse = {
	statusCode: number
	message: string
	errors?: unknown
}

type TResponsePayload<T> = TSuccessResponse<T> | TErrorResponse

const sendResponse = <T>(res: Response, payload: TResponsePayload<T>): void => {
	const { statusCode, message } = payload
	const success = statusCode >= 200 && statusCode < 300

	// Base shape — no extra null fields on success
	const body: Record<string, unknown> = {
		success,
		message: message ?? (success ? 'Success' : 'Failed')
	}

	if (success) {
		body.data = 'data' in payload ? (payload.data ?? null) : null
	}

	if ('meta' in payload && payload.meta) {
		body.meta = payload.meta
	}

	// errors field শুধু error response এ
	if (!success && 'errors' in payload && payload.errors !== undefined) {
		body.errors = payload.errors
	}

	res.status(statusCode).json(body)
}

export default sendResponse
