import { UserWithRoles } from '../entities/user'

type SuccessAuthLoginRS = {
  success: true
  sessionToken: string
  user: UserWithRoles
}

type FailedAuthLoginRS = {
  success: false
}

export type AuthLoginRS = SuccessAuthLoginRS | FailedAuthLoginRS

export type AuthChangePasswordRS = {
  success: boolean
}

export type AuthLogoutRS = {
  success: boolean
}

export type AuthGenerateAuthorizationCodeRS = {
  code: string
}
