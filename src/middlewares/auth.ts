import config from '@/config/index.js'
import type { Role } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import catchAsync from '@/utils/catchAsync.js'
import JwtUtils from '@/utils/jwt.js'
import type { NextFunction, Request, Response } from 'express'
import status from 'http-status'

type TVerifyResult<T> = { ok: true; data: T } | { ok: false; error: string }

/* ------------------------------------------------------------------ */
/*  1. APP-SPECIFIC JWT PAYLOAD SHAPE                                 */
/*     Not `JwtPayload` from jsonwebtoken — that has [key: string]:   */
/*     any, so undefined fields pass through silently. This is the    */
/*     exact shape we sign, so we own and control it entirely.        */
/* ------------------------------------------------------------------ */

type TAccessTokenPayload = {
	id: string
	email: string
	name: string
	role: Role
}

/* ------------------------------------------------------------------ */
/*  2. TOKEN EXTRACTION — strict, no fallback loophole                */
/*     Only two valid locations: httpOnly cookie OR Bearer header.    */
/*     Raw Authorization without "Bearer " prefix → rejected.         */
/* ------------------------------------------------------------------ */

const extractToken = (req: Request): string | null => {
	if (req.cookies?.accessToken) return req.cookies.accessToken as string

	const authHeader = req.headers.authorization
	if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)

	return null
}

/* ------------------------------------------------------------------ */
/*  3. AUTH MIDDLEWARE FACTORY                                         */
/*                                                                    */
/*  Use case:                                                          */
/*    router.get('/me', auth(), getMe)                                */
/*    router.delete('/user', auth('ADMIN'), deleteUser)               */
/*    router.post('/post', auth('ADMIN', 'MODERATOR'), createPost)    */
/* ------------------------------------------------------------------ */

export const auth = (...roles: Role[]) =>
	catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
		// ── Step 1: token present? ──────────────────────────────────────
		const token = extractToken(req)
		if (!token)
			throw new AppError(
				status.UNAUTHORIZED,
				'No token provided. Please log in.'
			)

		// ── Step 2: token valid? ────────────────────────────────────────
		//    Explicit type annotation here because TypeScript resolves
		//    generics on object-literal methods at definition time, not
		//    call time — without this, `result` loses its discriminated
		//    union shape and .ok / .data / .error become invisible.
		const result: TVerifyResult<TAccessTokenPayload> = JwtUtils.verifyToken(
			token,
			config.jwtSecret
		)
		if (!result.ok)
			throw new AppError(
				status.UNAUTHORIZED,
				`Invalid or expired token: ${result.error}`
			)

		const { id, role } = result.data

		// ── Step 3: role allowed? ───────────────────────────────────────
		//    Check BEFORE the DB query — rejects wrong-role requests
		//    without paying for a round-trip.
		if (roles.length && !roles.includes(role))
			throw new AppError(
				status.FORBIDDEN,
				'You do not have permission to perform this action.'
			)

		// ── Step 4: user still exists + not blocked? ────────────────────
		//    Query by `id` only — the sole guaranteed unique field.
		//    name + role are NOT unique in Prisma; including them in
		//    findUnique's where causes PrismaClientValidationError at runtime.
		const user = await prisma.user.findUnique({ where: { id } })

		if (!user)
			throw new AppError(status.UNAUTHORIZED, 'This account no longer exists.')

		if (user.activeStatus === 'BLOCKED')
			throw new AppError(
				status.FORBIDDEN,
				'Your account has been blocked. Please contact support.'
			)

		// ── Step 5: attach clean user to request ───────────────────────
		req.user = {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role
		}

		next()
	})
