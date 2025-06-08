import Router from 'next/router'
import * as crypto from 'crypto'

export async function sendRequest(path: string, body?: any) {
  const requestId = crypto.randomBytes(10).toString('hex') || ''
  const sessionToken = sessionStorage.getItem('session_token') || ''
  const traceId = sessionStorage.getItem('trace_id') || ''
  const tenant = window.location.hostname.split('.')[0];

  const response = await fetch('/api' + path, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': sessionToken,
      'x-request-id': requestId,
      'x-trace-id': traceId,
      'x-tenant': tenant,
    },
  })
  await handleExpiredToken(path, response)
  const contentType = response.headers.get('content-type')
  if (contentType === 'application/force-download') {
    return response.body
  }
  if (contentType === 'application/zip') {
    return response.blob()
  }
  return response.json()
}

async function handleExpiredToken(path: string, response: Response) {
  if (response.status === 401 && !path.startsWith('/auth')) {
    sessionStorage.removeItem('session_token')
    sessionStorage.removeItem('trace_id')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('session_start')

    await Router.push('/?redirect=' + Router.pathname)
  }
}

export async function sendFile(path: string, formData: FormData) {
  const response = await fetch('/api' + path, {
    method: 'post',
    body: formData,
    headers: {
      'x-session-token': sessionStorage.getItem('session_token') || '',
    },
  })
  await handleExpiredToken(path, response)
  return response.json()
}
