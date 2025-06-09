import keyBy from 'lodash.keyby'
import ViewContainer from 'webapp/src/components/views/container/container'
import ViewHeader from 'webapp/src/components/views/header/header'
import styles from './users.module.css'
import Table from 'webapp/src/components/table/table'
import { UserRole, UserWithRoles } from 'interface/entities/user'
import { useEffect, useRef, useState } from 'react'
import { UserManagementClient } from 'webapp/src/api/clients/user_management'
import ViewHeaderForm from 'webapp/src/components/views/header_form/header_form'
import UserRoleDropdownSearchBox from 'webapp/src/components/user_role_dropdown_search_box/user_role_dropdown_search_box'
import { toast } from 'react-toastify'
import ViewBody from 'webapp/src/components/views/body/body'

const userManagementClient = new UserManagementClient()

type UserByEmail = {
  [email: string]: UserWithRoles
}

const Users = () => {
  const [userList, setUserList] = useState([] as UserWithRoles[])
  const [usersByEmail, setUsersByEmail] = useState({} as UserByEmail)
  const [selectedUserEmail, setSelectedUserEmail] = useState('')
  const [newUserFormEnabled, setNewUserFormEnabled] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState('')
  const [resetPasswordFormEnabled, setResetPasswordFormEnabled] = useState(false)
  const [resetPasswordNewPassword, setResetPasswordNewPassword] = useState('')
  const resetPasswordInputRef = useRef<HTMLInputElement>(null)
  const newUserInputRef = useRef<HTMLInputElement>(null)

  const fetchUserList = async () => {
    const response = await userManagementClient.listUsers({})
    setUserList(response.data)
    setUsersByEmail(keyBy(response.data, 'email'))
  }

  useEffect(() => {
    fetchUserList().catch(console.error)
  }, [])

  useEffect(() => {
    if (newUserFormEnabled) {
      newUserInputRef?.current?.focus()
    }
  }, [newUserFormEnabled])

  useEffect(() => {
    if (resetPasswordFormEnabled) {
      resetPasswordInputRef?.current?.focus()
    }
  }, [resetPasswordFormEnabled])

  const onSelectedUser = (id: string) => {
    if (id === selectedUserEmail) {
      setSelectedUserEmail('')
    } else {
      setSelectedUserEmail(id)
    }
    setResetPasswordFormEnabled(false)
  }

  const onEnableNewUserForm = () => {
    setNewUserFormEnabled(true)
  }

  const onEnableResetPasswordForm = () => {
    setResetPasswordFormEnabled(true)
  }

  const onResetPasswordCanceled = () => {
    setResetPasswordFormEnabled(false)
    setResetPasswordNewPassword('')
  }

  const onResetPassword = async () => {
    try {
      const response = await userManagementClient.resetUserPassword({
        email: selectedUserEmail,
        temporaryPassword: resetPasswordNewPassword,
      })
      if (response.success) {
        toast.dark('La contraseña ha sido modificada.')
      } else {
        toast.error('Ocurrió un error al modificar la contraseña.')
      }
    } catch (err) {
      toast.error('Ocurrió un error al modificar la contraseña.')
    }
    setResetPasswordFormEnabled(false)
  }

  const onCreateUserCanceled = () => {
    setNewUserFormEnabled(false)
    setNewUserName('')
    setNewUserEmail('')
    setNewUserPassword('')
  }

  const onCreateUser = async () => {
    try {
      const response = await userManagementClient.createUser({
        name: newUserName,
        email: newUserEmail,
        temporaryPassword: newUserPassword,
        role: newUserRole,
      })
      if (response.success) {
        toast.dark('El usuario ha sido registrado.')
      } else {
        toast.error('Ocurrió un error al crear el usuario.')
      }
    } catch (err) {
      toast.error('Ocurrió un error al crear el usuario.')
    }
    setNewUserFormEnabled(false)
    await fetchUserList()
    setNewUserName('')
    setNewUserEmail('')
    setNewUserPassword('')
  }

  const onEnableUser = async () => {
    if (!confirm('Desea habilitar el usuario?')) {
      return
    }
    try {
      const response = await userManagementClient.enableUser({
        email: selectedUserEmail,
      })
      if (response.success) {
        toast.dark('El usuario ha sido habilitado.')
      } else {
        toast.error('Ocurrió un error al habilitar el usuario.')
      }
    } catch (err) {
      toast.error('Ocurrió un error al habilitar el usuario.')
    }
    await fetchUserList()
  }

  const onDisableUser = async () => {
    if (!confirm('Desea deshabilitar el usuario?')) {
      return
    }
    try {
      const response = await userManagementClient.disableUser({
        email: selectedUserEmail,
      })
      if (response.success) {
        toast.dark('El usuario ha sido deshabilitado.')
      } else {
        toast.error('Ocurrió un error al deshabilitar el usuario.')
      }
    } catch (err) {
      toast.error('Ocurrió un error al deshabilitar el usuario.')
    }
    await fetchUserList()
  }

  const userListForTable =
    userList &&
    userList.map((user: UserWithRoles) => ({
      id: String(user.email),
      cells: [
        {
          value: user.name,
        },
        {
          value: user.email,
        },
        {
          value: user.roles.join(', '),
        },
        {
          value: user.enabled ? 'Habilitado' : 'Deshabilitado',
        },
      ],
    }))

  return (
    <ViewContainer title={'Usuarios'}>
      <ViewHeader flexDirection={'column'}>
        <div>
          <button
            disabled={newUserFormEnabled || resetPasswordFormEnabled}
            className={styles.header_button}
            onClick={onEnableNewUserForm}
          >
            Agregar nuevo usuario
          </button>
          <button
            disabled={selectedUserEmail === '' || resetPasswordFormEnabled || newUserFormEnabled}
            className={styles.header_button}
            onClick={onEnableResetPasswordForm}
          >
            Reestablecer contraseña
          </button>

          <button
            disabled={selectedUserEmail === '' || !usersByEmail[selectedUserEmail].enabled}
            className={styles.header_button}
            onClick={onDisableUser}
          >
            Deshabilitar
          </button>
          <button
            disabled={selectedUserEmail === '' || usersByEmail[selectedUserEmail].enabled}
            className={styles.header_button}
            onClick={onEnableUser}
          >
            Habilitar
          </button>
        </div>
        <>
          {resetPasswordFormEnabled && (
            <ViewHeaderForm
              fields={[
                {
                  type: 'password',
                  label: 'Contraseña temporal',
                  value: resetPasswordNewPassword,
                  onChange: e => {
                    setResetPasswordNewPassword(e.target.value)
                  },
                  ref: resetPasswordInputRef,
                },
              ]}
              submitAction={{
                action: onResetPassword,
              }}
              cancelAction={{
                action: onResetPasswordCanceled,
              }}
            />
          )}
          {newUserFormEnabled && (
            <ViewHeaderForm
              fields={[
                {
                  label: 'Nombre',
                  value: newUserName,
                  onChange: e => {
                    setNewUserName(e.target.value)
                  },
                  ref: newUserInputRef,
                },
                {
                  label: 'Email',
                  value: newUserEmail,
                  onChange: e => {
                    setNewUserEmail(e.target.value)
                  },
                },
                {
                  type: 'password',
                  label: 'Contraseña temporal',
                  value: newUserPassword,
                  onChange: e => {
                    setNewUserPassword(e.target.value)
                  },
                },
                <UserRoleDropdownSearchBox
                  label={'Rol'}
                  onRoleSelected={(roleCode: string) => {
                    setNewUserRole(roleCode)
                  }}
                />,
              ]}
              submitAction={{
                action: onCreateUser,
              }}
              cancelAction={{
                action: onCreateUserCanceled,
              }}
            />
          )}
        </>
      </ViewHeader>
      <ViewBody>
        <Table
          tableTitle={'Usuarios'}
          selectedRowId={selectedUserEmail}
          columnNames={['Nombre', 'Email', 'Roles', 'Estado']}
          rows={userListForTable}
          onSelectedRow={onSelectedUser}
        />
      </ViewBody>
    </ViewContainer>
  )
}

export default Users
