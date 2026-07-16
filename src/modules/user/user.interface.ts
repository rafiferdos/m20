export interface IUser {
	id: string
	name: string
	email: string
	password: string
	activeStatus: TActiveStatus
	role: TUserRole
	profile: {
		profilePhoto: string | null
		bio: string | null
	}
	createdAt: Date
	updatedAt: Date
}

type TActiveStatus = 'ACTIVE' | 'BLOCKED'
type TUserRole = 'USER' | 'AUTHOR' | 'ADMIN'

export interface IUserRegisterPayload {
	name: string
	email: string
	password: string
	profilePhoto?: string
}

export interface IUserRole {
	role: TUserRole
}
