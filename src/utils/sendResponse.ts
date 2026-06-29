import type { Response } from 'express'

/* ------------------------------------------------------------------ */
/*  1. LITERAL STATUS CODE UNIONS — independent of any 3rd-party lib   */
/*     (many `http-status` typings widen to `number`, which would     */
/*      silently kill the overload-narrowing below. Don't trust it.)  */
/* ------------------------------------------------------------------ */

type SuccessStatusCode = 200 | 201 | 202 | 204
type ErrorStatusCode = 400 | 401 | 403 | 404 | 405 | 409 | 410 | 422 | 429 | 500 | 502 | 503

/* ------------------------------------------------------------------ */
/*  2. DISCRIMINATED PAYLOAD SHAPES                                   */
/* ------------------------------------------------------------------ */

type TMeta = {
	page: number
	limit: number
	total: number
	totalPages: number
}

type TSuccessResponse<T> = {
	statusCode: SuccessStatusCode
	message?: string
	data?: T | null
	meta?: TMeta
	errors?: never // <-- explicitly forbidden, kills excess-property loopholes from spread objects
}

type TErrorResponse = {
	statusCode: ErrorStatusCode
	message: string // required — never ship an error without a message
	errors?: unknown
	data?: never // <-- explicitly forbidden
	meta?: never
}

/* ------------------------------------------------------------------ */
/*  3. RUNTIME-SAFE STATUS GUARD                                      */
/*     statusCode often arrives via a variable (e.g. status.OK from   */
/*     a loosely-typed lib), so TS narrowing can be bypassed at       */
/*     runtime. This guard is O(1), no allocations, no regex.         */
/* ------------------------------------------------------------------ */

const isSuccessCode = (code: number): boolean => code >= 200 && code < 300

/* ------------------------------------------------------------------ */
/*  4. OVERLOAD SIGNATURES — this is the ONLY public API surface.     */
/*     Callers literally cannot construct an invalid combination;     */
/*     TS picks the matching overload by statusCode literal, then     */
/*     excess-property-checks the object literal against it.         */
/* ------------------------------------------------------------------ */

function sendResponse<T = unknown>(res: Response, payload: TSuccessResponse<T>): void
function sendResponse(res: Response, payload: TErrorResponse): void

/* ------------------------------------------------------------------ */
/*  5. IMPLEMENTATION — not part of the public type surface, so it    */
/*     can be as loose internally as it needs to be without weakening */
/*     what callers see.                                              */
/* ------------------------------------------------------------------ */

function sendResponse<T = unknown>(res: Response, payload: TSuccessResponse<T> | TErrorResponse): void {
	// Fail fast with a clear message instead of letting Express crash later
	// with the cryptic "Cannot set headers after they are sent" error.
	if (res.headersSent) {
		throw new Error('sendResponse called after headers were already sent for this response')
	}

	const { statusCode, message } = payload
	const success = isSuccessCode(statusCode)

	if (success) {
		const { data, meta } = payload as TSuccessResponse<T>

		// 204 No Content MUST NOT carry a body — sending one here would
		// violate HTTP semantics and confuse strict clients/proxies.
		if (statusCode === 204) {
			res.status(204).end()
			return
		}

		// Single object literal — V8 builds this as one shape (hidden class)
		// instead of incrementally mutating a Record, which is friendlier
		// for JSON.stringify downstream than megamorphic property writes.
		res.status(statusCode).json({
			success: true,
			message: message ?? 'Success',
			...(data !== undefined ? { data: data ?? null } : {}),
			...(meta ? { meta } : {})
		})
		return
	}

	const { errors } = payload as TErrorResponse
	res.status(statusCode).json({
		success: false,
		message,
		...(errors !== undefined ? { errors } : {})
	})
}

export default sendResponse