import { AuthEndpoints } from 'interface/endpoints/auth'
import {
  AuthChangePasswordRQ,
  AuthGenerateAuthorizationCodeRQ,
  AuthLoginRQ,
  AuthLogoutRQ,
} from 'interface/requests/auth'
import {
  AuthChangePasswordRS,
  AuthGenerateAuthorizationCodeRS,
  AuthLoginRS,
  AuthLogoutRS,
} from 'interface/responses/auth'
import { sendRequest } from '../request'

export class AuthClient implements AuthEndpoints {
  path(): 'auth' {
    return 'auth'
  }

  async login(req: AuthLoginRQ): Promise<AuthLoginRS> {
    return sendRequest('/auth/login', req)
  }

  logout(req: AuthLogoutRQ): Promise<AuthLogoutRS> {
    return sendRequest('/auth/logout', req)
  }

  changePassword(req: AuthChangePasswordRQ): Promise<AuthChangePasswordRS> {
    return sendRequest('/auth/changePassword', req)
  }

  generateAuthorizationCode(
    req: AuthGenerateAuthorizationCodeRQ,
  ): Promise<AuthGenerateAuthorizationCodeRS> {
    return sendRequest('/auth/generateAuthorizationCode', req)
  }
}
