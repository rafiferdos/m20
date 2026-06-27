export interface IUser { 
  id: string
  name: string
  email: string
  password: string
  activeStatus: TActiveStatus
  role: TUserRole
}

type TActiveStatus = 'ACTIVE' | 'BLOCKED'
type TUserRole = 'USER' | 'AUTHOR'

export interface IUserRegisterPayload {
  name: string
  email: string
  password: string
  profilePhoto?: string
}