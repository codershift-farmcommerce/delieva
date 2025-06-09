import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import LogRocket from 'logrocket'
import Base from './base'
import Home from '../views/home/home'
import Login from '../views/auth/login/login'
import { isProd } from '../components/functions/constants'

const Index: NextPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  useEffect(() => {
    setIsLoggedIn(!!sessionStorage.getItem('session_token'))
  })

  if (isLoggedIn) {
    if (isProd) {
      LogRocket.init('vezxpb/farmcommerce')
    }
    return <Base View={<Home />} />
  }
  return <Base View={<Login />} hideMenu={true} />
}

export default Index
