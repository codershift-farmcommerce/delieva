import React, { createContext, useEffect, useState } from 'react'
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

export const UserContext = createContext<UserContextType>({ user: null, setUser: () => {} })

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Load user from local storage or API
    const loadUser = async () => {
      try {
        const userData = sessionStorage.getItem('user')
        if (userData) {
          setUser(JSON.parse(userData))
        }
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }
    loadUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
