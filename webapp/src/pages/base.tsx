import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { useIdleTimer } from 'react-idle-timer'
import 'react-toastify/dist/ReactToastify.css'
import { useQRCode } from 'next-qrcode'
import Head from 'next/head'
import styles from './styles/base.module.css'
import Home from '../views/home/home'
import Menu from '../views/menu/menu'
import Router from 'next/router'
import { logout } from '../components/functions/session'
import type { NextPage } from 'next'

export type BaseProps = {
  View: React.ComponentType<any>
  isLoggedIn: boolean
  hideMenu?: boolean
}

const SessionTimeoutWhitelist = ['/manufacturing/orders_board', '/']

const Base = ({ View, isLoggedIn, hideMenu }: BaseProps): JSX.Element => {
  const [traceId, setTraceId] = useState('')
  const [qrCodeVisible, setQrCodeVisible] = useState(false)
  const [idleToastId, setIdleToastId] = useState<number | string>('')
  const [remaining, setRemaining] = useState<number>(0)

  const onIdle = async () => {
    if (!SessionTimeoutWhitelist.includes(Router.pathname)) {
      if (idleToastId) {
        toast.dismiss(idleToastId)
      }
      await logout()
      toast.warning('La sesión se ha cerrado por inactividad.')
    }
  }

  const onAction = () => {
    if (idleToastId) {
      toast.dismiss(idleToastId)
    }
  }

  const { getRemainingTime } = useIdleTimer({
    onIdle,
    onAction,
    timeout: 600_000,
    throttle: 500,
  })

  useEffect(() => {
    if (!SessionTimeoutWhitelist.includes(Router.pathname)) {
      const interval = setInterval(() => {
        setRemaining(Math.ceil(getRemainingTime() / 1000))
      }, 500)

      return () => {
        clearInterval(interval)
      }
    }
  })

  useEffect(() => {
    if (remaining === 60) {
      const toastId = toast.warning('La sesión se cerrará por inactividad.', {
        autoClose: false,
        position: 'top-center',
      })
      setIdleToastId(toastId)
    }
  }, [remaining])

  const { Image } = useQRCode()
  const ViewToRender = View || Home

  useEffect(() => {
    setTraceId(sessionStorage.getItem('trace_id') || '')
  }, [])

  const onHelpClick = () => {
    setQrCodeVisible(true)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <div className={styles.container}>
      <ToastContainer />
      <Head>
        <title>Farm Commerce - Delieva</title>
        <meta name="description" content="Farm Commerce - Delieva" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {!hideMenu && <Menu />}
      <main className={styles.main}>
        {React.createElement(View)}
      </main>

      <footer className={styles.footer}>
        <div>Codershift &copy; 2025</div>
        {traceId && (
          <>
            <div className={qrCodeVisible ? styles.footer_qr_code_container : styles.hidden}>
              <div className={styles.footer_qr_code}>
                <Image
                  text={traceId}
                  options={{
                    type: 'image/jpeg',
                    quality: 0.3,
                    margin: 3,
                    scale: 4,
                    width: 200,
                  }}
                />
              </div>
              <div className={styles.footer_qr_code_text}>
                {'Favor de enviar este código QR junto con la descripción del problema a '}
                <a href={'mailto:ayuda@scyadmin.com'}>ayuda@scyadmin.com</a>
              </div>
              <button
                className={styles.footer_qr_code_button}
                onClick={() => setQrCodeVisible(false)}
              >
                Cerrar
              </button>
            </div>
            {/*<div className={styles.help_text} onClick={() => onHelpClick()}>*/}
            {/* Ayuda*/}
            {/*</div>*/}
          </>
        )}
      </footer>
    </div>
  )
}

export default Base
