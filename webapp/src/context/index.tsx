import React from 'react'
import { UserProvider } from './user'

export function ContextProvider({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}
