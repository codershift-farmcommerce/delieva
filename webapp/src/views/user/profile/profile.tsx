import { useState } from 'react'
import ViewContainer from 'src/components/views/container/container'
import ViewHeader from 'src/components/views/header/header'
import viewStyles from 'src/views/views.module.css'
import { AuthClient } from 'src/api/clients/auth'

const authClient = new AuthClient()

const UserProfile = () => {
  const [authorizationCode, setAuthorizationCode] = useState('')

  const getAuthorizationCode = async () => {
    const response = await authClient.generateAuthorizationCode({})
    setAuthorizationCode(response.code)
  }

  return (
    <ViewContainer title={'Mi Perfil'}>
      <ViewHeader>
        <div>
          <button className={viewStyles.primary_button} onClick={getAuthorizationCode}>
            Generar código de autorización
          </button>
          <div className={viewStyles.input}>{authorizationCode}</div>
        </div>
      </ViewHeader>
    </ViewContainer>
  )
}

export default UserProfile
