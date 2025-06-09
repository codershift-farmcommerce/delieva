import styles from './change_password.module.css'
import { useState } from 'react'
import Router from 'next/router'
import { AuthClient } from 'webapp//api/clients/auth'
import { toast } from 'react-toastify'

const authClient = new AuthClient()

const ChangePassword = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [invalidCredentials, setInvalidCredentials] = useState(false)

  const onChangePassword = async (e: any) => {
    e.preventDefault()
    try {
      const response = await authClient.changePassword({
        email,
        oldPassword: password,
        newPassword,
      })
      if (response.success) {
        toast.dark('La contraseña ha sido modificada.')
        setTimeout(async () => {
          await Router.push('/')
        }, 2000)
      } else {
        setInvalidCredentials(true)
      }
    } catch (err) {
      toast.error('Ocurrió un error al modificar la contraseña.')
    }
  }

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.login_form}>
          <div className={styles.login_form_title}>Farm Commerce Cambio de Contraseña</div>
          <form autoComplete={'off'} onSubmit={onChangePassword}>
            <div className={styles.login_form_field}>
              <label className={styles.login_form_field_label} htmlFor={'email'}>
                Email:
              </label>
              <input
                id={'email'}
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
                Contraseña actual:
              </label>
              <input
                id={'password'}
                data-private={true}
                type={'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setInvalidCredentials(false)
                }}
                autoComplete={'new-password'}
              />
            </div>
            <div className={styles.login_form_field}>
              <label className={styles.login_form_field_label} htmlFor={'new_password'}>
                Nueva contraseña:
              </label>
              <input
                id={'new_password'}
                data-private={true}
                type={'password'}
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value)
                  setInvalidCredentials(false)
                }}
                autoComplete={'new-password'}
              />
            </div>
            <input
              type={'submit'}
              id={'loginButton'}
              className={styles.login_button}
              value={'Cambiar contraseña'}
            />
          </form>
          <div
            className={
              invalidCredentials ? styles.login_form_invalid_credentials_message : styles.hidden
            }
          >
            Usuario o contraseña no válidos.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
