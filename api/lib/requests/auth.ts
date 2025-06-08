export type AuthLoginRQ = {
  email: string
  password: string
}

export type AuthChangePasswordRQ = {
  email: string
  oldPassword: string
  newPassword: string
}

export type AuthLogoutRQ = {
  sessionToken: string
}

export type AuthGenerateAuthorizationCodeRQ = {}
