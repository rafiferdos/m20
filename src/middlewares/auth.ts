import config from '@/config/index.js'
import type { Role } from '@/generated/prisma/enums.js'
import { prisma } from '@/lib/prisma.js'
import { AppError } from '@/utils/appError.js'
import catchAsync from '@/utils/catchAsync.js'
import JwtUtils from '@/utils/jwt.js'
import type { NextFunction, Request, Response } from 'express'
import status from 'http-status'

/* ------------------------------------------------------------------ */
/*  Local mirror of VerifyResult from jwt.ts — inlined so auth.ts     */
/*  has zero import coupling to jwt's internal types. Must stay in     */
/*  sync with jwt.ts's VerifyResult shape manually.                   */
/* ------------------------------------------------------------------ */

type TVerifyResult<T> =
	| Readonly<{ ok: true; payload: T }>
	| Readonly<{
			ok: false
			error: { kind: 'expired' | 'not-before' | 'invalid'; message: string }
	  }>

/* ------------------------------------------------------------------ */
/*  App-specific JWT payload — exact shape we sign, we own it.        */
/*  Not JwtPayload from jsonwebtoken ([key: string]: any leaks).      */
/* ------------------------------------------------------------------ */

type TAccessTokenPayload = {
	id: string
	email: string
	name: string
	role: Role
}

/* ------------------------------------------------------------------ */
/*  Token extraction — strict, no fallback loophole.                  */
/*  Cookie first (httpOnly = safer), then Bearer header.              */
/*  Raw Authorization without "Bearer " prefix → null, not accepted.  */
/* ------------------------------------------------------------------ */

const extractToken = (req: Request): string | null => {
	const cookie = req.cookies?.accessToken as string | undefined

	if (cookie) {
		const result = JwtUtils.tryVerifyToken(cookie, config.jwtSecret)
		if (result.ok) return cookie
	}

	const authHeader = req.headers.authorization
	if (!authHeader) return null
	return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
}

/* ------------------------------------------------------------------ */
/*  Human-readable messages per error kind — never expose raw JWT     */
/*  library internals (e.g. "jwt expired") directly to the client.    */
/* ------------------------------------------------------------------ */

const TOKEN_ERROR_MESSAGES: Record<
	'expired' | 'not-before' | 'invalid',
	string
> = {
	expired: 'Your session has expired. Please log in again.',
	'not-before': 'Token is not yet valid. Please try again shortly.',
	invalid: 'Invalid token. Please log in again.'
}

/* ------------------------------------------------------------------ */
/*  Auth middleware factory                                            */
/*                                                                    */
/*  Use case:                                                          */
/*    router.get('/me',      auth(),               getMe)             */
/*    router.delete('/user', auth('ADMIN'),        deleteUser)        */
/*    router.post('/post',   auth('ADMIN', 'MOD'), createPost)        */
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
		//    tryVerifyToken returns a Result — no try/catch noise here.
		//    Explicit annotation because TypeScript resolves generics on
		//    object-literal methods at definition time, not call time.
		const result: TVerifyResult<TAccessTokenPayload> = JwtUtils.tryVerifyToken(
			token,
			config.jwtSecret
		)
		console.log('🚀 ~ auth ~ config.jwtSecret:', config.jwtSecret)

		if (!result.ok)
			throw new AppError(
				status.UNAUTHORIZED,
				TOKEN_ERROR_MESSAGES[result.error.kind]
			)

		const { id, role } = result.payload

		// ── Step 3: role allowed? ───────────────────────────────────────
		//    Before DB — wrong role gets rejected without a round-trip.
		if (roles.length && !roles.includes(role))
			throw new AppError(
				status.FORBIDDEN,
				'You do not have permission to perform this action.'
			)

		// ── Step 4: user exists + not blocked? ──────────────────────────
		//    Query by id only — the sole guaranteed unique field.
		//    Including name/role in findUnique where causes
		//    PrismaClientValidationError at runtime (not unique fields).
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
