import React, { createContext, useEffect, useState, PropsWithChildren } from 'react'
import { Application } from 'interface'

export type User = {
  email: string
  name: string
  application: Application
}

type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
}

const defaultUserContext: UserContextType = {
  user: null,
  setUser: () => {}
}

export const UserContext = createContext<UserContextType>(defaultUserContext)
export const useUserContext = () => React.useContext(UserContext)

export const UserProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const userData = sessionStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error loading user:', error)
      return null
    }
  })

  useEffect(() => {
    const syncUser = () => {
      try {
        const userData = sessionStorage.getItem('user')
        setUser(userData ? JSON.parse(userData) : null)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }

    // Initial sync
    syncUser()

    // Listen for storage changes in other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'user') {
        syncUser()
      }
    })

    // Check for session expiry every minute
    const interval = setInterval(() => {
      const sessionStart = sessionStorage.getItem('session_start')
      if (!sessionStart) {
        setUser(null)
        return
      }

      const sessionAge = Date.now() - parseInt(sessionStart)
      if (sessionAge > 24 * 60 * 60 * 1000) { // 24 hours
        sessionStorage.clear()
        setUser(null)
      }
    }, 60000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const value = React.useMemo(() => ({ user, setUser }), [user])
  return React.createElement(UserContext.Provider, { value }, children)
}
