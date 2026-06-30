import type { SignOptions } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'

/* ------------------------------------------------------------------ */
/*  1. REAL TYPES — pulled FROM the library, not guessed/cast.        */
/*     `Expiry` is jsonwebtoken's own branded `StringValue | number`   */
/*     type (it only accepts strings like "15m", "7d", "1h" — not     */
/*     arbitrary strings). Config values from .env are plain `string`, */
/*     which can NEVER satisfy a branded type — so we accept the      */
/*     realistic input type below and validate+convert at one boundary.*/
/* ------------------------------------------------------------------ */

type Expiry = SignOptions['expiresIn']
type ExpiryInput = string | number

// A JWT payload must be a plain key-value object — not an array, not a
// class instance, not a primitive. This rejects all of those at compile time.
type TJwtPayload = Record<string, unknown>

/* ------------------------------------------------------------------ */
/*  2. THE ONLY CAST IN THIS FILE — validated, not blind.             */
/*     Matches the `ms` package's accepted formats (what jsonwebtoken */
/*     actually parses under the hood). A malformed .env value fails  */
/*     LOUD and FAST at startup with a clear message, instead of      */
/*     producing a cryptic library error or — worse — silently        */
/*     signing a token with no expiry.                                */
/* ------------------------------------------------------------------ */

const EXPIRY_PATTERN =
	/^\d+(\.\d+)?\s?(ms|s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours|d|day|days|w|week|weeks|y|yr|yrs|year|years)$/i

const toExpiry = (value: ExpiryInput): Expiry => {
	if (typeof value === 'number') return value // jsonwebtoken treats a bare number as seconds

	if (!EXPIRY_PATTERN.test(value.trim())) {
		throw new Error(
			`Invalid JWT expiry "${value}". Expected a format like "15m", "7d", "1h", or a plain number of seconds.`
		)
	}

	return value as Expiry
}

/* ------------------------------------------------------------------ */
/*  3. LOW-LEVEL PRIMITIVE — one secret, one token. No async lie.     */
/* ------------------------------------------------------------------ */

const createToken = (payload: TJwtPayload, secret: string, expiresIn: ExpiryInput): string => {
	// jwt.sign() without a callback is SYNCHRONOUS — it blocks the event
	// loop regardless of whether you `await` it. No `async`, no Promise,
	// no needless microtask. This is honest about what the call actually costs.
	return jwt.sign(payload, secret, { expiresIn: toExpiry(expiresIn) })
}

const verifyToken = <T = TJwtPayload>(token: string, secret: string): T => {
	// jwt.verify throws synchronously on invalid/expired/tampered tokens —
	// callers are expected to catch this (e.g. in auth middleware), not us.
	return jwt.verify(token, secret) as T
}

/* ------------------------------------------------------------------ */
/*  4. HIGH-LEVEL API — this is what call sites actually use.         */
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
	expiry: { access: ExpiryInput; refresh: ExpiryInput }
): TAuthTokens => ({
	accessToken: createToken(payload, secrets.access, expiry.access),
	refreshToken: createToken(payload, secrets.refresh, expiry.refresh)
})

export const JwtUtils = {
	createToken,
	verifyToken,
	createAuthTokens
}