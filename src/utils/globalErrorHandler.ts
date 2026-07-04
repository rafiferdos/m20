import { Prisma } from '@/generated/prisma/client.js'
import type { NextFunction, Request, Response } from 'express'
import { isAppError } from './appError.js'

/* ------------------------------------------------------------------ */
/*  Global error handler — Express 5 compatible.                      */
/*                                                                    */
/*  IMPORTANT: res.status() is now typed as a `number` property in   */
/*  Express 5's type definitions, not a callable method. We use       */
/*  `res.statusCode = X` (inherited from Node's http.ServerResponse)  */
/*  followed by `res.json(...)` — this is the correct Express 5 way. */
/* ------------------------------------------------------------------ */

const globalErrorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
	// ── 1. Known operational error — safe to expose ─────────────────
	if (isAppError(err)) {
		res.statusCode = err.statusCode
		res.json({
			success: false,
			message: err.message,
			...(err.errors !== undefined && { errors: err.errors })
		})
		return
	}

	// ── 2. Prisma unique constraint violation (P2002) ────────────────
	if (
		err instanceof Prisma.PrismaClientKnownRequestError &&
		err.code === 'P2002'
	) {
		const field =
			(err.meta?.target as string[] | undefined)?.join(', ') ?? 'field'
		res.statusCode = 409
		res.json({
			success: false,
			message: `A record with this ${field} already exists.`
		})
		return
	}

	// ── 3. Prisma record not found (P2025) ───────────────────────────
	//    findUniqueOrThrow, updateOrThrow, deleteOrThrow all throw this.
	if (
		err instanceof Prisma.PrismaClientKnownRequestError &&
		err.code === 'P2025'
	) {
		res.statusCode = 404
		res.json({
			success: false,
			message: 'The requested record does not exist.'
		})
		return
	}

	// ── 4. Everything else — unexpected bug ─────────────────────────
	//    NEVER expose internals in production. Log the full error with
	//    your logger (winston, pino…) — swap console.error when ready.
	console.error(`[UNHANDLED ERROR] ${new Date().toISOString()}`, err)

	res.statusCode = 500
	res.json({
		success: false,
		message:
			process.env.NODE_ENV === 'development' && err instanceof Error ?
				err.message
			:	'Something went wrong. Please try again later.'
	})
}

export default globalErrorHandler
