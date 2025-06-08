import {
  AuthChangePasswordRQ,
  AuthGenerateAuthorizationCodeRQ,
  AuthLoginRQ,
  AuthLogoutRQ,
} from 'lib/requests/auth'
import {
  AuthChangePasswordRS,
  AuthGenerateAuthorizationCodeRS,
  AuthLoginRS,
  AuthLogoutRS,
} from 'lib/responses/auth'

export interface AuthEndpoints {
  path(): 'auth'

  login(req: AuthLoginRQ): Promise<AuthLoginRS>

  changePassword(req: AuthChangePasswordRQ): Promise<AuthChangePasswordRS>

  logout(req: AuthLogoutRQ): Promise<AuthLogoutRS>

  generateAuthorizationCode(
    req: AuthGenerateAuthorizationCodeRQ,
  ): Promise<AuthGenerateAuthorizationCodeRS>
}
