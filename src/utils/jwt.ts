import type { SignOptions } from 'jsonwebtoken'
import jwt from 'jsonwebtoken'

const createToken = async (
	payload: object,
	secret: string,
	expiresIn: string
) => {
	const token = await jwt.sign(payload, secret, { expiresIn } as SignOptions)
	return token
}

export const JwtUtils = {
	createToken
}
