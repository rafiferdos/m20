

/* ------------------------------------------------------------------ */
/*  Global error handler — Express 5 signature (err is unknown).      */
/*  Catches everything: AppError throws, unhandled Prisma errors,      */
/*  Zod parse failures, and plain unexpected bugs.                    */
/* ------------------------------------------------------------------ */

import type { NextFunction } from "express"
import { isAppError } from "./appError.js"
import { Prisma } from "@/generated/prisma/client.js"

const globalErrorHandler = (
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction
): void => {
	// ── 1. Known operational error — safe to expose ─────────────────
	if (isAppError(err)) {
		res.status(err.statusCode).json({
			success: false,
			message: err.message,
			...(err.errors !== undefined && { errors: err.errors })
		})
		return
	}

	// ── 2. Zod validation error — parse + normalise ─────────────────
	if (err instanceof ZodError) {
		res.status(422).json({
			success: false,
			message: 'Validation failed',
			errors: err.errors.map(e => ({
				field: e.path.join('.'),
				message: e.message
			}))
		})
		return
	}

	// ── 3. Prisma known request errors ──────────────────────────────
	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		// P2002 = unique constraint violation
		if (err.code === 'P2002') {
			const field = (err.meta?.target as string[] | undefined)?.join(', ') ?? 'field'
			res.status(409).json({
				success: false,
				message: `A record with this ${field} already exists.`
			})
			return
		}

		// P2025 = record not found (findUniqueOrThrow, updateOrThrow, etc.)
		if (err.code === 'P2025') {
			res.status(404).json({
				success: false,
				message: 'The requested record does not exist.'
			})
			return
		}
	}

	// ── 4. Everything else — unexpected bug ─────────────────────────
	//    NEVER expose internal details to the client in production.
	//    Log the full error internally (swap console.error for your
	//    logger — winston, pino, etc.)
	console.error('[UNHANDLED ERROR]', err)

	res.status(500).json({
		success: false,
		message:
			process.env.NODE_ENV === 'development' && err instanceof Error
				? err.message
				: 'Something went wrong. Please try again later.'
	})
}

export default globalErrorHandler