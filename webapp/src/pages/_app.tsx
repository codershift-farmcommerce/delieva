import 'webapp/src/pages/styles/globals.css'
import { ContextProvider } from '../context'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  const AnyComponent = Component as any
  return (
    <ContextProvider>
      <AnyComponent {...pageProps} />
    </ContextProvider>
  )
}

export default MyApp
