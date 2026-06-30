import type { SignOptions } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'

/* ------------------------------------------------------------------ */
/*  1. REAL TYPES — pulled FROM the library, not guessed/cast.        */
/*     `Expiry` is whatever jsonwebtoken's own SignOptions says        */
/*     `expiresIn` accepts (string | number) — so if the library ever  */
/*     changes it, this stays correct with zero edits here.            */
/* ------------------------------------------------------------------ */

type Expiry = SignOptions['expiresIn']

// A JWT payload must be a plain key-value object — not an array, not a
// class instance, not a primitive. This rejects all of those at compile time.
type TJwtPayload = Record<string, unknown>

/* ------------------------------------------------------------------ */
/*  2. LOW-LEVEL PRIMITIVE — one secret, one token. No async lie.     */
/* ------------------------------------------------------------------ */

const createToken = (payload: TJwtPayload, secret: string, expiresIn: Expiry): string => {
	// jwt.sign() without a callback is SYNCHRONOUS — it blocks the event
	// loop regardless of whether you `await` it. No `async`, no Promise,
	// no needless microtask. This is honest about what the call actually costs.
	return jwt.sign(payload, secret, { expiresIn })
}

const verifyToken = <T = TJwtPayload>(token: string, secret: string): T => {
	// jwt.verify throws synchronously on invalid/expired/tampered tokens —
	// callers are expected to catch this (e.g. in auth middleware), not us.
	return jwt.verify(token, secret) as T
}

/* ------------------------------------------------------------------ */
/*  3. HIGH-LEVEL API — this is what call sites actually use.         */
/*     Access + refresh secrets/expiries are passed as LABELED        */
/*     objects, not positional args — so swapping access<->refresh    */
/*     by mistake is structurally impossible, not just "unlikely".    */
/* ------------------------------------------------------------------ */

type TAuthTokens = {
	accessToken: string
	refreshToken: string
}

const createAuthTokens = (
	payload: TJwtPayload,
	secrets: { access: string; refresh: string },
	expiry: { access: Expiry; refresh: Expiry }
): TAuthTokens => ({
	accessToken: createToken(payload, secrets.access, expiry.access),
	refreshToken: createToken(payload, secrets.refresh, expiry.refresh)
})

export const JwtUtils = {
	createToken,
	verifyToken,
	createAuthTokens
}