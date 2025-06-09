import Router from 'next/router'
import { AuthClient }from 'src/api/clients/auth'

const authClient = new AuthClient()

export async function logout() {
  const sessionToken = sessionStorage.getItem('session_token')
  if (sessionToken) {
    await authClient.logout({ sessionToken })
    sessionStorage.removeItem('session_token')
    sessionStorage.removeItem('trace_id')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('session_start')
  }
  await Router.push('/')
}
