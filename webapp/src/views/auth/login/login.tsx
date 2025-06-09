import LogRocket from 'logrocket'
import styles from './login.module.css'
import { useEffect, useState } from 'react'
import Router from 'next/router'
import crypto from 'crypto'
import { AuthClient } from 'webapp//api/clients/auth'
import { isProd } from 'webapp//components/functions/constants'
const authClient = new AuthClient()

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [invalidCredentials, setInvalidCredentials] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('trace_id', crypto.randomBytes(10).toString('hex') || '')
  }, [])

  const onLogin = (e: any) => {
    e.preventDefault()
    const fetchData = async () => {
      return authClient.login({
        email: email.trim(),
        password: password.trim(),
      })
    }
    fetchData()
      .then(response => {
        if (response.success) {
          if (response.user.must_change_password) {
            Router.push('/auth/change_password')
          } else {
            if (isProd) {
              LogRocket.identify(String(response.user.id), {
                name: response.user.name,
                email: response.user.email,
              })
            }
            sessionStorage.setItem('session_token', response.sessionToken)
            sessionStorage.setItem('user', JSON.stringify(response.user))
            sessionStorage.setItem('session_start', new Date().getTime().toString())
            const toPath = Router.query?.['redirect'] ?? ''
            Router.push('/' + toPath)
          }
        } else {
          setInvalidCredentials(true)
        }
      })
      .catch(console.error)
  }

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.login_form}>
          <div className={styles.login_form_title}>Farm Commerce Login</div>
          <form autoComplete={'off'} onSubmit={onLogin}>
            <div className={styles.login_form_field}>
              <label className={styles.login_form_field_label} htmlFor={'email'}>
                Email:
              </label>
              <input
                id={'email'}
                className={styles.login_form_field_input}
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setInvalidCredentials(false)
                }}
                autoComplete={'new-password'}
              />
            </div>
            <div className={styles.login_form_field}>
              <label className={styles.login_form_field_label} htmlFor={'password'}>
                Contraseña:
              </label>
              <input
                id={'password'}
                data-private={true}
                className={styles.login_form_field_input_password}
                type={'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setInvalidCredentials(false)
                }}
                autoComplete={'new-password'}
              />
            </div>
            <input
              type={'submit'}
              id={'loginButton'}
              className={styles.login_button}
              value={'Ingresar'}
            />
            <div
              className={
                invalidCredentials ? styles.login_form_invalid_credentials_message : styles.hidden
              }
            >
              Usuario o contraseña no válidos.
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
