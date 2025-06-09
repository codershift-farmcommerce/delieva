import type { NextPage } from 'next'
import ChangePassword from 'src/views/auth/change_password/change_password'
import Base from 'src/pages/base'
import React from 'react'

const Index: NextPage = () => {
  return <Base View={<ChangePassword />} hideMenu={true} />
}

export default Index
