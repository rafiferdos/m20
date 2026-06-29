import type { ILoginUser } from './auth.interface.js'

const loginUserIntoDB = (payload: ILoginUser) => {
	const { email, password } = payload
}

export const AuthServices = {
	login: loginUserIntoDB
}
