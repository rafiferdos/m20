/* ------------------------------------------------------------------ */
/*  AppError — the ONE error class the entire app throws intentionally */
/*                                                                    */
/*  Key concept: isOperational                                        */
/*  ─────────────────────────────────────────────────────────────────  */
/*  true  → known, expected error (404, 401, validation fail…)       */
/*          global handler can safely expose message + errors to client*/
/*                                                                    */
/*  false → unexpected bug / programmer error / library crash         */
/*          global handler must hide details and send generic 500     */
/*                                                                    */
/*  Plain `Error` objects (from libraries, runtime crashes etc.)      */
/*  are NEVER isOperational — the handler checks `instanceof AppError`*/
/*  and treats everything else as a hidden internal failure.          */
/* ------------------------------------------------------------------ */

type TAppErrorOptions = {
	// Optional structured error details — e.g. Zod/Prisma validation issues.
	// Typed `unknown` so callers don't have to cast; the global handler
	// decides how to serialize it.
	errors?: unknown

	// Pass the original cause for internal logging (stack chain, not exposed
	// to client). Mirrors the native `Error` options.cause pattern.
	cause?: unknown
}

export class AppError extends Error {
	readonly statusCode: number
	readonly isOperational: true = true // always true — that's the whole point of this class
	readonly errors?: unknown

	constructor(statusCode: number, message: string, options: TAppErrorOptions = {}) {
		super(message, { cause: options.cause })

		this.statusCode = statusCode
		this.errors = options.errors

		// Restore the correct prototype chain — required when extending
		// built-in classes (Error, Array, Map…) in TypeScript targeting ES5/ES2015.
		// Without this, `instanceof AppError` returns false after transpilation.
		Object.setPrototypeOf(this, new.target.prototype)

		// Remove AppError constructor itself from the stack trace — the
		// relevant frame is always the throw site, not this constructor.
		Error.captureStackTrace(this, this.constructor)
	}
}

/* ------------------------------------------------------------------ */
/*  Type guard — use this in the global error handler to branch       */
/*  between operational errors (expose) and bugs (hide + log).       */
/*                                                                    */
/*  if (isAppError(err)) → send err.statusCode + err.message + errors */
/*  else                 → log internally, send generic 500            */
/* ------------------------------------------------------------------ */

export const isAppError = (err: unknown): err is AppError => err instanceof AppError