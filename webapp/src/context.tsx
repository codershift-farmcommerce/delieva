import { createContext, useContext, useState } from 'react'

const Context = createContext({})

export function ContextProvider({ children }: { children: any }) {

  return <Context.Provider value={{}}>{children}</Context.Provider>
}

export function useCustomContext() {
  return useContext(Context)
}
